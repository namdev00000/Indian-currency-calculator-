# Indian Currency Calculator & Cash Record Website 🇮🇳

> **Engineered By:** **Namdev** with **Google Antigravity**  
> **Powered By:** **Gemini 3.8 Flash**  
> **Tech Stack:** HTML5, CSS3 (3D Transforms & Custom Properties), Vanilla ES6+ JavaScript, Web Audio API  
> **Dependencies:** None (100% Client-Side, Zero External Libraries, Fully Offline Capable)

A minimalist, high-precision web application engineered specifically for counting, tallying, and reconciling physical Indian currency notes and coins. Featuring authentic Reserve Bank of India (RBI) banknote visuals, Government of India coinage assets, a live Indian Standard Time (IST) clock, automated time-based day/night themes, an interactive 3D physics welcome coin animation, and professional printable **Cash Record** vouchers.

---

## 🌟 Key Highlights at a Glance

* **Complete Indian Denominations:** 10 standard currency tiers from ₹500 banknotes down to 50 Paise coins.
* **Unified Dual Denominations:** Combined ₹20, ₹10, and ₹1 note-and-coin rows displayed side-by-side with zero overlap and an official **`NOTE OR COIN`** badge.
* **3-Tier Theme Engine:** Seamless switching between **Light** (pure white), **Dark** (true AMOLED pitch black), and **System** (automated day/night switching according to live IST hours).
* **Live IST Clock & Calendar:** Real-time clock calibrated strictly to Indian Standard Time (UTC+05:30, Asia/Kolkata).
* **3D Welcome Coin Experience:** Physical 3D Rupee coin that drops from above, spins in the middle, and collapses with an authentic Web Audio synthesized multi-coin collision crash sound, ending upright on its heads front face (`₹`).
* **Vedic Indian Numbering System:** Automatic formatting in Lakhs and Crores (`₹ 1,45,250.50`) alongside an algorithmic **Amount in Words** translator.
* **Cash Record Voucher & Print Engine:** Clean, single-page printable deposit/tally slip with bank-grade formatting.
* **History Management:** LocalStorage persistence, 1-click restore, WhatsApp-ready text breakdown copying, and CSV spreadsheet export.

---

## 🪙 Denomination Catalog & Asset Specifications

The calculator handles all active legal tender denominations circulating in India:

| Denomination | Form Factor | Asset Title / Details | Badge Type | Quick Presets |
| :--- | :--- | :--- | :--- | :--- |
| **₹ 500** | Banknote | Mahatma Gandhi New Series (Stone Grey) | `NOTE` | +1, +5, +10, +20, +50, +100 |
| **₹ 200** | Banknote | Mahatma Gandhi New Series (Bright Yellow, Sanchi Stupa) | `NOTE` | +1, +5, +10, +20, +50, +100 |
| **₹ 100** | Banknote | Mahatma Gandhi New Series (Lavender, Rani ki Vav) | `NOTE` | +1, +5, +10, +20, +50, +100 |
| **₹ 50** | Banknote | Mahatma Gandhi New Series (Fluorescent Blue, Hampi Chariot) | `NOTE` | +1, +5, +10, +20, +50 |
| **₹ 20** | Note or Coin | Side-by-side Ellora Caves Note + Bimetallic ₹20 Coin | `NOTE OR COIN` | +1, +5, +10, +20, +50 |
| **₹ 10** | Note or Coin | Side-by-side Konark Sun Temple Note + Bimetallic ₹10 Coin | `NOTE OR COIN` | +1, +5, +10, +20, +50 |
| **₹ 5** | Coin | Nickel-Brass / Stainless Steel ₹5 Coin Close-Up | `COIN` | +1, +5, +10, +20, +50 |
| **₹ 2** | Coin | Embossed Unity & Value ₹2 Coin on Transparency | `COIN` | +1, +5, +10, +20, +50 |
| **₹ 1** | Note or Coin | Side-by-side Historic ₹1 Note + Isolated ₹1 Coin | `NOTE OR COIN` | +1, +5, +10, +20, +50 |
| **50 Paise** | Coin | Half Rupee Stainless Steel Coin Medallion (₹ 0.50) | `COIN` | +1, +5, +10, +20 |

### Dual Denomination Presentation (₹20, ₹10, ₹1)
In the Indian economy, ₹20, ₹10, and ₹1 circulate in both banknote and coin forms. The calculator unifies each of these into a single tally row. Rather than overlapping or clipping, the assets are placed side-by-side inside an engineered flexbox stage (`.denom-combined-stage`), separated by a subtle golden divider with the **`NOTE OR COIN`** badge.

### Visual Lightbox Zoom & Representation Disclaimer
Clicking any banknote or coin asset in the interface opens an interactive, high-resolution visual inspection Lightbox. For combined items, both the note and coin are rendered side-by-side at high magnification. Every inspection view prominently includes the educational disclaimer:
> ⚠️ *"The visual currency note you see not factual correct this maninly for representation or an basic understanding only."*

