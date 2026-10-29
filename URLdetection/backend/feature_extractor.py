import re
from urllib.parse import urlparse

SUSPICIOUS_WORDS = [
    "login", "signin", "verify", "update", "secure", "account", "banking",
    "confirm", "password", "webscr", "paypal", "ebay", "suspend", "wallet",
]

IP_RE = re.compile(r"^\d{1,3}(\.\d{1,3}){3}$")


def _get_host(url: str) -> str:
    # urlparse needs "//" to recognise the host when no scheme is given.
    # Malformed URLs (e.g. broken IPv6 brackets) can raise ValueError.
    try:
        parsed = urlparse(url if "://" in url else "//" + url)
        return (parsed.hostname or "").lower()
    except ValueError:
        host = re.sub(r"^[a-z][a-z0-9+.-]*://", "", url.lower())
        host = re.split(r"[/?#]", host, maxsplit=1)[0]
        host = host.split("@")[-1]
        return host.split(":")[0]


def extract_features(url: str) -> dict:
    url = str(url or "").strip()
    lower = url.lower()
    host = _get_host(url)

    parts = [p for p in host.split(".") if p]
    has_www = 1 if host.startswith("www.") else 0
    core_parts = parts[1:] if has_www else parts
    num_subdomains = max(0, len(core_parts) - 2)

    num_digits = sum(c.isdigit() for c in url)
    num_letters = sum(c.isalpha() for c in url)

    return {
        "url_length": len(url),
        "domain_length": len(host),
        "has_ip": 1 if IP_RE.match(host) else 0,
        "num_dots": url.count("."),
        "num_hyphens": url.count("-"),
        "num_at": url.count("@"),
        "num_qm": url.count("?"),
        "num_and": url.count("&"),
        "num_equals": url.count("="),
        "num_underscore": url.count("_"),
        "num_slash": url.count("/"),
        "num_digits": num_digits,
        "num_letters": num_letters,
        "digit_ratio": num_digits / len(url) if url else 0,
        "has_https": 1 if lower.startswith("https") else 0,
        "num_subdomains": num_subdomains,
        "has_www": has_www,
        "suspicious_words": sum(lower.count(w) for w in SUSPICIOUS_WORDS),
    }