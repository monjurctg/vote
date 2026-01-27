// API Config
const API_BASE = '/api';

// Elements
const loader = document.getElementById('loader');
const heroSection = document.getElementById('hero-section');
const candidateImg = document.getElementById('candidate-img');
const markaImg = document.getElementById('marka-img');
const manifesto = document.getElementById('manifesto');
const wardSelect = document.getElementById('ward');
const searchForm = document.getElementById('search-form');
const resultsSection = document.getElementById('results-section');
const resultsTbody = document.getElementById('results-tbody');
const mobileResultsContainer = document.getElementById('mobile-results-container');
const resultCount = document.getElementById('result-count');

// State
let wardList = [];

// Static Data (Hardcoded for performance as requested)
const STATIC_DATA = {
    "WardOrAreaList": [
        {
            "WardName": "ওয়ার্ড নং-০৮(পার্ট)",
            "Areas": ["পূর্ব নাসিরাবাদ ৩য় অংশ", "মুরাদপুর ২য় অংশ", "শুলকবহর ১ম অংশ", "খুলশী", "পূর্ব নাসিরাবাদ ২য় অংশ", "মুরাদপুর ১ম অংশ", "পূর্ব নাসিরাবাদ ৫ম অংশ", "পূর্ব নাসিরাবাদ ৪র্থ অংশ", "শুলকবহর ২য় অংশ"]
        },
        {
            "WardName": "ওয়ার্ড নং-১১(পার্ট)",
            "Areas": ["দক্ষিন কাট্রলী -৩", "দক্ষিন কাট্রলী -৪", "দক্ষিন কাট্রলী -২", "দক্ষিন কাট্রলী -৭", "গ্রিন ভিউ আবাসিক এলাকা", "উঃ সরাই পাড়া কাজীর দিঘী", "পশ্চিম নাসিরাবাদ", "দক্ষিন কাট্রলী -১", "দক্ষিন কাট্রলী -৫", "দঃ কাট্রলী আই ব্লক ও জে ľক", "দক্ষিন কাট্রলী -৬"]
        },
        {
            "WardName": "ওয়ার্ড নং-১২(পার্ট)",
            "Areas": ["ঝর্না পাড়া", "সড়ক ও জনপথ কলোনী", "বারকোয়াটার", "আশরাফ আলী রোড", "হালি শহর রোড (বউ বাজার)", "হালি শহর রোড(নতুন বাজার)", "পশ্চিম নাসিরাবাদ বাচামিয়া রোড", "মধ্যম সরাই পাড়া", "মমতাজ সওদাগর কলোনী", "পাহাড়তলী রেলওয়ে কোয়াটার", "চল্লিশ কোয়াটার", "পাহাড়তলী বাজার", "উত্তর সরাই পাড়া", "ভেলুয়ার দিঘীর পাড়", "ঢাকা ট্রাংক রোড(দক্ষিন পাহাড় তলী)", "মৌসুমী আবাসিক এলাকা", "ঢাকা ট্রাংক রোড(মধ্যম সরাইপাড়া)", "আমিন উল্লাহ  সড়ক", "আব্দুল লতিফ সড়ক", "আব্দুল গনি রোড"]
        },
        {
            "WardName": "ওয়ার্ড নং-১৩",
            "Areas": ["এক্স ই-এন কলোনী", "দঃ খুলশী আবাসিক এলাকা", "ওয়ারলেস কলোনী", "টাইগার পাশ রেলওয়ে কলোনী", "হাসপাতাল কলোনী", "টিপিপি কলোনী", "ফ্লোরা পাশ রোড", "সেগুন বাগান", "আম বাগান বাস্তহারা", "নিউ জাইতলা ডিজেল কলোনী", "লোকো কলোনী", "মাষ্টার লেন", "ঝাউতলা কলোনী", "মুরগী ফার্ম ,বিএ ডিসি ও পশ্চিম খুলশী", "সর্দার বাহাদুর নগর", "আম বাগান"]
        },
        {
            "WardName": "ওয়ার্ড নং-১৪",
            "Areas": ["সামছি কলোনী", "পুলিশ লাইন", "মতি ঝর্না", "বাঘ ঘোনা", "নাবালক কলোনী (বায়তুল আমান হাউজিং  সোসাইটি)", "তুলা পুকুর লেইন", "হাইলেবেল রোড", "চানঁ মারী রোড", "টাইগার পাশ", "ভুতাইয়া কলোনী"]
        },
        {
            "WardName": "ওয়ার্ড নং-২৪(পার্ট)",
            "Areas": ["মিস্ত্রি পাড়া", "হাজী পাড়া", "আনন্দিপুর হাউজিং সোসাইটি", "টি এন্ড টি কলোনী", "হালিশহর হাউজিং এেস্টট(কে এবং এল ব্লক)", "মোল্লা পাড়া", "মুহুরী পাড়া", "রংগি পাড়া(শান্তিবাগ আবাসিক এলাকা)", "মনছুরাবাদ", "আশকারাবাদ", "মৌলভী পাড়া(বাদামতলী)", "পানওয়ালা পাড়া", "বেপারী পাড়া", "দাইয়া পাড়া", "চারিয়া পাড়া"]
        },
        {
            "WardName": "ওয়ার্ড নং-২৫",
            "Areas": ["বড় পুকুর পাড়", "মধ্য রামপুর", "ধোপা পাড়া", "পূর্ব রামপুর", "সবুজবাগ", "পশ্চিম রামপুর"]
        },
        {
            "WardName": "ওয়ার্ড নং-২৬",
            "Areas": ["নতুন পাড়া", "মোল্লা পাড়া", "গলিচিপা পাড়া", "হালিশহর বি ব্লক", "চৌধুরী পাড়া", "নাথ ও আচার্য্য পাড়া", "ফুল চৌধুরী পাড়া", "নিয়াজ পাড়া", "আব্বাস পাড়া", "সুন্দরী পাড়া", "আকবর রুটি ওয়ালা পাড়া", "মইন্যা পাড়া", "পাচঁ ঘর পাড়া", "আজিজ পাড়া", "সিএস ডি", "বিডি আর ক্যাম্প"]
        }
    ],
    "IsArea": false,
    "Client": {
        "Id": 328,
        "Name": "আলহাজ্ব জান্নাতুল ইসলাম  | চট্টগ্রাম-১০",
        "Title": "<span style=\"font-weight: bold;\">আলহাজ্ব জান্নাতুল ইসলাম </span> এর সালাম নিন, হাতপাখা মার্কায় ভোট দিন<br>তারুন্যের প্রথম ভোট, হাতপাখা মার্কার পক্ষে হোক",
        "Manifesto": "<span style=\"font-weight: bold;\">আলহাজ্ব জান্নাতুল ইসলাম </span> এর সালাম নিন, হাতপাখা মার্কায় ভোট দিন<br>তারুন্যের প্রথম ভোট, হাতপাখা মার্কার পক্ষে হোক",
        "Marka_Image_Path": "hatPakha.jpg",
        "Person_Image_Path": "jannat.jpg",
        "Parsing_Client_File_Base": "https://objectstorage.ap-singapore-1.oraclecloud.com/p/DWECC7cRflYy3wE48n7MIEjVIAUkUpfv82Igs9ptvyxYPIpLCm5duEl4dYMbqSau/n/axssgl0vbvet/b/bucket-parsing-project/o/",
        "Parsing_Client_File": [
            { "Unique_Tag": "[Mobile_Poster]", "URL": "ParsingClientFile_Mobile_Poster_24-01_XLWEKBTMEK.jpeg" }
        ]
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadInitialData();
});

