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

const SUSPICIOUS_TLDS = ['xyz','top','tk','ml','ga','cf','gq','work','click','link','zip','review','country','kim','loan','men','date','faith','racing','win'];
const BRAND_WORDS = ['paypal','google','microsoft','apple','amazon','facebook','instagram','netflix','bank','chase','wellsfargo','irs','outlook','office365'];
const URGENT_WORDS = ['login','verify','secure','update','confirm','account','signin','password','billing','suspended'];

function normalizeUrl(raw){
  let value = raw.trim();
  if(!value) return null;
  if(!/^https?:\/\//i.test(value)){
    value = 'http://' + value;
  }
  try{
    return new URL(value);
  }catch(e){
    return null;
  }
}

function analyzeUrl(urlObj, rawInput){
  const reasons = [];
  let score = 0; // higher = more suspicious
  const hostname = urlObj.hostname.toLowerCase();
  const fullUrl = urlObj.href;

  // 1. IP address as hostname
  const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  if(isIp){
    score += 3;
    reasons.push('Uses a raw IP address instead of a domain name');
  }

  // 2. Not using HTTPS
  if(urlObj.protocol !== 'https:'){
    score += 1;
    reasons.push('Connection is not secured with HTTPS');
  }

  // 3. "@" symbol trick
  if(rawInput.includes('@')){
    score += 3;
    reasons.push('Contains an "@" symbol, often used to disguise the real destination');
  }

  // 4. Suspicious TLD
  const tld = hostname.split('.').pop();
  if(SUSPICIOUS_TLDS.includes(tld)){
    score += 2;
    reasons.push(`Uses an uncommon top-level domain (.${tld}) frequently linked to spam sites`);
  }

  // 5. Excessive subdomains / hyphens
  const subdomainCount = hostname.split('.').length - 2;
  if(subdomainCount > 2){
    score += 2;
    reasons.push('Has an unusually long chain of subdomains');
  }
  const hyphenCount = (hostname.match(/-/g) || []).length;
  if(hyphenCount >= 3){
    score += 1;
    reasons.push('Domain name contains many hyphens');
  }

  // 6. Brand name mismatch (brand mentioned but not as the real registered domain)
  const domainRoot = hostname.split('.').slice(-2, -1)[0] || '';
  BRAND_WORDS.forEach(brand => {
    if(hostname.includes(brand) && domainRoot !== brand){
      score += 3;
      reasons.push(`Mentions "${brand}" without being an official ${brand} domain`);
    }
  });

  // 7. Urgency / credential keywords in path or query
  const pathAndQuery = (urlObj.pathname + urlObj.search).toLowerCase();
  URGENT_WORDS.forEach(word => {
    if(pathAndQuery.includes(word)){
      score += 1;
    }
  });
  if(URGENT_WORDS.some(w => pathAndQuery.includes(w))){
    reasons.push('URL path contains account/login-related keywords often used in phishing links');
  }

  // 8. Very long URL
  if(fullUrl.length > 90){
    score += 1;
    reasons.push('Unusually long URL, which can be used to hide the true destination');
  }

  // 9. Punycode / suspicious unicode
  if(hostname.includes('xn--')){
    score += 3;
    reasons.push('Domain uses punycode encoding, sometimes used to fake familiar brand names');
  }

  let risk, status, isDanger;
  if(score >= 5){
    risk = 'High';
    status = 'Phishing Threat';
    isDanger = true;
  } else if(score >= 2){
    risk = 'Medium';
    status = 'Suspicious';
    isDanger = true;
  } else {
    risk = 'Low';
    status = 'Fine';
    isDanger = false;
  }

  return { risk, status, isDanger, reasons, score };
}

