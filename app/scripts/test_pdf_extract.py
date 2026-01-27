#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import pdfplumber
import sys

# Sample PDF to test
pdf_path = "/Users/monjur/Documents/vote/WARD NO-26/150850/150850_com_295_female_without_photo_17_2025-11-24.pdf"

print(f"Opening PDF: {pdf_path}\n")

try:
    with pdfplumber.open(pdf_path) as pdf:
        print(f"Total pages: {len(pdf.pages)}\n")

        # Extract text from first page
        first_page = pdf.pages[0]
        text = first_page.extract_text()

        print("=" * 80)
        print("FIRST PAGE TEXT:")
        print("=" * 80)
        print(text)
        print("=" * 80)

        # Try to extract tables
        tables = first_page.extract_tables()
        if tables:
            print(f"\nFound {len(tables)} table(s) on first page")
            for i, table in enumerate(tables):
                print(f"\nTable {i+1}:")
                for row in table[:5]:  # Show first 5 rows
                    print(row)

except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
