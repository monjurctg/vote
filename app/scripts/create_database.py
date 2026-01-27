#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import pymysql
import sys

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '1234',
    'charset': 'utf8mb4'
}

def create_database():
    """Create the voter_data database and tables"""

    # Read SQL schema
    with open('/Users/monjur/Documents/vote/app/database/schema.sql', 'r', encoding='utf-8') as f:
        sql_commands = f.read()

    try:
        # Connect to MySQL
        connection = pymysql.connect(**DB_CONFIG)
        cursor = connection.cursor()

        # Split and execute commands
        commands = sql_commands.split(';')

        for command in commands:
            command = command.strip()
            if command and not command.startswith('--'):
                try:
                    cursor.execute(command)
                    print(f"✓ Executed: {command[:50]}...")
                except Exception as e:
                    print(f"✗ Error executing command: {str(e)}")
                    print(f"  Command: {command[:100]}")

        connection.commit()
        print("\n✅ Database setup completed successfully!")

        # Test the connection
        cursor.execute("USE voter_data")
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()

        print("\n📋 Created tables:")
        for table in tables:
            print(f"  - {table[0]}")

        cursor.close()
        connection.close()

    except pymysql.err.OperationalError as e:
        print(f"\n❌ Database connection error: {e}")
        print("\n💡 Please set the correct MySQL password in this script:")
        print(f"   Edit: {__file__}")
        print(f"   Line: DB_CONFIG['password'] = 'your_password_here'")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    create_database()