---

## ☀️🌙 3-Tier Theme System & Indian Standard Time

The application includes an adaptive theming engine that accommodates user preference as well as the natural Indian diurnal cycle:

1. **Light Theme:** Ultra-crisp minimalist white (`#ffffff` canvas with high-contrast `#09090b` typography and soft slate borders).
2. **Dark Theme:** True AMOLED pitch black (`#000000` canvas with crisp `#ffffff` text and subtle `#262626` borders for maximum battery efficiency on mobile OLED screens).
3. **System Theme (Automated Indian Time Zone):**
   - Automatically queries **Indian Standard Time (IST, UTC+05:30 / Asia/Kolkata)**.
   - **Daytime (06:00 AM – 06:00 PM IST):** Automatically enables Light Theme (White).
   - **Nighttime (06:00 PM – 06:00 AM IST):** Automatically enables Dark Theme (Black).
   - A dynamic status indicator in the top header displays whether **IST Day ☀️** or **IST Night 🌙** is currently driving the display.

A segmented header control allows switching between **Light**, **Dark**, and **System** with immediate persistence.

---

## ⏰ Live IST Digital Clock & Calendar

The application features a live digital clock in the header that displays time and date strictly in Indian Standard Time, regardless of the user's computer timezone:
* **Format:** `Thu, 22 Oct 2026 • 08:45:20 PM IST`
* **Technology:** Uses ECMAScript `Intl.DateTimeFormat` with `timeZone: 'Asia/Kolkata'` updating every 1000ms with zero layout shifts.

---

## 🪙 3D Welcome Coin Animation & Multi-Coin Crash Audio

On page load (or upon clicking the header logo button to replay), users experience an introductory animation:

1. **Plunge from Top (25% Slower):** The 3D Indian Rupee coin plunges gracefully from above the viewport (`translateY(-85vh)`) into the vertical middle over an extended 3.3-second timeline designed for comfortable visual tracking.
2. **Fast 3D Spin:** As it arrives at the center, the coin rotates rapidly in 3D perspective across multiple full $360^\circ$ revolutions with a reflective lighting sweep.
3. **Impact & Collapse:** At the 1.85-second mark (56% of timeline), the spin loses balance and the coin crashes down onto the surface with decaying wobble physics, triggering an expanding golden shockwave ripple ring (`#splash-coin-ring`) and particle spark bursts (`#splash-coin-sparks`).
4. **Front Face Focus:** After wobbling, the coin springs back upright to `rotateY(2160deg) rotateX(0deg) translateY(0)`. Because $2160^\circ$ is an exact multiple of $360^\circ$ ($6 \times 360^\circ$), the **front side** (`₹` Rupee symbol, *"BHARAT • INDIA"*, *"सत्यमेव जयते"*) stands squarely centered facing the user.
5. **Multi-Coin Crash Sound Effect:** Synthesized in real-time via the Web Audio API (zero audio files needed):
   - Simulates **2–3 metal coins clattering and colliding together** using detuned modal frequencies (2750 Hz, 3180 Hz, 3950 Hz, 4350 Hz, 5600 Hz, 6800 Hz, 8100 Hz).
   - Features a 35ms bandpass-filtered noise transient simulating sharp edge contact.
   - Includes **5 cascading rebound clatters** (+42ms, +95ms, +155ms, +225ms) mimicking physical coins bouncing off each other on a counter.
   - Features an aerodynamic in-air spin whoosh before the crash.
6. **Skip Anytime:** The intro can be dismissed instantly by clicking anywhere, pressing `Esc`, `Space`, or `Enter`, or clicking **"Skip Intro"**.

---

## ⚡ Real-Time Tallying & Indian Numbering Algorithm

* **Instantaneous Math:** As quantities change via direct keyboard entry or steppers, each row recalculates `Denomination × Quantity = Subtotal`.
* **Indian Numbering Formatting:** The Grand Total is formatted according to Indian financial conventions:
  $$\text{₹ } 12,34,567.50 \quad (\text{Twelve Lakh Thirty-Four Thousand Five Hundred Sixty-Seven Rupees and Fifty Paise})$$
* **Amount in Words Generator:** Automatically parses amounts into **Crores**, **Lakhs**, **Thousands**, **Hundreds**, **Rupees**, and **Paise** with grammatically accurate suffixing (`Rupees ... Only`).
* **Pieces Summary:** Displays a live counter of total physical pieces, broken down into Notes vs Coins.
* **Quick Multiplier Pills:** 1-click addition buttons (`+1`, `+5`, `+10`, `+20`, `+50`, `+100`) for rapid counting.

---

## 📄 Cash Record Voucher & Print Engine

