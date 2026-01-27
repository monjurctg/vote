# ভোটার তথ্য ব্যবস্থাপনা সিস্টেম

বাংলাদেশ নির্বাচন কমিশনের ভোটার তথ্য অনুসন্ধান এবং ব্যবস্থাপনার জন্য একটি সম্পূর্ণ সিস্টেম।

## 🎯 বৈশিষ্ট্য

- ✅ PDF থেকে ভোটার তথ্য Extract করা
- ✅ MySQL ডাটাবেসে ৪+ লাখ data সংরক্ষণ
- ✅ Ward, Area, Date of Birth দিয়ে অনুসন্ধান
- ✅ Table format এ ফলাফল প্রদর্শন
- ✅ Pagination support
- ✅ সম্পূর্ণ বাংলা ভাষা সমর্থন
- ✅ Responsive design (Mobile & Desktop)

## 📁 Project Structure

```
vote/
├── app/
│   ├── backend/
│   │   └── app.py           # Flask API server
│   ├── frontend/
│   │   ├── index.html       # Main webpage
│   │   ├── css/
│   │   │   └── styles.css   # Styles
│   │   └── js/
│   │       └── app.js       # Frontend logic
│   ├── database/
│   │   └── schema.sql       # Database schema
│   ├── scripts/
│   │   ├── create_database.py  # DB setup script
│   │   ├── import_pdf_data.py  # PDF import script
│   │   └── test_pdf_extract.py # Test script
│   └── venv/                # Python virtual environment
└── WARD NO-26/              # PDF files
```

## 🚀 Setup Instructions

### ১. Database Setup

প্রথমে MySQL database তৈরি করুন:

```bash
cd /Users/monjur/Documents/vote/app

# Edit the password in the script first
nano scripts/create_database.py
# Set: DB_CONFIG['password'] = 'your_mysql_password'

# Then run:
source venv/bin/activate
python scripts/create_database.py
```

**অথবা** সরাসরি MySQL command line থেকে:

```bash
mysql -u root -p < database/schema.sql
```

### ২. PDF Data Import

PDF থেকে voter data import করুন:

```bash
# Test mode (শুধু 2টা file)
python scripts/import_pdf_data.py --test

# Specific sample (যেমন 5টা file)
python scripts/import_pdf_data.py --sample 5

# সব data import (৪ লাখ+)
python scripts/import_pdf_data.py
# Type 'yes' to confirm
```

**গুরুত্বপূর্ণ:** Import করার আগে `scripts/import_pdf_data.py` file এ MySQL password set করুন:

```python
DB_CONFIG = {
    'password': 'your_mysql_password_here'
}
```

### ৩. Backend Server Start

API server চালু করুন:

```bash
cd /Users/monjur/Documents/vote/app
source venv/bin/activate

# Set MySQL password in backend/app.py first
python backend/app.py
```

Server চালু হবে: `http://localhost:5000`

### ৪. Frontend Open

একটা নতুন terminal এ:

```bash
cd /Users/monjur/Documents/vote/app/frontend

# Python এর built-in server দিয়ে চালান
python3 -m http.server 8080
```

ব্রাউজারে খুলুন: `http://localhost:8080`

## 🔧 Configuration

### MySQL Password Setup

নিম্নলিখিত files এ MySQL password set করতে হবে:

1. `scripts/create_database.py` - Line 12
2. `scripts/import_pdf_data.py` - Line 18
3. `backend/app.py` - Line 14

```python
DB_CONFIG = {
    'password': 'your_password_here'  # <-- এখানে password দিন
}
```

### API Base URL

যদি server অন্য port এ চালান, তাহলে `frontend/js/app.js` file এ update করুন:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';  // Change port if needed
```

## 📡 API Endpoints

### POST /api/search
ভোটার অনুসন্ধান

**Request:**
```json
{
  "ward": "ওয়ার্ড নং-২৬",
  "area": "নতুন পাড়া",
  "dob": "29/12/1987",
  "name": "আব্দুল করিম",
  "page": 1,
  "limit": 50
}
```

**Response:**
```json
{
  "success": true,
  "total": 150,
  "page": 1,
  "limit": 50,
  "total_pages": 3,
  "data": [...]
}
```

### GET /api/wards
সব ward এর তালিকা

### GET /api/areas?ward=ওয়ার্ড নং-২৬
নির্দিষ্ট ward এর সব area

### GET /api/stats
সামগ্রিক পরিসংখ্যান

## 🧪 Testing

### Database Connection Test
```bash
mysql -u root -p voter_data -e "SELECT COUNT(*) FROM voters;"
```

### API Test
```bash
curl -X POST http://localhost:5000/api/search \
  -H "Content-Type: application/json" \
  -d '{"ward":"ওয়ার্ড নং-২৬"}'
```

### PDF Extraction Test
```bash
python scripts/test_pdf_extract.py
```

## 🐛 Troubleshooting

### MySQL Connection Error

```
Error 1045: Access denied for user 'root'@'localhost'
```

**সমাধান:** সব Python scripts এ correct MySQL password set করুন।

### Port Already in Use

```
OSError: [Errno 48] Address already in use
```

**সমাধান:**
```bash
# Backend এর জন্য
lsof -ti:5000 | xargs kill -9

# Frontend এর জন্য
lsof -ti:8080 | xargs kill -9
```

### CORS Error

**সমাধান:** `backend/app.py` এ CORS already enable করা আছে। যদি সমস্যা হয়:

```python
CORS(app, origins=['http://localhost:8080'])
```

### PDF Extraction Issues

যদি PDF থেকে data properly extract না হয়, `scripts/import_pdf_data.py` এর pattern matching adjust করতে হবে।

## 📊 Database Schema

### voters table

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| ward | VARCHAR(100) | ওয়ার্ড নম্বর |
| area_code | VARCHAR(50) | এলাকা কোড |
| area_name | VARCHAR(200) | এলাকার নাম |
| serial_number | INT | ক্রমিক নম্বর |
| voter_name | VARCHAR(300) | ভোটারের নাম |
| father_name | VARCHAR(300) | পিতার নাম |
| mother_name | VARCHAR(300) | মাতার নাম |
| date_of_birth | DATE | জন্ম তারিখ |
| age | INT | বয়স |
| gender | ENUM | লিঙ্গ |
| nid_number | VARCHAR(50) | এনআইডি নম্বর |
| pdf_source | VARCHAR(500) | Source PDF |

## 🎨 Screenshots

System চালু হলে এরকম দেখাবে:
- Search form with Ward, Area, DOB fields
- Results in table format
- Pagination for large results
- Bangla font support

## 📝 Notes

- এই system ৪ লাখ+ voter data handle করতে পারে
- MySQL indexing দিয়ে fast search করা হয়েছে
- সব Bangla text UTF-8 (utf8mb4) encoding এ stored হয়
- Reference website: https://app.sayeednoman.com/

## 🔐 Security

**Production এ deploy করার আগে:**

1. MySQL username/password environment variable এ রাখুন
2. API CORS restriction সঠিকভাবে configure করুন
3. Input validation strengthen করুন
4. HTTPS enable করুন
5. Rate limiting add করুন

## 📞 Support

কোন সমস্যা হলে:
1. Database connection check করুন
2. Server logs দেখুন
3. Browser console এ error check করুন

## 🎯 Next Steps

System এখন ready! এখন করতে পারেন:

1. ✅ Database setup
2. ✅ PDF data import (test mode দিয়ে শুরু করুন)
3. ✅ Backend server চালু করুন
4. ✅ Frontend খুলুন এবং search করুন

**শুভকামনা! 🎉**
