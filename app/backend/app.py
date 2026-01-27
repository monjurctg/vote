#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from flask import Flask, request, jsonify
from flask_cors import CORS
import pymysql
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '1234',
    'database': 'voter_data',
    'charset': 'utf8mb4',
    'cursorclass': pymysql.cursors.DictCursor
}

def get_db_connection():
    """Create database connection"""
    return pymysql.connect(**DB_CONFIG)

@app.route('/')
def index():
    """API status endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'Voter Data API is running',
        'endpoints': {
            '/api/search': 'POST - Search voters',
            '/api/wards': 'GET - Get all wards',
            '/api/areas': 'GET - Get areas by ward',
            '/api/stats': 'GET - Get statistics'
        }
    })

@app.route('/api/search', methods=['POST'])
def search_voters():
    """
    Search for voters
    Parameters:
        - ward (required): Ward number
        - area (optional): Area name or code
        - dob (optional): Date of birth (DD/MM/YYYY or YYYY-MM-DD)
        - name (optional): Voter name
        - page (optional): Page number for pagination (default: 1)
        - limit (optional): Results per page (default: 50)
    """
    try:
        data = request.get_json() or {}

        ward = data.get('ward', '').strip()
        area = data.get('area', '').strip()
        dob = data.get('dob', '').strip()
        name = data.get('name', '').strip()
        page = int(data.get('page', 1))
        limit = int(data.get('limit', 50))

        if not ward:
            return jsonify({'error': 'Ward is required'}), 400

        # Build query
        query = "SELECT * FROM voters WHERE ward = %s"
        params = [ward]

        # Add optional filters
        if area:
            query += " AND (area_name LIKE %s OR area_code = %s)"
            params.extend([f"%{area}%", area])

        if dob:
            # Parse date - handle both DD/MM/YYYY and YYYY-MM-DD formats
            try:
                if '/' in dob:
                    dob_obj = datetime.strptime(dob, '%d/%m/%Y')
                else:
                    dob_obj = datetime.strptime(dob, '%Y-%m-%d')
                query += " AND date_of_birth = %s"
                params.append(dob_obj.strftime('%Y-%m-%d'))
            except ValueError:
                return jsonify({'error': 'Invalid date format. Use DD/MM/YYYY or YYYY-MM-DD'}), 400

        if name:
            query += " AND voter_name LIKE %s"
            params.append(f"%{name}%")

        # Add ordering
        query += " ORDER BY serial_number ASC"

        # Get total count
        count_query = query.replace("SELECT *", "SELECT COUNT(*) as total")

        connection = get_db_connection()
        cursor = connection.cursor()

        # Get total
        cursor.execute(count_query, params)
        total = cursor.fetchone()['total']

        # Add pagination
        offset = (page - 1) * limit
        query += f" LIMIT {limit} OFFSET {offset}"

        # Execute search
        cursor.execute(query, params)
        results = cursor.fetchall()

        cursor.close()
        connection.close()

        # Format results
        for row in results:
            if row.get('date_of_birth'):
                row['date_of_birth'] = row['date_of_birth'].strftime('%d/%m/%Y')
            if row.get('created_at'):
                row['created_at'] = row['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            if row.get('updated_at'):
                row['updated_at'] = row['updated_at'].strftime('%Y-%m-%d %H:%M:%S')

        return jsonify({
            'success': True,
            'total': total,
            'page': page,
            'limit': limit,
            'total_pages': (total + limit - 1) // limit,
            'data': results
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/wards', methods=['GET'])
def get_wards():
    """Get list of all wards"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            SELECT DISTINCT ward, COUNT(*) as voter_count
            FROM voters
            GROUP BY ward
            ORDER BY ward
        """)

        wards = cursor.fetchall()

        cursor.close()
        connection.close()

        return jsonify({
            'success': True,
            'data': wards
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/areas', methods=['GET'])
def get_areas():
    """Get areas for a specific ward"""
    try:
        ward = request.args.get('ward', '').strip()

        if not ward:
            return jsonify({'error': 'Ward parameter is required'}), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            SELECT DISTINCT area_code, area_name, COUNT(*) as voter_count
            FROM voters
            WHERE ward = %s AND area_name IS NOT NULL
            GROUP BY area_code, area_name
            ORDER BY area_code
        """, [ward])

        areas = cursor.fetchall()

        cursor.close()
        connection.close()

        return jsonify({
            'success': True,
            'data': areas
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get overall statistics"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        # Total voters
        cursor.execute("SELECT COUNT(*) as total FROM voters")
        total_voters = cursor.fetchone()['total']

        # Gender breakdown
        cursor.execute("""
            SELECT gender, COUNT(*) as count
            FROM voters
            GROUP BY gender
        """)
        gender_stats = cursor.fetchall()

        # Wards count
        cursor.execute("SELECT COUNT(DISTINCT ward) as count FROM voters")
        total_wards = cursor.fetchone()['count']

        cursor.close()
        connection.close()

        return jsonify({
            'success': True,
            'data': {
                'total_voters': total_voters,
                'total_wards': total_wards,
                'gender_breakdown': gender_stats
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 Voter Data API Server")
    print("="*60)
    print(f"📍 API URL: http://localhost:5001")
    print(f"📚 Endpoints:")
    print(f"   - GET  /           - API status")
    print(f"   - POST /api/search - Search voters")
    print(f"   - GET  /api/wards  - Get all wards")
    print(f"   - GET  /api/areas  - Get areas by ward")
    print(f"   - GET  /api/stats  - Get statistics")
    print("="*60 + "\n")

    app.run(debug=True, host='0.0.0.0', port=5001)
