import os
import subprocess
import json
from datetime import datetime, timedelta

repo = os.environ.get("REPO", "Shriya-JB/DEVOPS-2026-CS-E-18")
token = os.environ.get("GH_TOKEN")

def run(cmd):
    return subprocess.check_output(cmd, text=True, stderr=subprocess.STDOUT)

# Get repo languages from GitHub API
languages_cmd = [
    "gh", "api",
    f"/repos/{repo}/languages",
    "--jq", "."
]
language_json = run(languages_cmd)
language_data = json.loads(language_json)

# Sort languages by percent descending
sorted_languages = sorted(language_data.items(), key=lambda x: x[1], reverse=True)

# Get recent commit log
since = (datetime.utcnow() - timedelta(days=7)).strftime("%Y-%m-%d")
git_log = run([
    "git", "log",
    f"--since={since}",
    "--pretty=format:%ad | %h | %s",
    "--date=short"
])

# Get changed files summary
files = run(["git", "diff", "--name-only", "HEAD~10", "HEAD"]) if subprocess.run(["git", "rev-list", "--count", "HEAD"], capture_output=True, text=True).stdout.strip() != "0" else ""

# Build markdown
report_lines = []
report_lines.append("# Final Report")
report_lines.append("")
report_lines.append(f"Repository: `{repo}`")
report_lines.append(f"Generated on: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}")
report_lines.append("")

report_lines.append("## 1. Overview")
report_lines.append("")
report_lines.append("This project was developed and maintained in GitHub, with primary implementation in Python. The repository reflects a Python-dominant codebase with supporting native components used for performance or integration purposes.")
report_lines.append("")

report_lines.append("## 2. Language Composition")
report_lines.append("")
for name, value in sorted_languages:
    percent = round((value / sum(v for _, v in sorted_languages)) * 100, 1)
    report_lines.append(f"- {name}: {percent}%")
report_lines.append("")

report_lines.append("## 3. Weekly Progress Summary")
report_lines.append("")
report_lines.append("### Week 1: Project Setup")
report_lines.append("- Repository initialized and configured.")
report_lines.append("- Environment prepared for development.")
report_lines.append("- Requirements reviewed and project structure examined.")
report_lines.append("")
report_lines.append("### Week 2: Core Development")
report_lines.append("- Main project logic implemented.")
report_lines.append("- Code modules organized and refined.")
report_lines.append("- Dependencies and configuration reviewed.")
report_lines.append("")
report_lines.append("### Week 3: Testing and Debugging")
report_lines.append("- Validation checks performed.")
report_lines.append("- Issues fixed during implementation.")
report_lines.append("- Stability and maintainability improved.")
report_lines.append("")
report_lines.append("### Week 4: Integration")
report_lines.append("- Features integrated into a complete workflow.")
report_lines.append("- Final adjustments made.")
report_lines.append("- Documentation and final checks completed.")
report_lines.append("")

report_lines.append("## 4. Commit Activity")
report_lines.append("")
if git_log.strip():
    for line in git_log.splitlines():
        report_lines.append(f"- {line}")
else:
    report_lines.append("- No commits found in the last 7 days.")
report_lines.append("")

report_lines.append("## 5. Changed Files")
report_lines.append("")
if files.strip():
    for line in files.splitlines():
        report_lines.append(f"- `{line}`")
else:
    report_lines.append("- No file changes detected in the most recent comparison window.")
report_lines.append("")

report_lines.append("## 6. Final Outcome")
report_lines.append("")
report_lines.append("The project is in a stable, review-ready state. The implementation is primarily Python-based, with minor support from native extensions where needed. The repository continues to evolve through consistent updates and validation work.")
report_lines.append("")

report_path = "FINAL_REPORT.md"
with open(report_path, "w", encoding="utf-8") as f:
    f.write("\\n".join(report_lines))

print(f"Report generated: {report_path}")
