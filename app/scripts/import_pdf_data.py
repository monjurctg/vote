#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
PDF Data Extraction and Import Script for Voter Data
Extracts voter information from PDFs and imports into MySQL database
"""

import pdfplumber
import pymysql
import os
import re
from datetime import datetime
from pathlib import Path

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '1234',
    'database': 'voter_data',
    'charset': 'utf8mb4'
}

# Base directory containing ward folders
BASE_DIR = "/Users/monjur/Documents/vote"

def get_db_connection():
    """Create database connection"""
    return pymysql.connect(**DB_CONFIG)

def extract_voter_data_from_pdf(pdf_path):
    """
    Extract voter data from a single PDF file
    Returns list of voter dictionaries
    """
    voters = []

    try:
        # Extract metadata from filename
        filename = os.path.basename(pdf_path)
        # Format: 150850_com_295_female_without_photo_17_2025-11-24.pdf
        parts = filename.replace('.pdf', '').split('_')
        area_code = parts[0] if len(parts) > 0 else ''
        gender = parts[3] if len(parts) > 3 else ''

        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages):
                text = page.extract_text()

                if not text:
                    continue

                # Extract ward information from first page
                if page_num == 0:
                    ward_match = re.search(r'ওয়াড(cid:\d+)?\s*নং[-\s]*(\d+)', text)
                    ward = f"ওয়ার্ড নং-{ward_match.group(2)}" if ward_match else "ওয়ার্ড নং-২৬"

                    # Extract area name
                    area_match = re.search(r'(cid:\d+)?\s*ভ়োটার\s*এলাকা\s+(.+?)(?:সব|$)', text, re.MULTILINE)
                    area_name = area_match.group(2).strip() if area_match else ""
                    area_name = re.sub(r'\(cid:\d+\)', '', area_name).strip()

                    # Extract total voters
                    total_match = re.search(r'(cid:\d+)?\s*মোট.*?(\d+)', text)
                    total_voters = int(total_match.group(2)) if total_match else 0

                # Try to extract table data
                tables = page.extract_tables()
                for table in tables:
                    for row in table:
                        if not row or len(row) < 3:
                            continue

                        # Skip header rows
                        if any(cell and ('ক্রমিক' in str(cell) or 'নাম' in str(cell)) for cell in row):
                            continue

                        # Extract voter information
                        # Table structure may vary, this is a basic extraction
                        voter = {
                            'ward': ward,
                            'area_code': area_code,
                            'area_name': area_name,
                            'serial_number': None,
                            'voter_name': None,
                            'father_name': None,
                            'mother_name': None,
                            'spouse_name': None,
                            'date_of_birth': None,
                            'age': None,
                            'gender': 'female' if 'female' in gender else 'male' if 'male' in gender else None,
                            'nid_number': None,
                            'address': None,
                            'pdf_source': pdf_path,
                            'total_voters_in_area': total_voters
                        }

                        # Parse cells based on available data
                        for i, cell in enumerate(row):
                            if not cell or cell.strip() == '':
                                continue

                            cell = str(cell).strip()

                            # Try to identify serial number (usually first column, numeric)
                            if i == 0 and cell.isdigit():
                                voter['serial_number'] = int(cell)

                            # Try to identify NID (long numeric string)
                            if re.match(r'^\d{10,20}$', cell):
                                voter['nid_number'] = cell

                            # Try to identify date (various formats)
                            date_patterns = [
                                r'(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})',
                                r'(\d{4})[/-](\d{1,2})[/-](\d{1,2})'
                            ]
                            for pattern in date_patterns:
                                date_match = re.search(pattern, cell)
                                if date_match:
                                    try:
                                        groups = date_match.groups()
                                        if len(groups[2]) == 2:  # Two-digit year
                                            year = int('19' + groups[2]) if int(groups[2]) > 50 else int('20' + groups[2])
                                        else:
                                            year = int(groups[2])

                                        if len(groups) == 3:
                                            if len(str(groups[0])) == 4:  # YYYY-MM-DD
                                                dob = datetime(year=int(groups[0]), month=int(groups[1]), day=int(groups[2]))
                                            else:  # DD-MM-YYYY
                                                dob = datetime(year=year, month=int(groups[1]), day=int(groups[0]))

                                            voter['date_of_birth'] = dob.strftime('%Y-%m-%d')
                                            voter['age'] = datetime.now().year - dob.year
                                    except:
                                        pass

                        # Only add if we have some meaningful data
                        if voter['serial_number'] or voter['voter_name'] or voter['nid_number']:
                            voters.append(voter)

    except Exception as e:
        print(f"❌ Error processing {pdf_path}: {e}")

    return voters

def import_voters_to_db(voters):
    """Import voter data to MySQL database"""
    if not voters:
        return 0

    connection = get_db_connection()
    cursor = connection.cursor()

    insert_query = """
        INSERT INTO voters (
            ward, area_code, area_name, serial_number, voter_name,
            father_name, mother_name, spouse_name, date_of_birth, age,
            gender, nid_number, address, pdf_source, total_voters_in_area
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
        )
    """

    inserted = 0
    for voter in voters:
        try:
            cursor.execute(insert_query, (
                voter['ward'],
                voter['area_code'],
                voter['area_name'],
                voter['serial_number'],
                voter['voter_name'],
                voter['father_name'],
                voter['mother_name'],
                voter['spouse_name'],
                voter['date_of_birth'],
                voter['age'],
                voter['gender'],
                voter['nid_number'],
                voter['address'],
                voter['pdf_source'],
                voter['total_voters_in_area']
            ))
            inserted += 1
        except Exception as e:
            print(f"  ⚠️  Error inserting voter: {e}")

    connection.commit()
    cursor.close()
    connection.close()

    return inserted

def process_all_pdfs(test_mode=False, max_files=None):
    """
    Process all PDF files in the ward directories

    Args:
        test_mode: If True, only process a few files for testing
        max_files: Maximum number of files to process (for testing)
    """
    print("\n" + "="*70)
    print("📄 PDF Data Extraction and Import")
    print("="*70)

    # Find all ward directories
    ward_dirs = []
    for item in os.listdir(BASE_DIR):
        item_path = os.path.join(BASE_DIR, item)
        if os.path.isdir(item_path) and item.startswith('WARD'):
            ward_dirs.append(item_path)

    if not ward_dirs:
        print(f"❌ No WARD directories found in: {BASE_DIR}")
        return

    print(f"\n📁 Found {len(ward_dirs)} ward directories:")
    for ward_dir in ward_dirs:
        print(f"   - {os.path.basename(ward_dir)}")

    # Find all PDF files from all wards
    pdf_files = []
    for ward_dir in ward_dirs:
        for root, dirs, files in os.walk(ward_dir):
            for file in files:
                if file.endswith('.pdf'):
                    pdf_files.append(os.path.join(root, file))

    if max_files:
        pdf_files = pdf_files[:max_files]

    print(f"\n📊 Found {len(pdf_files)} PDF files to process")

    if test_mode:
        print("🔬 Running in TEST MODE - processing limited files\n")

    total_voters = 0
    processed_files = 0

    for i, pdf_path in enumerate(pdf_files, 1):
        print(f"\n[{i}/{len(pdf_files)}] Processing: {os.path.basename(pdf_path)}")

        voters = extract_voter_data_from_pdf(pdf_path)

        if voters:
            inserted = import_voters_to_db(voters)
            total_voters += inserted
            print(f"  ✓ Extracted and imported {inserted} voters")
        else:
            print(f"  ⚠️  No voter data extracted")

        processed_files += 1

    print("\n" + "="*70)
    print(f"✅ Import Complete!")
    print(f"   Files processed: {processed_files}")
    print(f"   Total voters imported: {total_voters}")
    print("="*70 + "\n")

if __name__ == "__main__":
    import sys

    # Check if running in test mode
    test_mode = '--test' in sys.argv
    sample_count = None

    if '--sample' in sys.argv:
        try:
            idx = sys.argv.index('--sample')
            sample_count = int(sys.argv[idx + 1])
        except:
            sample_count = 5

    if test_mode or sample_count:
        print("\n⚠️  TEST MODE: Processing sample files only")
        process_all_pdfs(test_mode=True, max_files=sample_count or 2)
    else:
        response = input("\n⚠️  This will import ALL PDF data to the database. Continue? (yes/no): ")
        if response.lower() == 'yes':
            process_all_pdfs()
        else:
            print("❌ Import cancelled")