// Load Initial Data (From Static Constant)
function loadInitialData() {
    try {
        const data = STATIC_DATA;

        if (data) {
            const client = data.Client;
            const wards = data.WardOrAreaList;

            // 1. Update Hero & Banner
            if (client) {
                // Base Images
                if (candidateImg) candidateImg.src = client.Person_Image_Path;
                if (markaImg) markaImg.src = client.Marka_Image_Path;

                // Manifesto / Title
                if (manifesto) manifesto.innerHTML = client.Manifesto;
                const navTitle = document.getElementById('nav-title');
                if (navTitle) navTitle.innerHTML = client.Name || 'ভোট কেন্দ্র তথ্য';

                // Poster - FORCE LOCAL IMAGE
                const bannerImg = document.getElementById('banner-img');
                if (bannerImg) {
                    bannerImg.src = 'jannatulislam.jpg';
                    bannerImg.style.display = 'block';
                }

                // (Old API Banner Logic Removed to prevent conflicts)

                if (heroSection) heroSection.style.display = 'block';
            }

            // 2. Populate Dropdown
            if (wards && Array.isArray(wards)) {
                wardList = wards;
                populateWards(wards);
            }
        }
    } catch (error) {
        console.error("Init Error:", error);
    } finally {
        if (loader) loader.classList.add('hidden');
    }
}

