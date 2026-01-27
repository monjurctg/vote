// Voter Data Search - Frontend JavaScript

const API_BASE_URL = 'http://localhost:5001/api';

// DOM Elements
const searchForm = document.getElementById('searchForm');
const wardSelect = document.getElementById('ward');
const areaSelect = document.getElementById('area');
const searchBtn = document.getElementById('searchBtn');
const btnText = searchBtn.querySelector('.btn-text');
const btnLoader = searchBtn.querySelector('.btn-loader');

const resultsSection = document.getElementById('resultsSection');
const resultsCount = document.getElementById('resultsCount');
const resultsBody = document.getElementById('resultsBody');
const pagination = document.getElementById('pagination');
const noResults = document.getElementById('noResults');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');

let currentPage = 1;
let currentSearchData = {};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadWards();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    // Ward change - load areas
    wardSelect.addEventListener('change', (e) => {
        loadAreas(e.target.value);
    });

    // Form submit
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        currentPage = 1;
        performSearch();
    });

    // Form reset
    searchForm.addEventListener('reset', () => {
        areaSelect.innerHTML = '<option value="">এলাকা নির্বাচন করুন (ঐচ্ছিক)</option>';
        hideAllMessages();
    });
}

// Load Wards
async function loadWards() {
    try {
        const response = await fetch(`${API_BASE_URL}/wards`);
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            wardSelect.innerHTML = '<option value="">ওয়ার্ড নির্বাচন করুন</option>';
            data.data.forEach(ward => {
                const option = document.createElement('option');
                option.value = ward.ward;
                option.textContent = `${ward.ward} (${ward.voter_count} ভোটার)`;
                wardSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading wards:', error);
        // Keep default option if API fails
    }
}

// Load Areas for selected Ward
async function loadAreas(ward) {
    if (!ward) {
        areaSelect.innerHTML = '<option value="">এলাকা নির্বাচন করুন (ঐচ্ছিক)</option>';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/areas?ward=${encodeURIComponent(ward)}`);
        const data = await response.json();

        areaSelect.innerHTML = '<option value="">এলাকা নির্বাচন করুন (ঐচ্ছিক)</option>';

        if (data.success && data.data.length > 0) {
            data.data.forEach(area => {
                const option = document.createElement('option');
                option.value = area.area_name;
                option.textContent = `${area.area_name} (${area.voter_count} ভোটার)`;
                areaSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading areas:', error);
    }
}

// Perform Search
async function performSearch() {
    const formData = new FormData(searchForm);
    const searchData = {
        ward: formData.get('ward'),
        area: formData.get('area'),
        dob: formData.get('dob'),
        name: formData.get('name'),
        page: currentPage,
        limit: 50
    };

    // Validate
    if (!searchData.ward) {
        showError('অনুগ্রহ করে ওয়ার্ড নির্বাচন করুন');
        return;
    }

    currentSearchData = searchData;

    // Show loading
    setLoading(true);
    hideAllMessages();

    try {
        const response = await fetch(`${API_BASE_URL}/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(searchData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'সার্ভার ত্রুটি');
        }

        if (data.success) {
            displayResults(data);
        } else {
            throw new Error(data.error || 'অজানা ত্রুটি');
        }

    } catch (error) {
        console.error('Search error:', error);
        showError(error.message || 'অনুসন্ধানে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
        setLoading(false);
    }
}

// Display Results
function displayResults(data) {
    if (data.total === 0) {
        showNoResults();
        return;
    }

    // Update count
    resultsCount.textContent = `মোট ${data.total} জন ভোটার পাওয়া গেছে (পৃষ্ঠা ${data.page}/${data.total_pages})`;

    // Clear previous results
    resultsBody.innerHTML = '';

    // Add rows
    data.data.forEach((voter, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${voter.serial_number || '-'}</td>
            <td><strong>${voter.voter_name || '-'}</strong></td>
            <td>${voter.father_name || '-'}</td>
            <td>${voter.mother_name || '-'}</td>
            <td>${voter.date_of_birth || '-'}</td>
            <td>${voter.age || '-'}</td>
            <td>${voter.nid_number || '-'}</td>
            <td>${voter.area_name || '-'}</td>
        `;
        resultsBody.appendChild(row);
    });

    // Show results section
    resultsSection.style.display = 'block';

    // Create pagination
    createPagination(data.page, data.total_pages);

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Create Pagination
function createPagination(currentPage, totalPages) {
    pagination.innerHTML = '';

    if (totalPages <= 1) return;

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '← পূর্ববর্তী';
    prevBtn.className = 'page-btn';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            goToPage(currentPage - 1);
        }
    };
    pagination.appendChild(prevBtn);

    // Page numbers
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
        startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.className = 'page-btn' + (i === currentPage ? ' active' : '');
        pageBtn.onclick = () => goToPage(i);
        pagination.appendChild(pageBtn);
    }

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'পরবর্তী →';
    nextBtn.className = 'page-btn';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            goToPage(currentPage + 1);
        }
    };
    pagination.appendChild(nextBtn);
}

// Go to Page
function goToPage(page) {
    currentPage = page;
    performSearch();
}

// UI Helper Functions
function setLoading(loading) {
    searchBtn.disabled = loading;
    btnText.style.display = loading ? 'none' : 'inline-flex';
    btnLoader.style.display = loading ? 'inline-flex' : 'none';
}

function hideAllMessages() {
    resultsSection.style.display = 'none';
    noResults.style.display = 'none';
    errorMessage.style.display = 'none';
}

function showNoResults() {
    hideAllMessages();
    noResults.style.display = 'block';
    noResults.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function showError(message) {
    hideAllMessages();
    errorText.textContent = message;
    errorMessage.style.display = 'block';
    errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Console welcome message
console.log('%c🗳️ ভোটার তথ্য অনুসন্ধান সিস্টেম', 'font-size: 20px; font-weight: bold; color: #2563eb;');
console.log('%cAPI Endpoint: ' + API_BASE_URL, 'color: #64748b;');