For business, banking, and cashier end-of-day cash reconciliation, the application generates a professional **Cash Record**:
* **Voucher Metadata:** Includes Date & Time in IST, Record Title, and Depositor Name field.
* **Full Denomination Table:** Line-by-line breakdown of Denomination, Type (`Note`, `Coin`, or `Note or Coin`), Pieces, and Subtotal.
* **Total Figures:** Total Pieces, Grand Total in Figures (₹), and Grand Total in Indian Words.
* **Authorized Signatures:** Built-in signature boxes for Depositor and Cashier / Receiver.
* **Dedicated Single-Page Print Layout:** Overhauled with dedicated `@media print` rules:
  - Automatically isolates `.bank-slip-doc`, hiding all page headers, modals, floating buttons, and background elements.
  - Formats neatly onto standard A4 / Letter paper with zero ink-wasting dark backgrounds.

---

## 📜 History Management & Data Export

* **Save Tallies:** Save any active count with custom remarks (e.g., *"Daily Store Close"*, *"Bank Deposit Batch #1"*).
* **Saved History Drawer:** Slide-out drawer reviewing previous tallies with exact IST timestamps.
* **1-Click Restore:** Reload any saved count back into the active calculator with one click.
* **Copy Breakdown:** Copies a formatted plain-text summary to clipboard, formatted for instant pasting into WhatsApp, Telegram, or SMS.
* **Export to CSV:** Generates and downloads a spreadsheet-ready `.csv` file containing timestamped historical breakdowns across all 10 denominations.

---

## ⌨️ Usability & Keyboard Shortcuts

| Shortcut / Action | Function |
| :--- | :--- |
| `Enter` (inside Quantity input) | Advances focus to the next denomination input field |
| `Up Arrow` / `Down Arrow` | Increments / decrements the quantity stepper |
| `Escape` / `Space` / `Enter` | Immediately dismisses the 3D coin welcome splash screen |
| `Escape` | Closes any open modal (Cash Record, Lightbox, History Drawer) |
| Click Header Logo | Replays the 3D coin fall, spin, collapse, and multi-coin crash animation |
| Sound Toggle Button (Header) | Mutes or unmutes all Web Audio clicks, spin whooshes, and coin crash effects |

---

## 🚀 How to Run & Deploy

Because the application is written entirely in native web technologies without dependencies or build steps, it runs instantly in any browser:

### Method 1: Direct File Opening
Double-click `index.html` or drag it into any web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Apple Safari).

### Method 2: Local Development Server
You can serve the directory using Node.js, Python, or PHP:
```bash
# Using Node.js (npx)
npx serve .

# Using Python 3
python -m http.server 8080

# Using PHP
php -S localhost:8080
```
Open `http://localhost:8080` in your web browser.

### Method 3: Web Hosting Deployment
Upload all files (`index.html`, `styles.css`, `script.js`, `plane.md`, `README.md`, and the `currency assents/` folder) to any static hosting provider:
* **GitHub Pages**
* **Vercel / Netlify / Cloudflare Pages**
* **Firebase Hosting / AWS S3**

---

## 📁 Project Directory Structure

```
d:\Antigravity\antigravity projects 2.0\currency calculator website\
│
├── index.html                 # Semantic HTML5 markup & modal templates
├── styles.css                 # CSS variables, 3D coin animations, responsive grid, print styles
├── script.js                  # State store, IST clock, Web Audio synthesizer, calculation engine
├── README.md                  # Comprehensive user & product guide (this document)
├── plane.md                   # Complete architectural engineering plan & iteration history log
│
└── currency assents/          # Transparent PNG assets (RBI notes, coins, logo)
    ├── Indian ₹500 Banknote Cutout.png
    ├── Indian ₹200 Banknote Cutout.png
    ├── Detailed Indian ₹100 Banknote Cutout.png
    ├── Detailed ₹50 Indian Banknote Cutout.png
    ├── Indian ₹20 Banknote Illustration.png
    ├── Photorealistic Indian ₹20 Coin.png
    ├── Indian ₹10 Banknote Illustration.png
    ├── Indian ₹10 Coin Close-Up.png
    ├── Indian ₹5 Coin Close-Up.png
    ├── Embossed Indian ₹2 Coin on Transparency.png
    ├── Intricate Indian One Rupee Banknote Cutout.png
    ├── Indian One Rupee Coin Isolated.png
    ├── Indian 50 Paise Coin Medallion.png
    └── Indian Currency Calculator.png
```

---

## 👨‍💻 Credits & Attribution

* **Creator & Lead Designer:** **Namdev**
* **Engineering & Agentic Development:** **Namdev with Google Antigravity**
* **Core Artificial Intelligence Model:** **Gemini 3.8 Flash**
* **Year of Development:** 2026
* **Status:** Complete, production-grade, and verified.
