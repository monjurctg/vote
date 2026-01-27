# 🚀 Quick Start Guide

## ⚡ 3-Minute Setup

### 1. Set MySQL Password (1 min)

তিনটা file এ MySQL password দিন - একই password তিন জায়গায়:

```bash
# File 1
nano /Users/monjur/Documents/vote/app/scripts/create_database.py
# Line 12: 'password': '',  →  'password': 'your_password'

# File 2
nano /Users/monjur/Documents/vote/app/scripts/import_pdf_data.py
# Line 18: 'password': '',  →  'password': 'your_password'

# File 3
nano /Users/monjur/Documents/vote/app/backend/app.py
# Line 14: 'password': '',  →  'password': 'your_password'
```

### 2. Setup Database (30 seconds)

```bash
cd /Users/monjur/Documents/vote/app
source venv/bin/activate
python scripts/create_database.py
```

### 3. Import Sample Data (1 min)

```bash
# Test with just 2 PDFs first
python scripts/import_pdf_data.py --test
```

### 4. Start Servers (30 seconds)

**Terminal 1 - Backend:**
```bash
cd /Users/monjur/Documents/vote/app
source venv/bin/activate
python backend/app.py
```

**Terminal 2 - Frontend:**
```bash
cd /Users/monjur/Documents/vote/app/frontend
python3 -m http.server 8080
```

### 5. Open Browser

➡️  **http://localhost:8080**

---

## 🎯 First Search

1. Ward: `ওয়ার্ড নং-২৬`
2. Click: `🔍 অনুসন্ধান করুন`
3. See results in table! ✅

---

## 📊 Import All Data

```bash
python scripts/import_pdf_data.py
# Type: yes
```

⏱️ Takes 10-30 minutes for all PDFs

---

## 🛑 Stop Servers

```bash
# Backend
Ctrl + C in Terminal 1

# Frontend
Ctrl + C in Terminal 2
```

---

## ❓ Problems?

### Can't connect to MySQL
- Check MySQL is running: `mysql -u root -p`
- Verify password is correct in all 3 files

### Port already in use
```bash
lsof -ti:5000 | xargs kill -9  # Backend
lsof -ti:8080 | xargs kill -9  # Frontend
```

### No results showing
- Check browser console (F12)
- Verify backend is running
- Check network tab for API errors

---

## 📖 Full Documentation

- [README.md](file:///Users/monjur/Documents/vote/app/README.md) - Complete guide
- [walkthrough.md](file:///Users/monjur/.gemini/antigravity/brain/e74e4d77-ce55-437e-9639-9c67ad845fc2/walkthrough.md) - Detailed walkthrough

---

## 🎉 That's It!

আপনার voter data system এখন কাজ করছে!

**Happy Searching! 🗳️**
