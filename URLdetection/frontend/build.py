import json
import os
from pathlib import Path
from shutil import copyfile
from urllib.parse import urlparse


FRONTEND_DIR = Path(__file__).resolve().parent
DIST_DIR = FRONTEND_DIR / "dist"


def read_api_base_url_from_dotenv(dotenv_path):
    if not dotenv_path.is_file():
        return ""

    for line in dotenv_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        if key.strip() == "API_BASE_URL":
            return value.strip().strip("\"'")

    return ""


def main():
    api_base_url = os.environ.get("API_BASE_URL", "").strip()
    if not api_base_url:
        api_base_url = read_api_base_url_from_dotenv(FRONTEND_DIR / ".env")
    api_base_url = api_base_url.rstrip("/")

    parsed_url = urlparse(api_base_url)
    if parsed_url.scheme not in {"http", "https"} or not parsed_url.netloc:
        raise SystemExit("Set API_BASE_URL in frontend/.env or the build environment.")

    source_script = (FRONTEND_DIR / "script.js").read_text(encoding="utf-8")
    placeholder = "__API_BASE_URL__"
    if source_script.count(placeholder) != 1:
        raise SystemExit("Expected one API_BASE_URL placeholder in script.js.")

    DIST_DIR.mkdir(parents=True, exist_ok=True)
    copyfile(FRONTEND_DIR / "index.html", DIST_DIR / "index.html")
    copyfile(FRONTEND_DIR / "style.css", DIST_DIR / "style.css")
    built_script = source_script.replace(placeholder, json.dumps(api_base_url))
    (DIST_DIR / "script.js").write_text(built_script, encoding="utf-8")


if __name__ == "__main__":
    main()