
---

# Product Requirements Document (PRD): InstaScrape Local Web Studio

## 1. Product Overview

**Name:** InstaScrape Studio
**Description:** A locally hosted web application that automates the creation of high-quality, branded Instagram carousel posts. It provides a visual, browser-based user interface that communicates directly with your local PC. Users can input URLs, tweak visual settings via sliders, see live previews, and hit "Generate" to have the Python backend scrape, composite, and save the final images directly to their local file system.
**Goal:** Achieve zero-friction carousel creation. Eliminate manual configuration files (JSON/YAML) and terminal commands in favor of a one-click visual interface.

## 2. Core Objectives

* **Frictionless UX:** Zero manual code editing. Everything is handled via copy-paste and visual sliders in a browser tab.
* **Live Previewing:** Users must be able to see an approximation of the final composite before rendering to prevent wasted time.
* **Deep PC Integration:** The app must run locally, seamlessly reading local branding assets (logos, fonts) and writing final files directly to local directories (e.g., Desktop).
* **High-Fidelity Output:** Retain the web-rendering approach (HTML/CSS compositing) to ensure pixel-perfect text wrapping, drop shadows, and 5px border radii.

---

## 3. Key Features & Requirements

### 3.1. The Local Web Interface (Frontend)

The system will launch a local server and open a browser window (`http://localhost:5000`).

* **Batch Input Zone:** A text area to paste a list of URLs (one per line).
* **Cover Slide Configuration:** Input fields for the main Title and Subtitle.
* **Visual Control Panel:**
* Sliders for background blur intensity and screenshot border radius.
* Toggles for noise/grain overlay and drop shadows.
* Input fields for global branding (Top Right Text, Bottom Left Text, etc.).


* **Live Preview Canvas:** A visual container that updates in real-time as texts or sliders are adjusted.
* **One-Click Generation:** A "Generate Carousel" button that triggers the local backend process.

### 3.2. Local File System Integration

Because the app runs locally, it bridges the gap between the web UI and your PC's hard drive.

* **Asset Management:** The app reads your custom icons, fonts, and base noise textures directly from a local `/assets` folder.
* **Direct Output:** Upon completion, the app writes the final `1080x1350` PNGs sequentially (`01_cover.png`, `02_content.png`) into an automatically generated, timestamped folder on your Desktop or chosen directory.

### 3.3. Scraping & Data Extraction Engine (Backend)

Triggered by the frontend "Generate" button.

* **Headless Browsing:** The Python backend uses Playwright to navigate to each provided URL invisibly.
* **Clean Capture:** Waits for the network to idle, then captures a high-resolution screenshot of the website's hero section.
* **Smart Metadata Scraping:** Extracts the `<title>` and `<meta name="description">`, applying a basic sanitization script to strip out excessive SEO keywords so it fits the aesthetic template.

### 3.4. Compositing & Rendering Engine (Backend)

* **Dynamic Templating:** Injects the scraped screenshot, cleaned text, and the UI slider variables into an invisible, local HTML/CSS template via Jinja2.
* **CSS Wizardry:** The template handles the dynamic background (blurred, scaled-up copy of the screenshot), the noise overlay, and typography placement.
* **Final Render:** Playwright takes a pixel-perfect screenshot of this local HTML template and saves it to the output folder.

---

## 4. User Flow

1. **Launch:** User double-clicks `start.bat` (or similar executable).
2. **Interface Opens:** The default web browser automatically opens to the local app dashboard.
3. **Input:** User types the cover slide text and pastes 5-10 URLs into the text box.
4. **Tweak:** User adjusts sliders (if needed) and verifies the look on the live preview canvas.
5. **Execute:** User clicks "Generate". The UI shows a loading state.
6. **Completion:** The app pings a success message. The user opens the newly created folder on their PC, containing perfectly formatted images ready to drag and drop into Instagram.

---
Moving to **Next.js** is a massive upgrade. It unifies your entire stack. Instead of splitting the app between Python (FastAPI/Playwright) and standard HTML/JS, you can do absolutely everything in JavaScript/TypeScript. Next.js can handle the polished React frontend while its Node.js backend handles the local file system and automation tasks.

Here is the revised Technical Architecture section for your PRD.

---

## 5. Technical Architecture (Updated)

* **Core Framework:** `Next.js` (App Router). This provides a built-in local development server to host your UI and handle backend logic simultaneously.
* **Frontend UI:** `React` and `Tailwind CSS`. React's client-side state management is perfect for handling the live visual sliders, text inputs, and instantly updating the preview canvas.
* **Backend & File System:** Next.js Route Handlers (Node.js). Because the app runs locally on your machine, the Node.js backend has full access to the native `fs` (File System) module. It will securely read your local logos/fonts and write the final output PNGs directly to your Desktop or desired folder.
* **Browser Automation & Scraping:** `Playwright` (Node.js version). When you click "Generate", a Next.js API route triggers a Playwright instance to run silently. It will visit the URLs, wait for the network to idle, scrape the metadata, and take the raw screenshots.
* **Compositing Engine (The Template):** We drop Python and Jinja2 completely. Instead, you build a hidden Next.js route (e.g., `localhost:3000/render`). Playwright navigates to this hidden React page, injects the scraped screenshot and slider settings via URL parameters, waits for the CSS blur and grain to render, and takes a pixel-perfect `1080x1350` screenshot of that specific route.
* **Execution:** You simply open your terminal, type `npm run dev` (for development) or `npm run start` (for a faster, optimized production build), and open your browser to start building carousels.
---

## 6. Out of Scope (V1)

* Automated cloud deployment (this is strictly a local tool for your PC).
* Direct API posting to Meta/Instagram (to avoid complex OAuth approvals; manual upload is faster for now).
* Complex image editing tools within the UI (e.g., cropping specific parts of the scraped website; the tool will rely on standard viewport captures).

