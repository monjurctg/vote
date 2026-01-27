-- Voter Data Management System Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS voter_data CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE voter_data;

-- Voters table
CREATE TABLE IF NOT EXISTS voters (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ward VARCHAR(100) NOT NULL COMMENT 'ওয়ার্ড নম্বর',
    area_code VARCHAR(50) COMMENT 'ভোটার এলাকার নম্বর',
    area_name VARCHAR(200) COMMENT 'ভোটার এলাকার নাম',
    serial_number INT COMMENT 'ক্রমিক নম্বর',
    voter_name VARCHAR(300) COMMENT 'ভোটারের নাম',
    father_name VARCHAR(300) COMMENT 'পিতার নাম',
    mother_name VARCHAR(300) COMMENT 'মাতার নাম',
    spouse_name VARCHAR(300) COMMENT 'স্বামী/স্ত্রীর নাম',
    date_of_birth DATE COMMENT 'জন্ম তারিখ',
    age INT COMMENT 'বয়স',
    gender ENUM('male', 'female', 'other') COMMENT 'লিঙ্গ',
    nid_number VARCHAR(50) COMMENT 'জাতীয় পরিচয়পত্র নম্বর',
    address TEXT COMMENT 'ঠিকানা',
    pdf_source VARCHAR(500) COMMENT 'PDF file path',
    total_voters_in_area INT COMMENT 'এলাকায় মোট ভোটার',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes for fast searching
    INDEX idx_ward (ward),
    INDEX idx_area_code (area_code),
    INDEX idx_area_name (area_name),
    INDEX idx_dob (date_of_birth),
    INDEX idx_name (voter_name),
    INDEX idx_nid (nid_number),
    INDEX idx_gender (gender),

    -- Composite index for common searches
    INDEX idx_ward_area_dob (ward, area_code, date_of_birth)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Areas lookup table for dropdown
CREATE TABLE IF NOT EXISTS areas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ward VARCHAR(100) NOT NULL,
    area_code VARCHAR(50) NOT NULL,
    area_name VARCHAR(200) NOT NULL,
    total_voters INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY unique_ward_area (ward, area_code),
    INDEX idx_ward (ward)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Statistics table for analytics
CREATE TABLE IF NOT EXISTS statistics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stat_type VARCHAR(50) COMMENT 'Type of statistic',
    stat_key VARCHAR(100) COMMENT 'Key/identifier',
    stat_value VARCHAR(500) COMMENT 'Value',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_type (stat_type),
    INDEX idx_key (stat_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