function renderResult(urlObj, rawInput){
  const { risk, status, isDanger, reasons } = analyzeUrl(urlObj, rawInput);

  resultBox.classList.toggle('danger', isDanger);
  iconCircle.classList.toggle('danger', isDanger);
  resultLabel.classList.toggle('danger', isDanger);

  if(isDanger){
    iconSvg.setAttribute('stroke', '#d64545');
    iconSvg.innerHTML = '<circle cx="12" cy="12" r="10"/><path d="M12 8v5"/><path d="M12 16h.01"/>';
    resultLabel.textContent = status.toUpperCase();
    resultDesc.textContent = risk === 'High'
      ? 'This website shows strong signs of being a phishing threat. Avoid entering any information.'
      : 'This website shows some suspicious signs. Proceed with caution.';
  } else {
    iconSvg.setAttribute('stroke', '#1f9d55');
    iconSvg.innerHTML = '<path d="M12 2 4 5v6c0 5 3.4 8.6 8 11 4.6-2.4 8-6 8-11V5z"/><path d="m9 12 2 2 4-4"/>';
    resultLabel.textContent = 'FINE';
    resultDesc.textContent = 'This website appears to be safe.';
  }

  detailUrl.textContent = urlObj.href;
  detailStatus.textContent = status;
  detailStatus.className = 'value ' + (isDanger ? 'danger' : '');
  detailRisk.textContent = risk;
  detailRisk.className = 'value ' + (isDanger ? 'danger' : '');

  const now = new Date();
  detailDate.textContent = now.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
  });

  reasonsList.innerHTML = '';
  if(reasons.length){
    reasons.forEach(r => {
      const li = document.createElement('li');
      li.textContent = r;
      reasonsList.appendChild(li);
    });
  } else {
    const li = document.createElement('li');
    li.textContent = 'No suspicious patterns detected in the URL structure.';
    reasonsList.appendChild(li);
  }

  resultSection.classList.add('visible');
}

analyzeBtn.addEventListener('click', () => {
  const raw = urlInput.value;
  const urlObj = normalizeUrl(raw);

  if(!urlObj){
    errorMsg.style.display = 'block';
    resultSection.classList.remove('visible');
    return;
  }
  errorMsg.style.display = 'none';
  renderResult(urlObj, raw.trim());
});

urlInput.addEventListener('keydown', (e) => {
  if(e.key === 'Enter') analyzeBtn.click();
});
analyzeBtn.addEventListener('click', async () => {
  const raw = urlInput.value.trim();
  if (!raw) {
    errorMsg.style.display = 'block';
    resultSection.classList.remove('visible');
    return;
  }
  errorMsg.style.display = 'none';
  analyzeBtn.disabled = true;
  analyzeBtn.textContent = 'Analyzing...';

  try {
    const res = await fetch('http://localhost:8000/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: raw })
    });
    const data = await res.json();
    renderResult(data);
  } catch (err) {
    errorMsg.textContent = 'Could not reach the analysis server. Is app.py running?';
    errorMsg.style.display = 'block';
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = 'Analyze';
  }
});

function renderResult(data) {
  const isDanger = data.isDanger;
  resultBox.classList.toggle('danger', isDanger);
  iconCircle.classList.toggle('danger', isDanger);
  resultLabel.classList.toggle('danger', isDanger);

  if (isDanger) {
    iconSvg.setAttribute('stroke', '#d64545');
    iconSvg.innerHTML = '<circle cx="12" cy="12" r="10"/><path d="M12 8v5"/><path d="M12 16h.01"/>';
    resultLabel.textContent = data.status.toUpperCase();
    resultDesc.textContent = 'This website shows signs of being a phishing threat. Avoid entering any information.';
  } else {
    iconSvg.setAttribute('stroke', '#1f9d55');
    iconSvg.innerHTML = '<path d="M12 2 4 5v6c0 5 3.4 8.6 8 11 4.6-2.4 8-6 8-11V5z"/><path d="m9 12 2 2 4-4"/>';
    resultLabel.textContent = 'FINE';
    resultDesc.textContent = 'This website appears to be safe.';
  }

  detailUrl.textContent = data.url;
  detailStatus.textContent = data.status;
  detailStatus.className = 'value ' + (isDanger ? 'danger' : '');
  detailRisk.textContent = data.risk;
  detailRisk.className = 'value ' + (isDanger ? 'danger' : '');
  detailDate.textContent = new Date().toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
  });

  reasonsList.innerHTML = '';
  const reasons = data.reasons.length ? data.reasons : ['No suspicious patterns detected.'];
  reasons.forEach(r => {
    const li = document.createElement('li');
    li.textContent = r.replace(/_/g, ' ');
    reasonsList.appendChild(li);
  });

  resultSection.classList.add('visible');
}