function populateWards(wards) {
    wardSelect.innerHTML = '<option value="" disabled selected>ওয়ার্ড/এলাকা নির্বাচন করুন</option>';

    // The API seems to give structure: { WardName: "...", Areas: [...] }
    // We want to flatten this or group it. Let's create optgroups.

    wards.forEach(ward => {
        const group = document.createElement('optgroup');
        group.label = ward.WardName;

        // Sometimes users might want to select the Ward itself, but usually Areas.
        // Based on the user's provided search payload sample: `Ward: "ওয়ার্ড নং-১২(পার্ট)"`
        // It seems they select the WARD NAME, not the Area?
        // Wait, the payload usage showed `{Ward: "..."}`
        // Let's add the Ward itself as an option??
        // Actually, looking at the user request: "Ward": "ওয়ার্ড নং-১২(পার্ট)", "AreaName": "ঝর্না পাড়া"
        // Let's Add Areas as options values, but keep Ward as a data-attribute or prefix.

        // Actually simplest is just to add the specific Areas as options
        // BUT the endpoint expects `Ward` string.
        // Let's stick to the structure found in `GetUnionOrPouroList`.
        // We will assume the Select value should be the Ward Name.
        // Wait, the user payload has `Ward: "word name"` AND `AreaName: "area name"`.
        // Let's just put the WARD names as the primary select for now as per the big dropdown in the original site.

        const option = document.createElement('option');
        option.value = ward.WardName;
        option.textContent = ward.WardName;
        wardSelect.appendChild(option);
    });
}

// Smart DOB Input Handler
const dobInput = document.getElementById('dob');
dobInput.addEventListener('input', (e) => {
    let val = e.target.value;

    // 1. Convert English digits to Bangla
    const engToBang = {
        '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
        '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
    };

    // Replace any English digit with Bangla
    val = val.replace(/[0-9]/g, match => engToBang[match]);

    // 2. Remove any non-Bangla digit except '/'
    // We want to keep slashes if they are in valid positions, but simpler to rebuild
    const rawDigits = val.replace(/[^০-৯]/g, '');

    // 3. Auto-insert Slashes (DD/MM/YYYY)
    let formatted = '';
    if (rawDigits.length > 0) {
        formatted += rawDigits.substring(0, 2);
    }
    if (rawDigits.length > 2) {
        formatted += '/' + rawDigits.substring(2, 4);
    }
    if (rawDigits.length > 4) {
        formatted += '/' + rawDigits.substring(4, 8);
    }

    e.target.value = formatted;
});


// Search Handler
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const dob = document.getElementById('dob').value;
    const ward = wardSelect.value;

    if (!dob || !ward) {
        alert("দয়া করে জন্ম তারিখ এবং ওয়ার্ড নির্বাচন করুন");
        return;
    }

    loader.classList.remove('hidden');

    const payload = {
        Name: name,
        DOB: dob,
        Ward: ward,
        IsArea: false // Based on previous analysis
    };

    try {
        const res = await fetch(`${API_BASE}/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const responseData = await res.json();

        renderResults(responseData);

    } catch (error) {
        console.error("Search Error:", error);
        alert("অনুসন্ধান করতে সমস্যা হয়েছে।");
    } finally {
        loader.classList.add('hidden');
    }
});

function renderResults(responseData) {
    // Structure: { Data: { data: [Array of voters], recordsFiltered: N, ... } }
    const results = responseData.Data?.data || [];
    const count = responseData.Data?.recordsFiltered || 0;

    resultCount.textContent = count;
    resultsTbody.innerHTML = '';
    mobileResultsContainer.innerHTML = '';

    if (results.length === 0) {
        resultsSection.style.display = 'block';
        resultsTbody.innerHTML = '<tr><td colspan="5" class="text-center">কোনো তথ্য পাওয়া যায়নি</td></tr>';
        return;
    }

    results.forEach(voter => {
        // Desktop Row
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${voter.Serial || '-'}</td>
            <td>${voter.Name}</td>
            <td>${voter.Husband_Father}</td>
            <td>${voter.Voter_No}</td>
            <td>${voter.CenterName}</td>
        `;
        resultsTbody.appendChild(tr);

        // Mobile Card
        const card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = `
            <div class="result-row">
                <span class="row-label">ক্রমিক</span>
                <span class="row-value">${voter.Serial || '-'}</span>
            </div>
            <div class="result-row">
                <span class="row-label">নাম</span>
                <span class="row-value">${voter.Name}</span>
            </div>
            <div class="result-row">
                <span class="row-label">পিতা/স্বামী</span>
                <span class="row-value">${voter.Husband_Father}</span>
            </div>
            <div class="result-row">
                <span class="row-label">ভোটের নম্বর</span>
                <span class="row-value">${voter.Voter_No}</span>
            </div>
            <div class="result-row">
                <span class="row-label">কেন্দ্র</span>
                <span class="row-value" style="font-size: 0.9rem;">${voter.CenterName}</span>
            </div>
        `;
        mobileResultsContainer.appendChild(card);
    });

    resultsSection.style.display = 'block';

    // Smooth scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// ----------------------------------------------------
