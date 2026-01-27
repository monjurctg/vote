#!/bin/bash

# Voter Data System - Quick Start Script

echo "=========================================="
echo "🗳️  ভোটার তথ্য ব্যবস্থাপনা সিস্টেম"
echo "=========================================="
echo ""

# Check if MySQL is running
echo "1️⃣  Checking MySQL..."
if command -v mysql &> /dev/null; then
    echo "   ✅ MySQL installed"
else
    echo "   ❌ MySQL not found. Please install MySQL first"
    exit 1
fi

# Check Python
echo "2️⃣  Checking Python..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo "   ✅ $PYTHON_VERSION"
else
    echo "   ❌ Python3 not found"
    exit 1
fi

# Check virtual environment
echo "3️⃣  Checking virtual environment..."
if [ -d "venv" ]; then
    echo "   ✅ Virtual environment found"
else
    echo "   ⚠️  Creating virtual environment..."
    python3 -m venv venv
    echo "   ✅ Virtual environment created"
fi

# Activate virtual environment and install dependencies
echo "4️⃣  Installing dependencies..."
source venv/bin/activate
pip install -q pdfplumber flask flask-cors pymysql cryptography
echo "   ✅ Dependencies installed"

echo ""
echo "=========================================="
echo "📋 Setup Checklist"
echo "=========================================="
echo ""
echo "Before proceeding, please:"
echo ""
echo "1. Set MySQL password in these files:"
echo "   - scripts/create_database.py (Line 12)"
echo "   - scripts/import_pdf_data.py (Line 18)"
echo "   - backend/app.py (Line 14)"
echo ""
echo "   Change this line:"
echo "   'password': '',  --> 'password': 'your_password'"
echo ""
echo "2. Make sure MySQL server is running"
echo ""

read -p "Have you set the MySQL password? (yes/no): " MYSQL_PASSWORD_SET

if [ "$MYSQL_PASSWORD_SET" != "yes" ]; then
    echo ""
    echo "⚠️  Please set MySQL password first!"
    echo ""
    echo "Edit files:"
    echo "  nano scripts/create_database.py"
    echo "  nano scripts/import_pdf_data.py"
    echo "  nano backend/app.py"
    echo ""
    exit 0
fi

echo ""
echo "=========================================="
echo "🔧 Database Setup"
echo "=========================================="
echo ""

read -p "Create database now? (yes/no): " CREATE_DB

if [ "$CREATE_DB" == "yes" ]; then
    echo "Creating database..."
    python scripts/create_database.py

    if [ $? -eq 0 ]; then
        echo "✅ Database created successfully"
    else
        echo "❌ Database creation failed"
        echo "Try manually: mysql -u root -p < database/schema.sql"
        exit 1
    fi
fi

echo ""
echo "=========================================="
echo "📄 PDF Data Import"
echo "=========================================="
echo ""
echo "Options:"
echo "  1. Test mode (2 files only) - Recommended first"
echo "  2. Sample mode (custom number of files)"
echo "  3. Full import (all PDF files)"
echo "  4. Skip for now"
echo ""

read -p "Choose option (1-4): " IMPORT_OPTION

case $IMPORT_OPTION in
    1)
        echo "Running test import..."
        python scripts/import_pdf_data.py --test
        ;;
    2)
        read -p "How many files to import? " SAMPLE_COUNT
        echo "Importing $SAMPLE_COUNT files..."
        python scripts/import_pdf_data.py --sample $SAMPLE_COUNT
        ;;
    3)
        echo "⚠️  This will import ALL PDF files. This may take a while."
        read -p "Continue? (yes/no): " CONFIRM
        if [ "$CONFIRM" == "yes" ]; then
            python scripts/import_pdf_data.py
        fi
        ;;
    4)
        echo "Skipping import for now"
        ;;
esac

echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "To start the system:"
echo ""
echo "1. Start Backend API:"
echo "   cd /Users/monjur/Documents/vote/app"
echo "   source venv/bin/activate"
echo "   python backend/app.py"
echo ""
echo "2. In another terminal, start Frontend:"
echo "   cd /Users/monjur/Documents/vote/app/frontend"
echo "   python3 -m http.server 8080"
echo ""
echo "3. Open browser:"
echo "   http://localhost:8080"
echo ""
echo "=========================================="
echo "🎉 Ready to search voter data!"
echo "=========================================="
echo ""
