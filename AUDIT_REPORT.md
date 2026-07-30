# Audit Report — Business-QR (Initial State)

**Date**: July 30, 2026  
**Auditor**: Senior Software Architect & UI/UX Specialist  

---

## Executive Summary
`Business-QR` is a static web application designed for physical business locations to collect Google Reviews via QR code scans. While the core concept is strong, the current codebase exhibits several critical cross-platform bugs, hardcoded local file paths, broken popup redirects, missing responsive UI components, and inconsistent naming conventions.

---

## Detailed Findings

### 1. High Severity Issues & Bugs
- **Hardcoded OS Paths in `generate_qrs.py`**: Lines 8-10 reference explicit Windows paths (`C:\Users\AVISHKAR\Documents\...`). Running this script on any other device, CI/CD pipeline, or Vercel server will immediately crash with a `FileNotFoundError`.
- **Safari/iOS Popup Blocker Trigger**: In `js/script.js`, `window.open(currentBizLink, '_blank')` is executed inside a 2-second `setTimeout`. Modern mobile browsers (iOS Safari, Android Chrome) block asynchronous `window.open` calls that are not directly tied to a user gesture event thread.
- **Capitalization & Host Compatibility**: `Style.CSS` uses mixed case. On POSIX systems and static hosting environments (Vercel, Netlify), file path case mismatching leads to missing styles.
- **Space in Directory Names**: Directory `QR Code` contains spaces. This causes URL escaping issues (`%20`) and script path failures across non-Windows operating systems.

### 2. Data & Logic Inconsistencies
- **JSON Schema Mismatch**: `data/businesses.json` uses `"link"` for review URLs, whereas `README.md` documents `"googleReviewLink"`.
- **Duplicate Review Links**: All sample entries (`Kumar_Digital_Photo_Studio`, `Avishkar_Photos`, `Siddhi_Photos`) point to the identical search URL.
- **Unreachable State Handling**: If a business ID is missing or invalid, the UI displays a basic fallback state but provides no way to recover or search for businesses.

### 3. UI / UX & Accessibility Gaps
- **Disabling Page Zoom (`user-scalable=no`)**: Violates WCAG 2.1 accessibility requirements.
- **Missing Apple Aesthetics**: Standard basic CSS gradient, lack of fluid animations, rigid layout scaling, and non-standard typography hierarchy.
- **Static Pre-written Reviews**: Hardcoded single static review for each star level. Users cannot customize, re-roll, or select aspects (e.g., service, quality, speed) to generate realistic review text.
- **Missing Favicon & OpenGraph Metadata**: No social cards, touch icons, or favicon configured.

---

## Remediation Strategy
1. Modernize codebase architecture with standard web structure (`src/`, `public/`, `assets/`, `config/`).
2. Fix Python path resolution to use dynamic relative paths.
3. Replace async pop-up blockers with smooth immediate clipboard copy + fluid page transition.
4. Upgrade UI to Apple-inspired dark/light design system with smooth spring micro-animations, dynamic review builder, live QR generator modal, and responsive glassmorphism layout.
5. Deploy to Vercel and write comprehensive documentation.
