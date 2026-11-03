import json
import os
from pathlib import Path
from urllib.parse import urlparse


PROJECT_ROOT = Path(__file__).resolve().parent.parent
FRONTEND_DIR = PROJECT_ROOT / "URLdetection" / "frontend"


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
    dotenv_path = PROJECT_ROOT / ".env"
    api_base_url = os.environ.get("API_BASE_URL", "").strip()
    if not api_base_url:
        api_base_url = read_api_base_url_from_dotenv(dotenv_path)
    api_base_url = api_base_url.rstrip("/")

    parsed_url = urlparse(api_base_url)
    if parsed_url.scheme not in {"http", "https"} or not parsed_url.netloc:
        raise SystemExit("Set API_BASE_URL in .env or the build environment.")

    config = f"window.API_BASE_URL = {json.dumps(api_base_url)};\n"
    (FRONTEND_DIR / "config.js").write_text(config, encoding="utf-8")


if __name__ == "__main__":
    main()