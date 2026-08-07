import re
import socket
import ssl
from datetime import datetime
from urllib.parse import urlparse

import requests
import whois
import dns.resolver
from bs4 import BeautifulSoup

TIMEOUT = 5
SHORTENERS = ["bit.ly", "goo.gl", "tinyurl.com", "t.co", "is.gd", "ow.ly", "buff.ly"]


def safe(fn, default=-1):
    try:
        return fn()
    except Exception:
        return default


def extract_features(url: str) -> dict:
    if not re.match(r"^https?://", url, re.I):
        url = "http://" + url

    parsed = urlparse(url)
    hostname = parsed.hostname or ""
    features = {}

    # Try fetching the page once, reuse for HTML-based features
    html, resp = None, None
    try:
        resp = requests.get(url, timeout=TIMEOUT, allow_redirects=True,
                             headers={"User-Agent": "Mozilla/5.0"})
        html = resp.text
    except Exception:
        pass
    soup = BeautifulSoup(html, "html.parser") if html else None

    # 1. having_IPhaving_IP_Address
    features["having_IPhaving_IP_Address"] = -1 if re.match(
        r"^\d{1,3}(\.\d{1,3}){3}$", hostname) else 1

    # 2. URLURL_Length
    length = len(url)
    features["URLURL_Length"] = 1 if length < 54 else (0 if length <= 75 else -1)

    # 3. Shortining_Service
    features["Shortining_Service"] = -1 if any(s in hostname for s in SHORTENERS) else 1

    # 4. having_At_Symbol
    features["having_At_Symbol"] = -1 if "@" in url else 1

    # 5. double_slash_redirecting
    features["double_slash_redirecting"] = -1 if url.rfind("//") > 7 else 1

    # 6. Prefix_Suffix
    features["Prefix_Suffix"] = -1 if "-" in hostname else 1

    # 7. having_Sub_Domain
    dots = hostname.count(".")
    features["having_Sub_Domain"] = 1 if dots <= 1 else (0 if dots == 2 else -1)

    # 8. SSLfinal_State (approx: valid HTTPS cert vs not)
    def ssl_check():
        if parsed.scheme != "https":
            return -1
        ctx = ssl.create_default_context()
        with socket.create_connection((hostname, 443), timeout=TIMEOUT) as sock:
            with ctx.wrap_socket(sock, server_hostname=hostname):
                return 1
    features["SSLfinal_State"] = safe(ssl_check, default=0)

    # 9. Domain_registeration_length (via WHOIS expiry)
    def reg_length():
        w = whois.whois(hostname)
        exp = w.expiration_date
        creation = w.creation_date
        if isinstance(exp, list): exp = exp[0]
        if isinstance(creation, list): creation = creation[0]
        if exp and creation:
            days = (exp - creation).days
            return 1 if days > 365 else -1
        return -1
    features["Domain_registeration_length"] = safe(reg_length, default=-1)

    # 10. Favicon
    features["Favicon"] = 1 if (soup and soup.find("link", rel=re.compile("icon", re.I))) else -1

    # 11. port (non-standard port used)
    features["port"] = -1 if parsed.port not in (None, 80, 443) else 1

    # 12. HTTPS_token (brand trick like "https-paypal.com")
    features["HTTPS_token"] = -1 if "https" in hostname.replace("www.", "") else 1

    # 13. Request_URL (external resources ratio)
    def request_url_ratio():
        if not soup: return -1
        tags = soup.find_all(["img", "script", "video", "audio"])
        if not tags: return 1
        external = sum(1 for t in tags if t.get("src") and hostname not in t.get("src"))
        pct = external / len(tags)
        return 1 if pct < 0.22 else (0 if pct <= 0.61 else -1)
    features["Request_URL"] = safe(request_url_ratio, default=0)

    # 14. URL_of_Anchor
    def anchor_ratio():
        if not soup: return -1
        anchors = soup.find_all("a", href=True)
        if not anchors: return 1
        bad = sum(1 for a in anchors if a["href"].startswith("#") or "javascript:void" in a["href"])
        pct = bad / len(anchors)
        return 1 if pct < 0.31 else (0 if pct <= 0.67 else -1)
    features["URL_of_Anchor"] = safe(anchor_ratio, default=0)

    # 15. Links_in_tags (meta/script/link external ratio) - simplified
    features["Links_in_tags"] = features["Request_URL"]

    # 16. SFH (form action pointing elsewhere / blank)
    def sfh_check():
        if not soup: return -1
        forms = soup.find_all("form")
        for f in forms:
            action = f.get("action", "")
            if action in ("", "about:blank"):
                return -1
            if hostname not in action and action.startswith("http"):
                return 0
        return 1
    features["SFH"] = safe(sfh_check, default=0)

    # 17. Submitting_to_email
    features["Submitting_to_email"] = -1 if (html and "mailto:" in html.lower()) else 1

    # 18. Abnormal_URL (hostname not present in WHOIS registrant info)
    def abnormal_check():
        w = whois.whois(hostname)
        return 1 if w.domain_name else -1
    features["Abnormal_URL"] = safe(abnormal_check, default=-1)

    # 19. Redirect (number of redirects followed)
    features["Redirect"] = 0 if (resp and len(resp.history) <= 1) else -1

    # 20. on_mouseover (status bar tampering)
    features["on_mouseover"] = -1 if (html and "onmouseover" in html.lower()) else 1

    # 21. RightClick (disabled)
    features["RightClick"] = -1 if (html and "event.button==2" in html.lower()) else 1

    # 22. popUpWidnow
    features["popUpWidnow"] = -1 if (html and re.search(r"window\.open", html, re.I)) else 1

    # 23. Iframe
    features["Iframe"] = -1 if (soup and soup.find("iframe")) else 1

    # 24. age_of_domain
    def age_check():
        w = whois.whois(hostname)
        creation = w.creation_date
        if isinstance(creation, list): creation = creation[0]
        if creation:
            days = (datetime.now() - creation).days
            return 1 if days > 180 else -1
        return -1
    features["age_of_domain"] = safe(age_check, default=-1)

    # 25. DNSRecord
    def dns_check():
        dns.resolver.resolve(hostname, "A")
        return 1
    features["DNSRecord"] = safe(dns_check, default=-1)

    # 26-28: services that are effectively unavailable now — neutral placeholder.
    # Swap these for a real API call if you have access to one (e.g. Tranco rank).
    features["web_traffic"] = 0
    features["Page_Rank"] = 0
    features["Google_Index"] = 1  # most legitimate sites are indexed; can't verify live without an API

    # 29. Links_pointing_to_page (approx via anchor count on the page itself)
    def links_pointing():
        if not soup: return 0
        count = len(soup.find_all("a", href=True))
        return -1 if count == 0 else (0 if count <= 2 else 1)
    features["Links_pointing_to_page"] = safe(links_pointing, default=0)

    # 30. Statistical_report — would normally check against phishing blocklists (e.g. PhishTank API)
    features["Statistical_report"] = 1

    return features