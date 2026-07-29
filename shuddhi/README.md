# Shuddhi — Windows PC Cleanup Guide

Step-by-step guide to clean a compromised Windows PC, with an automated scanner script.

**How it works:** Read the guide steps in order — Windows Defender offline scan, remove unknown programs, disable suspicious startup apps, reset browser, change passwords. The included `cleanpc.bat` (run as Administrator) scans for suspicious processes, startup entries, script hosts, and registry run keys, then lets you remove flagged items one by one.

**Trust:** Before running `cleanpc.bat` as Administrator, verify it matches the version in this repo — the file is safe as-shipped, but you should confirm no tampering occurred in transit. Clone the repo or diff against the raw file at `https://raw.githubusercontent.com/sdachary/prayog/main/shuddhi/cleanpc.bat`.

**Live URL:** `https://prayog.pages.dev/shuddhi/`