// SLIP & MODAL LOGIC
// ----------------------------------------------------
const modal = document.getElementById('slip-modal');
const closeBtn = document.getElementById('close-modal');
const downloadBtn = document.getElementById('download-btn');
const printBtn = document.getElementById('print-btn');

// Close Modal
function closeModal() {
    modal.classList.add('hidden');
}
closeBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// Open Modal & Populate
window.openSlip = function (voterStr) {
    const voter = JSON.parse(decodeURIComponent(voterStr));
    const client = STATIC_DATA.Client;

    // 1. Fill Images/Manifesto
    // Use the Mobile Poster as the top banner for the slip
    const bannerImg = document.getElementById('banner-img');
    const slipBanner = document.getElementById('slip-banner-img');

    // Always sync with the hero banner (which is now forced to jannatulislam.jpg)
    if (bannerImg) {
        slipBanner.src = bannerImg.src || 'jannatulislam.jpg';
    } else {
        slipBanner.src = 'jannatulislam.jpg';
    }

    const slipManifesto = document.getElementById('slip-manifesto-text');
    if (client.Manifesto) slipManifesto.innerHTML = client.Manifesto;

    // 2. Fill Voter Details
    document.getElementById('slip-center').textContent = voter.CenterName || '-';
    document.getElementById('slip-name').textContent = voter.Name || '-';
    document.getElementById('slip-serial').textContent = voter.Serial || '-';
    document.getElementById('slip-voter-no').textContent = voter.Voter_No || '-';
    document.getElementById('slip-dob').textContent = voter.DOB_Bangla || '-'; // Assuming backend returns localized DOB
    document.getElementById('slip-father').textContent = voter.Husband_Father || '-';
    document.getElementById('slip-mother').textContent = voter.Mother || '-';
    document.getElementById('slip-area').textContent = voter.AreaName || '-';
    document.getElementById('slip-ward').textContent = voter.Ward || '12(Part)'; // Hardcoded logic or from object

    // 3. Show Modal
    modal.classList.remove('hidden');
};

// Download PNG
downloadBtn.addEventListener('click', () => {
    const slipElement = document.getElementById('voter-slip');

    html2canvas(slipElement, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: '#ffffff',
        scrollY: -window.scrollY // Fix scrolling offset issues
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'voter_slip.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
});

// Print
// Print
printBtn.addEventListener('click', () => {
    // CSS @media print handles the visibility.
    // We just need to trigger the browser print dialog.
    window.print();
});

// Updated Render with Slip Button
function renderResults(responseData) {
    const results = responseData.Data?.data || [];
    const count = responseData.Data?.recordsFiltered || 0;

    resultCount.textContent = count;
    resultsTbody.innerHTML = '';
    mobileResultsContainer.innerHTML = '';

    if (results.length === 0) {
        resultsSection.style.display = 'block';
        resultsTbody.innerHTML = '<tr><td colspan="6" class="text-center">কোনো তথ্য পাওয়া যায়নি</td></tr>';
        return;
    }

    results.forEach(voter => {
        // Safe stringify for passing to onclick
        const voterStr = encodeURIComponent(JSON.stringify(voter));
        const btnHtml = `<button class="btn btn-sm btn-primary" onclick="openSlip('${voterStr}')">স্লিপ</button>`;

        // Desktop Row
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${voter.Serial || '-'}</td>
            <td>${voter.Name}</td>
            <td>${voter.Husband_Father}</td>
            <td>${voter.Voter_No}</td>
            <td>${voter.CenterName}</td>
            <td>${btnHtml}</td>
        `;
        resultsTbody.appendChild(tr);

        // Mobile Card
        const card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = `
            <div class="result-row">
                <span class="row-label">ক্রমিক</span>
                <span class="row-value">${voter.Serial || '-'}</span>
            </div>
            <div class="result-row">
                <span class="row-label">নাম</span>
                <span class="row-value">${voter.Name}</span>
            </div>
            <div class="result-row">
                <span class="row-label">পিতা/স্বামী</span>
                <span class="row-value">${voter.Husband_Father}</span>
            </div>
            <div class="result-row">
                <span class="row-label">ভোটের নম্বর</span>
                <span class="row-value">${voter.Voter_No}</span>
            </div>
            <div class="result-row">
                <span class="row-label">কেন্দ্র</span>
                <span class="row-value" style="font-size: 0.9rem;">${voter.CenterName}</span>
            </div>
            <div class="result-row" style="border:none; justify-content:center; margin-top:10px;">
                ${btnHtml}
            </div>
        `;
        mobileResultsContainer.appendChild(card);
    });

    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Reset
document.getElementById('reset-btn').addEventListener('click', () => {
    searchForm.reset();
    resultsSection.style.display = 'none';
});
