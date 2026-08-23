const urlInput = document.getElementById('urlInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const errorMsg = document.getElementById('errorMsg');

const resultSection = document.getElementById('resultSection');
const resultBox = document.getElementById('resultBox');

const iconCircle = document.getElementById('iconCircle');
const iconSvg = document.getElementById('iconSvg');

const resultLabel = document.getElementById('resultLabel');
const resultDesc = document.getElementById('resultDesc');

const detailUrl = document.getElementById('detailUrl');
const detailStatus = document.getElementById('detailStatus');
const detailDate = document.getElementById('detailDate');
const detailRisk = document.getElementById('detailRisk');

const reasonsList = document.getElementById('reasonsList');


/*
|--------------------------------------------------------------------------
| Backend Configuration
|--------------------------------------------------------------------------
*/

const API_URL = 'http://127.0.0.1:8000/analyze';


/*
|--------------------------------------------------------------------------
| URL Validation
|--------------------------------------------------------------------------
*/

function normalizeUrl(raw) {
    let value = raw.trim();

    if (!value) {
        return null;
    }

    if (!/^https?:\/\//i.test(value)) {
        value = 'http://' + value;
    }

    try {
        return new URL(value);
    } catch (error) {
        return null;
    }
}


/*
|--------------------------------------------------------------------------
| Render Result
|--------------------------------------------------------------------------
*/

function renderResult(data) {

    const isDanger = Boolean(data.isDanger);

    /*
    |--------------------------------------------------------------------------
    | Result Box
    |--------------------------------------------------------------------------
    */

    resultBox.classList.toggle('danger', isDanger);
    iconCircle.classList.toggle('danger', isDanger);
    resultLabel.classList.toggle('danger', isDanger);


    /*
    |--------------------------------------------------------------------------
    | Icon + Main Message
    |--------------------------------------------------------------------------
    */

    if (isDanger) {

        iconSvg.setAttribute('stroke', '#d64545');

        iconSvg.innerHTML = `
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v5"/>
            <path d="M12 16h.01"/>
        `;

        resultLabel.textContent = data.status.toUpperCase();

        if (data.risk === 'High') {
            resultDesc.textContent =
                'This website shows strong signs of being a phishing threat. Avoid entering any information.';
        } else {
            resultDesc.textContent =
                'This website shows suspicious characteristics. Proceed with caution.';
        }

    } else {

        iconSvg.setAttribute('stroke', '#1f9d55');

        iconSvg.innerHTML = `
            <path d="M12 2 4 5v6c0 5 3.4 8.6 8 11 4.6-2.4 8-6 8-11V5z"/>
            <path d="m9 12 2 2 4-4"/>
        `;

        resultLabel.textContent = 'FINE';

        resultDesc.textContent =
            'This website appears to be safe.';
    }


    /*
    |--------------------------------------------------------------------------
    | Details
    |--------------------------------------------------------------------------
    */

    detailUrl.textContent = data.url;

    detailStatus.textContent = data.status;
    detailStatus.className = 'value ' + (isDanger ? 'danger' : '');

    detailRisk.textContent = data.risk;
    detailRisk.className = 'value ' + (isDanger ? 'danger' : '');

    detailDate.textContent = new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });


    /*
    |--------------------------------------------------------------------------
    | Reasons
    |--------------------------------------------------------------------------
    */

    reasonsList.innerHTML = '';

    const reasons =
        Array.isArray(data.reasons) && data.reasons.length
            ? data.reasons
            : ['No suspicious patterns detected.'];

    reasons.forEach(reason => {

        const li = document.createElement('li');

        li.textContent = reason
            .replace(/_/g, ' ');

        reasonsList.appendChild(li);
    });


    /*
    |--------------------------------------------------------------------------
    | Show Result
    |--------------------------------------------------------------------------
    */

    resultSection.classList.add('visible');
}


/*
|--------------------------------------------------------------------------
| Analyze URL
|--------------------------------------------------------------------------
*/

async function analyzeURL() {

    const raw = urlInput.value.trim();

    /*
    |--------------------------------------------------------------------------
    | Empty URL
    |--------------------------------------------------------------------------
    */

    if (!raw) {

        errorMsg.textContent = 'Please enter a URL.';
        errorMsg.style.display = 'block';

        resultSection.classList.remove('visible');

        return;
    }


    /*
    |--------------------------------------------------------------------------
    | Validate URL
    |--------------------------------------------------------------------------
    */

    const urlObj = normalizeUrl(raw);

    if (!urlObj) {

        errorMsg.textContent = 'Please enter a valid URL.';
        errorMsg.style.display = 'block';

        resultSection.classList.remove('visible');

        return;
    }


    errorMsg.style.display = 'none';


    /*
    |--------------------------------------------------------------------------
    | Button State
    |--------------------------------------------------------------------------
    */

    analyzeBtn.disabled = true;
    analyzeBtn.textContent = 'Analyzing...';


    try {

        /*
        |--------------------------------------------------------------------------
        | Send URL to FastAPI Docker Backend
        |--------------------------------------------------------------------------
        */

        const response = await fetch(API_URL, {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                url: raw
            })

        });


        /*
        |--------------------------------------------------------------------------
        | Check HTTP Status
        |--------------------------------------------------------------------------
        */

        if (!response.ok) {

            throw new Error(
                `Server returned HTTP ${response.status}`
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Read JSON
        |--------------------------------------------------------------------------
        */

        const data = await response.json();


        /*
        |--------------------------------------------------------------------------
        | Display ML Result
        |--------------------------------------------------------------------------
        */

        renderResult(data);


    } catch (error) {

        console.error('Analysis error:', error);

        errorMsg.textContent =
            'Could not reach the analysis server. Make sure the Docker backend is running.';

        errorMsg.style.display = 'block';

        resultSection.classList.remove('visible');

    } finally {

        analyzeBtn.disabled = false;
        analyzeBtn.textContent = 'Analyze';

    }
}


/*
|--------------------------------------------------------------------------
| Analyze Button
|--------------------------------------------------------------------------
*/

analyzeBtn.addEventListener('click', analyzeURL);


/*
|--------------------------------------------------------------------------
| Enter Key
|--------------------------------------------------------------------------
*/

urlInput.addEventListener('keydown', event => {

    if (event.key === 'Enter') {
        analyzeURL();
    }

});