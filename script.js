/**
 * Indian Currency Calculator — Core JavaScript
 * Features:
 *  - High-res PNG assets integration (single notes, coins, and combined note+coin)
 *  - IST live clock & date (Asia/Kolkata)
 *  - Light, Dark (True Black), and System Theme (IST Day 6am-6pm / Night 6pm-6am)
 *  - 3D Flip Coin startup animation & pop-up icons entrance
 *  - Real-time tallying & Indian Numbering System formatting (Lakhs & Crores)
 *  - Number to Indian Words translator
 *  - Full History manager with LocalStorage persistence & CSV export
 *  - Bank Cash Deposit Challan / Slip generator & Print engine
 *  - Web Audio synthesizer for tactile sound effects
 */

// ==================== CONFIGURATION & CURRENCY DATA ====================
const DENOMINATIONS = [
  {
    id: "500",
    value: 500,
    label: "₹ 500",
    type: "note",
    name: "Five Hundred Rupees",
    noteImg: "currency assents/Indian ₹500 Banknote Cutout.png",
    coinImg: null,
    quickPresets: [1, 5, 10, 20, 50, 100]
  },
  {
    id: "200",
    value: 200,
    label: "₹ 200",
    type: "note",
    name: "Two Hundred Rupees",
    noteImg: "currency assents/Indian ₹200 Banknote Cutout.png",
    coinImg: null,
    quickPresets: [1, 5, 10, 20, 50, 100]
  },
  {
    id: "100",
    value: 100,
    label: "₹ 100",
    type: "note",
    name: "One Hundred Rupees",
    noteImg: "currency assents/Detailed Indian ₹100 Banknote Cutout.png",
    coinImg: null,
    quickPresets: [1, 5, 10, 20, 50, 100]
  },
  {
    id: "50",
    value: 50,
    label: "₹ 50",
    type: "note",
    name: "Fifty Rupees",
    noteImg: "currency assents/Detailed ₹50 Indian Banknote Cutout.png",
    coinImg: null,
    quickPresets: [1, 5, 10, 20, 50]
  },
  {
    id: "20",
    value: 20,
    label: "₹ 20",
    type: "combined",
    name: "Twenty Rupees (Note or Coin)",
    noteImg: "currency assents/Indian ₹20 Banknote Illustration.png",
    coinImg: "currency assents/Photorealistic Indian ₹20 Coin.png",
    quickPresets: [1, 5, 10, 20, 50]
  },
  {
    id: "10",
    value: 10,
    label: "₹ 10",
    type: "combined",
    name: "Ten Rupees (Note or Coin)",
    noteImg: "currency assents/Indian ₹10 Banknote Illustration.png",
    coinImg: "currency assents/Indian ₹10 Coin Close-Up.png",
    quickPresets: [1, 5, 10, 20, 50]
  },
  {
    id: "5",
    value: 5,
    label: "₹ 5",
    type: "coin",
    name: "Five Rupees (Coin)",
    noteImg: null,
    coinImg: "currency assents/Indian ₹5 Coin Close-Up.png",
    quickPresets: [1, 5, 10, 20, 50]
  },
  {
    id: "2",
    value: 2,
    label: "₹ 2",
    type: "coin",
    name: "Two Rupees (Coin)",
    noteImg: null,
    coinImg: "currency assents/Embossed Indian ₹2 Coin on Transparency.png",
    quickPresets: [1, 5, 10, 20, 50]
  },
  {
    id: "1",
    value: 1,
    label: "₹ 1",
    type: "combined",
    name: "One Rupee (Note or Coin)",
    noteImg: "currency assents/Intricate Indian One Rupee Banknote Cutout.png",
    coinImg: "currency assents/Indian One Rupee Coin Isolated.png",
    quickPresets: [1, 5, 10, 20, 50]
  },
  {
    id: "0.5",
    value: 0.50,
    label: "50 Paise",
    type: "coin",
    name: "Fifty Paise (Half Rupee Coin)",
    noteImg: null,
    coinImg: "currency assents/Indian 50 Paise Coin Medallion.png",
    quickPresets: [1, 5, 10, 20]
  }
];

// Helper to URL encode image paths safely
function encodePath(path) {
  if (!path) return "";
  return encodeURI(path);
}

// ==================== STATE MANAGEMENT ====================
const state = {
  quantities: {}, // { '500': 10, '100': 5 }
  activeFilter: 'all', // 'all' | 'notes' | 'coins'
  sortAscending: false, // false: 500 -> 0.5, true: 0.5 -> 500
  themeSetting: 'system', // 'light' | 'dark' | 'system'
  soundEnabled: true,
  history: []
};

// Initialize quantities to 0
DENOMINATIONS.forEach(d => {
  state.quantities[d.id] = 0;
});

// ==================== WEB AUDIO SYNTHESIZER ====================
class SoundManager {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  playCoinSpin() {
    if (!state.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1350, now + 0.6);
      osc.frequency.exponentialRampToValueAtTime(1050, now + 1.55);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.Q.value = 2.0;

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.45);
      gain.gain.linearRampToValueAtTime(0.06, now + 1.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.75);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.75);
    } catch (e) {
      // Audio policy catch
    }
  }

  playCoinCrash() {
    if (!state.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const now = this.ctx.currentTime;
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.45, now);
      masterGain.connect(this.ctx.destination);

      // 1. Strike transient noise burst (physical edge contact click)
      try {
        const noiseLen = Math.floor(this.ctx.sampleRate * 0.035);
        const noiseBuf = this.ctx.createBuffer(1, noiseLen, this.ctx.sampleRate);
        const data = noiseBuf.getChannelData(0);
        for (let i = 0; i < noiseLen; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.006));
        }
        const noiseSource = this.ctx.createBufferSource();
        noiseSource.buffer = noiseBuf;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(5400, now);
        noiseFilter.Q.value = 3.0;

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.4, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(masterGain);

        noiseSource.start(now);
      } catch (err) {
        // Buffer fallback
      }

      // 2. Multi-coin modal frequencies & cascading crash clatters
      // Simulates 2-3 coins colliding together, rebounding, and rattling to a settle
      const coinSets = [
        // Primary simultaneous collision of multiple coins
        { delay: 0.000, gain: 0.40, decay: 0.48, freqs: [2750, 3180, 3950, 4350, 5600, 6800, 8100] },
        // Secondary rebound impact (coins bouncing against each other)
        { delay: 0.042, gain: 0.28, decay: 0.35, freqs: [2920, 3450, 4600, 5950, 7400] },
        // Third clatter contact
        { delay: 0.095, gain: 0.20, decay: 0.24, freqs: [3150, 4200, 5300, 6700] },
        // Fourth settle tap
        { delay: 0.155, gain: 0.13, decay: 0.16, freqs: [3650, 4850, 6200] },
        // Final micro-wobble clink
        { delay: 0.225, gain: 0.08, decay: 0.11, freqs: [3900, 5800, 7200] }
      ];

      coinSets.forEach(hit => {
        const hitTime = now + hit.delay;
        hit.freqs.forEach(freq => {
          const osc = this.ctx.createOscillator();
          const gainNode = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, hitTime);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.985, hitTime + hit.decay);

          const amp = (hit.gain / Math.sqrt(hit.freqs.length)) * (1 - (freq / 12000) * 0.3);
          gainNode.gain.setValueAtTime(amp, hitTime);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, hitTime + hit.decay);

          osc.connect(gainNode);
          gainNode.connect(masterGain);

          osc.start(hitTime);
          osc.stop(hitTime + hit.decay);
        });
      });
    } catch (e) {
      console.warn("Crash audio error:", e);
    }
  }

  // Alias for backward compatibility
  playCoinToss() {
    this.playCoinCrash();
  }

  playClick() {
    if (!state.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {
      // Audio autoplay policy catch
    }
  }

  playSuccess() {
    if (!state.soundEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.08, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.25);
      });
    } catch (e) {}
  }
}

const sounds = new SoundManager();

// ==================== NUMBER & WORDS UTILITIES ====================
// Format to Indian numbering system (e.g. 1,23,456.50)
function formatIndianCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// Convert number to Indian Words (Lakhs, Crores, Rupees, Paise)
function numberToIndianWords(num) {
  if (num === 0 || isNaN(num)) return 'Zero Rupees Only';

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function twoDigits(n) {
    if (n < 20) return ones[n];
    const t = tens[Math.floor(n / 10)];
    const o = ones[n % 10];
    return t + (o ? ' ' + o : '');
  }

  function threeDigits(n) {
    let str = '';
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    if (hundred > 0) {
      str += ones[hundred] + ' Hundred';
      if (rest > 0) str += ' ';
    }
    if (rest > 0) {
      str += twoDigits(rest);
    }
    return str;
  }

  const rounded = Math.round(num * 100) / 100;
  const rupees = Math.floor(rounded);
  const paise = Math.round((rounded - rupees) * 100);

  let parts = [];
  if (rupees > 0) {
    let r = rupees;
    const crore = Math.floor(r / 10000000);
    r %= 10000000;
    const lakh = Math.floor(r / 100000);
    r %= 100000;
    const thousand = Math.floor(r / 1000);
    r %= 1000;
    const hundreds = r;

    if (crore > 0) {
      const croreWords = numberToIndianWords(crore).replace(/ Rupees Only| Only|Rupees/g, '').trim();
      parts.push(croreWords + ' Crore');
    }
    if (lakh > 0) {
      parts.push(twoDigits(lakh) + ' Lakh');
    }
    if (thousand > 0) {
      parts.push(twoDigits(thousand) + ' Thousand');
    }
    if (hundreds > 0) {
      parts.push(threeDigits(hundreds));
    }
  }

  let words = '';
  if (parts.length > 0) {
    words = parts.join(' ') + (rupees === 1 ? ' Rupee' : ' Rupees');
  }

  if (paise > 0) {
    const paiseWords = twoDigits(paise) + ' Paise';
    if (words) {
      words += ' and ' + paiseWords;
    } else {
      words = paiseWords;
    }
  }

  return (words ? words : 'Zero Rupees') + ' Only';
}

// ==================== INDIAN STANDARD TIME (IST) ENGINE ====================
// Indian Standard Time is UTC+05:30 (Asia/Kolkata)
function getISTDate() {
  // Returns current Date object shifted to Asia/Kolkata
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
}

function getISTHour() {
  const istDate = getISTDate();
  return istDate.getHours();
}

function formatISTTimeString(dateObj = new Date()) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  }).format(dateObj);
}

function formatISTDateString(dateObj = new Date()) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(dateObj);
}

// Live IST clock update loop
function updateISTClock() {
  const timeElem = document.getElementById("ist-time-display");
  const dateElem = document.getElementById("ist-date-display");
  const iconElem = document.getElementById("ist-period-icon");
  const now = new Date();

  if (timeElem) timeElem.textContent = formatISTTimeString(now);
  if (dateElem) dateElem.textContent = formatISTDateString(now);

  const istHour = getISTHour();
  const isDay = istHour >= 6 && istHour < 18;

  // Update Sun / Moon icon
  if (iconElem) {
    if (isDay) {
      iconElem.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
        </svg>`;
      iconElem.title = `IST Day Mode (${istHour}:00 - Sunlight)`;
    } else {
      iconElem.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
        </svg>`;
      iconElem.title = `IST Night Mode (${istHour}:00 - Dark)`;
    }
  }

  // If system theme is selected, ensure live synchronization with Day/Night
  if (state.themeSetting === 'system') {
    applyTheme('system', false);
  }
}

// ==================== THEME MANAGEMENT ====================
// Light = Crisp White, Dark = True Black, System = Follows IST Day/Night
function applyTheme(themeChoice, savePref = true) {
  state.themeSetting = themeChoice;
  if (savePref) {
    localStorage.setItem("currency_calc_theme", themeChoice);
  }

  const html = document.documentElement;
  const sysTag = document.getElementById("system-mode-indicator");
  const istHour = getISTHour();
  const isDay = istHour >= 6 && istHour < 18;

  if (themeChoice === 'light') {
    html.setAttribute("data-theme", "light");
  } else if (themeChoice === 'dark') {
    html.setAttribute("data-theme", "dark");
  } else {
    // System Theme: Day = Light (white), Night = Dark (true black)
    const activeTheme = isDay ? 'light' : 'dark';
    html.setAttribute("data-theme", activeTheme);
    if (sysTag) {
      sysTag.textContent = isDay ? "Day ☀️" : "Night 🌙";
    }
  }

  // Update theme button active styles
  document.querySelectorAll(".theme-btn").forEach(btn => {
    const isSelected = btn.dataset.themeChoice === themeChoice;
    btn.classList.toggle("active", isSelected);
    btn.setAttribute("aria-checked", isSelected ? "true" : "false");
  });
}

function initTheme() {
  const saved = localStorage.getItem("currency_calc_theme");
  if (saved && ['light', 'dark', 'system'].includes(saved)) {
    applyTheme(saved, false);
  } else {
    applyTheme('system', false);
  }
}

// ==================== STARTUP COIN FALL, SPIN & COLLAPSE ANIMATION ====================
function initStartupAnimation() {
  const splash = document.getElementById("splash-screen");
  const skipBtn = document.getElementById("skip-splash-btn");
  let hasSkipped = false;

  // Sound sequence: spin flutter while falling & spinning (25% slower), then multi-coin crash at collapse
  const spinTimer = setTimeout(() => {
    sounds.playCoinSpin();
  }, 120);

  const crashTimer = setTimeout(() => {
    sounds.playCoinCrash();
  }, 1850);

  function finishSplash() {
    if (hasSkipped) return;
    hasSkipped = true;
    clearTimeout(spinTimer);
    clearTimeout(crashTimer);

    if (splash) {
      splash.classList.add("fade-out");
      setTimeout(() => {
        splash.style.display = "none";
        document.body.classList.remove("loading-state");
        document.body.classList.add("app-ready");
      }, 550);
    }
  }

  // Auto transition after coin finishes collapse, wobbles, and rests upright displaying the front face (3.7s)
  const autoTimer = setTimeout(finishSplash, 3700);

  // Skip button click
  if (skipBtn) {
    skipBtn.addEventListener("click", () => {
      clearTimeout(autoTimer);
      finishSplash();
    });
  }

  // Allow clicking anywhere on splash to dismiss immediately
  if (splash) {
    splash.addEventListener("click", (e) => {
      if (e.target !== skipBtn) {
        clearTimeout(autoTimer);
        finishSplash();
      }
    });
  }

  // Pressing Escape, Space, or Enter dismisses splash
  window.addEventListener("keydown", function escDismiss(e) {
    if (e.key === "Escape" || e.key === " " || e.key === "Enter") {
      clearTimeout(autoTimer);
      finishSplash();
      window.removeEventListener("keydown", escDismiss);
    }
  });
}

function replayIntroAnimation() {
  const splash = document.getElementById("splash-screen");
  if (!splash) return;

  document.body.classList.add("loading-state");
  document.body.classList.remove("app-ready");
  splash.style.display = "flex";
  splash.classList.remove("fade-out");

  // Re-trigger coin 3D fall, spin, collapse, shadow, ring, and spark animations
  const coin = document.getElementById("splash-coin");
  const shadow = document.getElementById("splash-coin-shadow");
  const ring = document.getElementById("splash-coin-ring");
  const sparks = document.getElementById("splash-coin-sparks");

  [coin, shadow, ring, sparks].forEach(el => {
    if (el) {
      el.style.animation = 'none';
      void el.offsetWidth; // Trigger reflow
      el.style.animation = '';
    }
  });

  // Sound sequence (25% reduced speed)
  setTimeout(() => {
    sounds.playCoinSpin();
  }, 100);

  setTimeout(() => {
    sounds.playCoinCrash();
  }, 1850);

  setTimeout(() => {
    splash.classList.add("fade-out");
    setTimeout(() => {
      splash.style.display = "none";
      document.body.classList.remove("loading-state");
      document.body.classList.add("app-ready");
    }, 550);
  }, 3700);
}

// ==================== DENOMINATION CARDS RENDERER ====================
function renderDenominationCards() {
  const container = document.getElementById("denominations-container");
  if (!container) return;

  container.innerHTML = "";

  // Sort according to state.sortAscending
  const items = [...DENOMINATIONS];
  if (state.sortAscending) {
    items.sort((a, b) => a.value - b.value); // 50p -> 500
  } else {
    items.sort((a, b) => b.value - a.value); // 500 -> 50p
  }

  items.forEach((denom, index) => {
    // Check if matches filter
    const matchesFilter =
      state.activeFilter === 'all' ||
      (state.activeFilter === 'notes' && (denom.type === 'note' || denom.type === 'combined')) ||
      (state.activeFilter === 'coins' && (denom.type === 'coin' || denom.type === 'combined'));

    const card = document.createElement("article");
    card.className = `denom-card pop-item ${!matchesFilter ? 'hidden' : ''}`;
    card.style.setProperty("--delay", index + 2);
    card.id = `card-denom-${denom.id}`;
    card.dataset.denomId = denom.id;

    const currentQty = state.quantities[denom.id] || 0;
    if (currentQty > 0) {
      card.classList.add("has-value");
    }

    // Asset presentation HTML
    let assetHtml = "";
    if (denom.type === 'combined') {
      // Show BOTH Note and Coin side-by-side with zero overlap
      assetHtml = `
        <div class="denom-img-wrapper denom-combined-wrapper" title="Click to view full-size note and coin" data-action="zoom" data-denom="${denom.id}">
          <div class="denom-combined-stage">
            <img src="${encodePath(denom.noteImg)}" alt="${denom.name} Banknote" class="combined-note-img" loading="lazy">
            <img src="${encodePath(denom.coinImg)}" alt="${denom.name} Coin" class="combined-coin-img" loading="lazy">
          </div>
          <span class="zoom-hint-icon">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
        </div>
      `;
    } else if (denom.type === 'note') {
      assetHtml = `
        <div class="denom-img-wrapper" title="Click to view full-size note" data-action="zoom" data-denom="${denom.id}">
          <img src="${encodePath(denom.noteImg)}" alt="${denom.name}" class="denom-img-single-note" loading="lazy">
          <span class="zoom-hint-icon">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
        </div>
      `;
    } else {
      assetHtml = `
        <div class="denom-img-wrapper" title="Click to view full-size coin" data-action="zoom" data-denom="${denom.id}">
          <img src="${encodePath(denom.coinImg)}" alt="${denom.name}" class="denom-img-single-coin" loading="lazy">
          <span class="zoom-hint-icon">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
        </div>
      `;
    }

    // Type badge text
    let typeBadgeText = denom.type === 'combined'
      ? `<span class="denom-type-badge tag-combined">Note or Coin</span>`
      : `<span class="denom-type-badge">${denom.type === 'note' ? 'Note' : 'Coin'}</span>`;

    // Quick multiplier pills
    const quickPillsHtml = denom.quickPresets.map(preset => `
      <button type="button" class="quick-pill" data-action="add-preset" data-denom="${denom.id}" data-amount="${preset}">+${preset}</button>
    `).join("");

    const subtotal = currentQty * denom.value;

    card.innerHTML = `
      <!-- Column 1: Asset Presentation -->
      <div class="denom-asset-col">
        ${assetHtml}
        <div class="denom-info">
          <div class="denom-value-badge">${denom.label}</div>
          ${typeBadgeText}
        </div>
      </div>

      <!-- Column 2: Quantity Controls -->
      <div class="denom-input-col">
        <div class="stepper-row">
          <button type="button" class="stepper-btn" data-action="decrement" data-denom="${denom.id}" aria-label="Decrease quantity">−</button>
          <div class="qty-input-wrapper">
            <input 
              type="number" 
              class="qty-input" 
              id="qty-${denom.id}" 
              data-denom="${denom.id}"
              min="0" 
              step="1"
              value="${currentQty === 0 ? '' : currentQty}" 
              placeholder="0"
              inputmode="numeric"
              aria-label="Quantity of ${denom.label}"
            >
          </div>
          <button type="button" class="stepper-btn" data-action="increment" data-denom="${denom.id}" aria-label="Increase quantity">+</button>
          <button type="button" class="clear-row-btn" data-action="clear-row" data-denom="${denom.id}" title="Reset row to 0" aria-label="Clear row">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="quick-pill-row">
          ${quickPillsHtml}
        </div>
      </div>

      <!-- Column 3: Output Amount -->
      <div class="denom-output-col">
        <span class="row-multiplier-label" id="multiplier-${denom.id}">${denom.label} × ${currentQty}</span>
        <span class="row-subtotal-val" id="subtotal-${denom.id}">₹ ${formatIndianCurrency(subtotal)}</span>
      </div>
    `;

    container.appendChild(card);
  });
}

// ==================== CALCULATION & TOTALS ENGINE ====================
function recalculate() {
  let grandTotal = 0;
  let totalPieces = 0;
  let totalNotes = 0;
  let totalCoins = 0;

  DENOMINATIONS.forEach(denom => {
    const qty = state.quantities[denom.id] || 0;
    const rowSubtotal = qty * denom.value;
    grandTotal += rowSubtotal;
    totalPieces += qty;

    if (denom.type === 'note') {
      totalNotes += qty;
    } else if (denom.type === 'coin') {
      totalCoins += qty;
    } else if (denom.type === 'combined') {
      // In combined, we tally them under total pieces
      totalNotes += qty; // Standard tally representation
    }

    // Update row elements in DOM if present
    const card = document.getElementById(`card-denom-${denom.id}`);
    const input = document.getElementById(`qty-${denom.id}`);
    const multiplierLabel = document.getElementById(`multiplier-${denom.id}`);
    const subtotalLabel = document.getElementById(`subtotal-${denom.id}`);

    if (card) {
      card.classList.toggle("has-value", qty > 0);
    }
    if (input && document.activeElement !== input) {
      input.value = qty === 0 ? '' : qty;
    }
    if (multiplierLabel) {
      multiplierLabel.textContent = `${denom.label} × ${qty}`;
    }
    if (subtotalLabel) {
      subtotalLabel.textContent = `₹ ${formatIndianCurrency(rowSubtotal)}`;
    }
  });

  // Update Hero Stats
  const totalAmountElem = document.getElementById("total-amount-display");
  const totalWordsElem = document.getElementById("total-words-display");
  const totalPiecesElem = document.getElementById("total-pieces-display");
  const totalNotesElem = document.getElementById("total-notes-display");
  const totalCoinsElem = document.getElementById("total-coins-display");

  if (totalAmountElem) totalAmountElem.textContent = formatIndianCurrency(grandTotal);
  if (totalWordsElem) totalWordsElem.textContent = numberToIndianWords(grandTotal);
  if (totalPiecesElem) totalPiecesElem.textContent = totalPieces.toLocaleString('en-IN');
  if (totalNotesElem) totalNotesElem.textContent = totalNotes.toLocaleString('en-IN');
  if (totalCoinsElem) totalCoinsElem.textContent = totalCoins.toLocaleString('en-IN');

  // Update Sticky Bottom Bar
  const stickyAmount = document.getElementById("sticky-amount-display");
  const stickyPieces = document.getElementById("sticky-pieces-display");
  if (stickyAmount) stickyAmount.textContent = `₹ ${formatIndianCurrency(grandTotal)}`;
  if (stickyPieces) stickyPieces.textContent = `(${totalPieces.toLocaleString('en-IN')} pcs)`;
}

// Modify single denomination
function setDenomQuantity(denomId, newQty) {
  const parsed = Math.max(0, parseInt(newQty, 10) || 0);
  state.quantities[denomId] = parsed;
  recalculate();
}

// ==================== EVENT DELEGATION & LISTENERS ====================
function initEventHandlers() {
  // Container listener for denomination controls
  const container = document.getElementById("denominations-container");
  if (container) {
    // Input changes
    container.addEventListener("input", (e) => {
      if (e.target.classList.contains("qty-input")) {
        const denomId = e.target.dataset.denom;
        const val = e.target.value.replace(/[^0-9]/g, '');
        e.target.value = val;
        setDenomQuantity(denomId, val);
      }
    });

    // Clicks on Steppers, Presets, Clear, and Zoom
    container.addEventListener("click", (e) => {
      const target = e.target.closest("button, .denom-img-wrapper");
      if (!target) return;

      const action = target.dataset.action;
      const denomId = target.dataset.denom;

      if (action === 'increment') {
        sounds.playClick();
        const cur = state.quantities[denomId] || 0;
        setDenomQuantity(denomId, cur + 1);
      } else if (action === 'decrement') {
        sounds.playClick();
        const cur = state.quantities[denomId] || 0;
        setDenomQuantity(denomId, Math.max(0, cur - 1));
      } else if (action === 'add-preset') {
        sounds.playClick();
        const cur = state.quantities[denomId] || 0;
        const add = parseInt(target.dataset.amount, 10) || 1;
        setDenomQuantity(denomId, cur + add);
      } else if (action === 'clear-row') {
        sounds.playClick();
        setDenomQuantity(denomId, 0);
      } else if (action === 'zoom') {
        openImageLightbox(denomId);
      }
    });

    // Keyboard support: Enter key moves to next input field
    container.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target.classList.contains("qty-input")) {
        e.preventDefault();
        const inputs = Array.from(container.querySelectorAll(".qty-input:not([disabled])"));
        const currentIndex = inputs.indexOf(e.target);
        if (currentIndex !== -1 && currentIndex < inputs.length - 1) {
          inputs[currentIndex + 1].focus();
          inputs[currentIndex + 1].select();
        }
      }
    });
  }

  // Filter Buttons
  document.querySelectorAll(".filter-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      document.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      state.activeFilter = pill.dataset.filter;
      applyFilterVisibility();
    });
  });

  // Sort Order Toggle (High to Low / Low to High)
  const sortBtn = document.getElementById("sort-toggle-btn");
  const sortLabel = document.getElementById("sort-order-label");
  if (sortBtn) {
    sortBtn.addEventListener("click", () => {
      state.sortAscending = !state.sortAscending;
      if (sortLabel) {
        sortLabel.textContent = state.sortAscending ? "50p → 500" : "500 → 50p";
      }
      renderDenominationCards();
      recalculate();
    });
  }

  // Theme Switcher Buttons
  document.querySelectorAll(".theme-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const choice = btn.dataset.themeChoice;
      applyTheme(choice, true);
    });
  });

  // Sound FX Toggle
  const soundBtn = document.getElementById("sound-toggle-btn");
  const soundOnIcon = document.getElementById("sound-on-icon");
  const soundOffIcon = document.getElementById("sound-off-icon");
  if (soundBtn) {
    soundBtn.addEventListener("click", () => {
      state.soundEnabled = !state.soundEnabled;
      soundOnIcon.classList.toggle("hidden", !state.soundEnabled);
      soundOffIcon.classList.toggle("hidden", state.soundEnabled);
      showToast(state.soundEnabled ? "Audio effects enabled" : "Audio muted", "info");
      if (state.soundEnabled) sounds.playClick();
    });
  }

  // Reset / Clear All
  const clearBtn = document.getElementById("clear-all-btn");
  const stickyResetBtn = document.getElementById("sticky-reset-btn");
  [clearBtn, stickyResetBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener("click", () => {
        resetAllDenominations();
      });
    }
  });

  // Replay intro logo click
  const replayBtn = document.getElementById("replay-intro-btn");
  if (replayBtn) {
    replayBtn.addEventListener("click", replayIntroAnimation);
  }

  // Save Modal Triggers
  const saveBtn = document.getElementById("save-tally-btn");
  const stickySaveBtn = document.getElementById("sticky-save-btn");
  [saveBtn, stickySaveBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener("click", openSaveModal);
    }
  });

  // Copy Breakdown button
  const copyBtn = document.getElementById("copy-summary-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", copyFormattedBreakdown);
  }

  // Print Slip Modal Trigger
  const printSlipBtn = document.getElementById("print-slip-btn");
  if (printSlipBtn) {
    printSlipBtn.addEventListener("click", openChallanModal);
  }

  // History Drawer Triggers
  const openHistoryBtn = document.getElementById("open-history-btn");
  const closeHistoryBtn = document.getElementById("close-history-btn");
  const historyOverlay = document.getElementById("history-drawer-overlay");

  if (openHistoryBtn) openHistoryBtn.addEventListener("click", openHistoryDrawer);
  if (closeHistoryBtn) closeHistoryBtn.addEventListener("click", closeHistoryDrawer);
  if (historyOverlay) {
    historyOverlay.addEventListener("click", (e) => {
      if (e.target === historyOverlay) closeHistoryDrawer();
    });
  }

  // Export History CSV
  const exportHistoryBtn = document.getElementById("export-history-btn");
  if (exportHistoryBtn) {
    exportHistoryBtn.addEventListener("click", exportHistoryCSV);
  }

  // Clear All History
  const clearHistoryBtn = document.getElementById("clear-history-all-btn");
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", clearAllHistory);
  }

  // Modal Closures
  document.getElementById("close-save-modal-btn")?.addEventListener("click", closeSaveModal);
  document.getElementById("cancel-save-btn")?.addEventListener("click", closeSaveModal);
  document.getElementById("save-modal-overlay")?.addEventListener("click", (e) => {
    if (e.target.id === "save-modal-overlay") closeSaveModal();
  });
  document.getElementById("confirm-save-btn")?.addEventListener("click", confirmSaveTally);

  document.getElementById("close-challan-modal-btn")?.addEventListener("click", closeChallanModal);
  document.getElementById("close-challan-btn")?.addEventListener("click", closeChallanModal);
  document.getElementById("print-now-btn")?.addEventListener("click", () => window.print());
  document.getElementById("challan-modal-overlay")?.addEventListener("click", (e) => {
    if (e.target.id === "challan-modal-overlay") closeChallanModal();
  });

  document.getElementById("close-lightbox-btn")?.addEventListener("click", closeImageLightbox);
  document.getElementById("image-modal-overlay")?.addEventListener("click", (e) => {
    if (e.target.id === "image-modal-overlay") closeImageLightbox();
  });
}

function applyFilterVisibility() {
  DENOMINATIONS.forEach(denom => {
    const card = document.getElementById(`card-denom-${denom.id}`);
    if (!card) return;

    const matches =
      state.activeFilter === 'all' ||
      (state.activeFilter === 'notes' && (denom.type === 'note' || denom.type === 'combined')) ||
      (state.activeFilter === 'coins' && (denom.type === 'coin' || denom.type === 'combined'));

    card.classList.toggle("hidden", !matches);
  });
}

function resetAllDenominations() {
  const hasValue = Object.values(state.quantities).some(v => v > 0);
  if (!hasValue) {
    showToast("Calculator is already empty", "info");
    return;
  }

  if (confirm("Reset all denominations to zero?")) {
    DENOMINATIONS.forEach(d => {
      state.quantities[d.id] = 0;
    });
    recalculate();
    sounds.playClick();
    showToast("Calculator reset successfully", "success");
  }
}

// ==================== IMAGE LIGHTBOX MODAL ====================
function openImageLightbox(denomId) {
  const denom = DENOMINATIONS.find(d => d.id === denomId);
  if (!denom) return;

  const overlay = document.getElementById("image-modal-overlay");
  const title = document.getElementById("lightbox-title");
  const badge = document.getElementById("lightbox-badge");
  const body = document.getElementById("lightbox-body");

  if (!overlay || !body) return;

  title.textContent = denom.name;
  badge.textContent = denom.label;

  let contentHtml = "";
  if (denom.type === 'combined') {
    contentHtml = `
      <div class="lightbox-image-grid">
        <div class="lightbox-single-view">
          <img src="${encodePath(denom.noteImg)}" alt="${denom.name} Note" class="lightbox-img-note">
          <span class="lightbox-img-caption">Official Note (${denom.label})</span>
        </div>
        <div class="lightbox-single-view">
          <img src="${encodePath(denom.coinImg)}" alt="${denom.name} Coin" class="lightbox-img-coin">
          <span class="lightbox-img-caption">Official Coin (${denom.label})</span>
        </div>
      </div>
    `;
  } else if (denom.type === 'note') {
    contentHtml = `
      <div class="lightbox-image-grid">
        <div class="lightbox-single-view">
          <img src="${encodePath(denom.noteImg)}" alt="${denom.name}" class="lightbox-img-note">
          <span class="lightbox-img-caption">Official Reserve Bank of India Note</span>
        </div>
      </div>
    `;
  } else {
    contentHtml = `
      <div class="lightbox-image-grid">
        <div class="lightbox-single-view">
          <img src="${encodePath(denom.coinImg)}" alt="${denom.name}" class="lightbox-img-coin">
          <span class="lightbox-img-caption">Official Government of India Coinage</span>
        </div>
      </div>
    `;
  }

  // Educational representation disclaimer notice requested by user
  const noticeHtml = `
    <div class="lightbox-notice-box" role="note">
      <div class="lightbox-notice-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <p class="lightbox-notice-text">
        <strong>Notice:</strong> The visual currency note you see not factual correct this maninly for representation or an basic understanding only.
      </p>
    </div>
  `;

  body.innerHTML = contentHtml + noticeHtml;
  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");
}

function closeImageLightbox() {
  const overlay = document.getElementById("image-modal-overlay");
  if (overlay) {
    overlay.classList.remove("active");
    overlay.setAttribute("aria-hidden", "true");
  }
}

// ==================== COPY SUMMARY / SHARE ====================
function copyFormattedBreakdown() {
  const grandTotal = DENOMINATIONS.reduce((acc, d) => acc + (state.quantities[d.id] || 0) * d.value, 0);
  if (grandTotal === 0) {
    showToast("Please enter quantities before copying", "info");
    return;
  }

  const now = new Date();
  const dateIST = formatISTDateString(now);
  const timeIST = formatISTTimeString(now);

  let text = `🇮🇳 INDIAN CASH TALLY BREAKDOWN\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `Date: ${dateIST}\n`;
  text += `Time: ${timeIST} (IST)\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;

  let totalPieces = 0;
  DENOMINATIONS.forEach(d => {
    const qty = state.quantities[d.id] || 0;
    if (qty > 0) {
      const subtotal = qty * d.value;
      totalPieces += qty;
      text += `${d.label.padEnd(8)} × ${qty.toString().padStart(4)} = ₹ ${formatIndianCurrency(subtotal)}\n`;
    }
  });

  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `TOTAL PIECES : ${totalPieces}\n`;
  text += `GRAND TOTAL  : ₹ ${formatIndianCurrency(grandTotal)}\n`;
  text += `AMOUNT WORDS : ${numberToIndianWords(grandTotal)}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `Generated via Indian Currency Calculator`;

  navigator.clipboard.writeText(text).then(() => {
    sounds.playSuccess();
    showToast("Breakdown copied to clipboard!", "success");
  }).catch(() => {
    showToast("Failed to copy. Please allow clipboard access.", "info");
  });
}

// ==================== BANK CHALLAN / PRINT SLIP ====================
function openChallanModal() {
  const overlay = document.getElementById("challan-modal-overlay");
  const tbody = document.getElementById("slip-table-body");
  const slipDate = document.getElementById("slip-ist-datetime");
  const slipTotalPcs = document.getElementById("slip-total-pcs");
  const slipTotalAmount = document.getElementById("slip-total-amount");
  const slipAmountWords = document.getElementById("slip-amount-words");

  if (!overlay || !tbody) return;

  const now = new Date();
  if (slipDate) {
    slipDate.textContent = `${formatISTDateString(now)} at ${formatISTTimeString(now)} IST`;
  }

  let totalPcs = 0;
  let grandTotal = 0;
  tbody.innerHTML = "";

  DENOMINATIONS.forEach(d => {
    const qty = state.quantities[d.id] || 0;
    const subtotal = qty * d.value;
    totalPcs += qty;
    grandTotal += subtotal;

    // Type display label
    let typeName = d.type === 'combined' ? 'Note or Coin' : (d.type === 'note' ? 'Note' : 'Coin');

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${d.label}</strong></td>
      <td class="text-center">${typeName}</td>
      <td class="text-right" style="font-family: monospace;">${qty}</td>
      <td class="text-right" style="font-family: monospace;">₹ ${formatIndianCurrency(subtotal)}</td>
    `;
    tbody.appendChild(tr);
  });

  if (slipTotalPcs) slipTotalPcs.textContent = totalPcs.toString();
  if (slipTotalAmount) slipTotalAmount.textContent = `₹ ${formatIndianCurrency(grandTotal)}`;
  if (slipAmountWords) slipAmountWords.textContent = numberToIndianWords(grandTotal);

  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");
}

function closeChallanModal() {
  const overlay = document.getElementById("challan-modal-overlay");
  if (overlay) {
    overlay.classList.remove("active");
    overlay.setAttribute("aria-hidden", "true");
  }
}

// ==================== SAVE TALLY & HISTORY MANAGER ====================
function loadHistoryFromStorage() {
  try {
    const data = localStorage.getItem("currency_calc_history");
    state.history = data ? JSON.parse(data) : [];
  } catch (e) {
    state.history = [];
  }
  updateHistoryBadge();
}

function saveHistoryToStorage() {
  try {
    localStorage.setItem("currency_calc_history", JSON.stringify(state.history));
  } catch (e) {
    console.error("Storage error:", e);
  }
  updateHistoryBadge();
}

function updateHistoryBadge() {
  const badge = document.getElementById("history-count-badge");
  const drawerInfo = document.getElementById("drawer-count-info");
  const count = state.history.length;
  if (badge) badge.textContent = count;
  if (drawerInfo) drawerInfo.textContent = `${count} saved ${count === 1 ? 'record' : 'records'}`;
}

function openSaveModal() {
  const grandTotal = DENOMINATIONS.reduce((acc, d) => acc + (state.quantities[d.id] || 0) * d.value, 0);
  if (grandTotal === 0) {
    showToast("Please enter quantities before saving", "info");
    return;
  }

  const overlay = document.getElementById("save-modal-overlay");
  const amtPreview = document.getElementById("modal-amount-preview");
  const wordsPreview = document.getElementById("modal-words-preview");
  const istPreview = document.getElementById("modal-ist-preview");
  const titleInput = document.getElementById("tally-title-input");

  if (amtPreview) amtPreview.textContent = `₹ ${formatIndianCurrency(grandTotal)}`;
  if (wordsPreview) wordsPreview.textContent = numberToIndianWords(grandTotal);

  const now = new Date();
  if (istPreview) {
    istPreview.textContent = `IST: ${formatISTDateString(now)} • ${formatISTTimeString(now)}`;
  }

  if (titleInput) {
    titleInput.value = `Tally #${state.history.length + 1}`;
    setTimeout(() => {
      titleInput.focus();
      titleInput.select();
    }, 100);
  }

  if (overlay) {
    overlay.classList.add("active");
    overlay.setAttribute("aria-hidden", "false");
  }
}

function closeSaveModal() {
  const overlay = document.getElementById("save-modal-overlay");
  if (overlay) {
    overlay.classList.remove("active");
    overlay.setAttribute("aria-hidden", "true");
  }
}

function confirmSaveTally() {
  const titleInput = document.getElementById("tally-title-input");
  const title = (titleInput && titleInput.value.trim()) ? titleInput.value.trim() : `Tally #${state.history.length + 1}`;

  const now = new Date();
  let grandTotal = 0;
  let totalPieces = 0;
  let breakdown = {};

  DENOMINATIONS.forEach(d => {
    const qty = state.quantities[d.id] || 0;
    breakdown[d.id] = qty;
    grandTotal += qty * d.value;
    totalPieces += qty;
  });

  const record = {
    id: "tally_" + Date.now(),
    title: title,
    timestampIST: `${formatISTDateString(now)} • ${formatISTTimeString(now)} IST`,
    isoDate: now.toISOString(),
    totalAmount: grandTotal,
    totalPieces: totalPieces,
    words: numberToIndianWords(grandTotal),
    breakdown: breakdown
  };

  state.history.unshift(record); // Add to beginning
  saveHistoryToStorage();
  closeSaveModal();
  sounds.playSuccess();
  showToast("Cash tally saved to history!", "success");
  renderHistoryList();
}

function openHistoryDrawer() {
  renderHistoryList();
  const overlay = document.getElementById("history-drawer-overlay");
  if (overlay) {
    overlay.classList.add("active");
    overlay.setAttribute("aria-hidden", "false");
  }
}

function closeHistoryDrawer() {
  const overlay = document.getElementById("history-drawer-overlay");
  if (overlay) {
    overlay.classList.remove("active");
    overlay.setAttribute("aria-hidden", "true");
  }
}

function renderHistoryList() {
  const container = document.getElementById("history-list-container");
  if (!container) return;

  if (state.history.length === 0) {
    container.innerHTML = `
      <div class="history-empty-state">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="9"/>
        </svg>
        <p>No saved cash tallies yet.</p>
        <span style="font-size: 11px;">Calculate denominations and click "Save to History" to track past records.</span>
      </div>
    `;
    return;
  }

  container.innerHTML = "";
  state.history.forEach(item => {
    const card = document.createElement("div");
    card.className = "history-item-card";

    // Itemized preview summary of non-zero entries
    const itemsPreview = DENOMINATIONS
      .filter(d => (item.breakdown[d.id] || 0) > 0)
      .map(d => `${d.label}: ${item.breakdown[d.id]}`)
      .join(" • ");

    card.innerHTML = `
      <div class="history-item-top">
        <span class="history-item-title">${item.title}</span>
        <span class="history-item-time">${item.timestampIST}</span>
      </div>
      <div class="history-item-amount-row">
        <span class="history-item-amount">₹ ${formatIndianCurrency(item.totalAmount)}</span>
        <span class="history-item-pieces">${item.totalPieces} pcs</span>
      </div>
      <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 10px; line-height: 1.4;">
        ${itemsPreview || "No denominations entered"}
      </div>
      <div class="history-item-actions">
        <button class="history-action-mini" data-action="restore-history" data-id="${item.id}" title="Load these quantities into calculator">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          <span>Load</span>
        </button>
        <button class="history-action-mini" data-action="copy-history" data-id="${item.id}" title="Copy tally to clipboard">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          <span>Copy</span>
        </button>
        <button class="history-action-mini btn-delete" data-action="delete-history" data-id="${item.id}" title="Delete record">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          <span>Delete</span>
        </button>
      </div>
    `;

    container.appendChild(card);
  });

  // Attach handlers for history actions
  container.querySelectorAll("[data-action]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      const record = state.history.find(h => h.id === id);
      if (!record) return;

      if (action === 'restore-history') {
        DENOMINATIONS.forEach(d => {
          state.quantities[d.id] = record.breakdown[d.id] || 0;
        });
        recalculate();
        closeHistoryDrawer();
        sounds.playSuccess();
        showToast(`Loaded "${record.title}" into calculator`, "success");
      } else if (action === 'copy-history') {
        let text = `🇮🇳 TALLY: ${record.title}\n`;
        text += `Time: ${record.timestampIST}\n`;
        text += `━━━━━━━━━━━━━━━━━━━━━\n`;
        DENOMINATIONS.forEach(d => {
          const qty = record.breakdown[d.id] || 0;
          if (qty > 0) {
            text += `${d.label.padEnd(8)} × ${qty.toString().padStart(4)} = ₹ ${formatIndianCurrency(qty * d.value)}\n`;
          }
        });
        text += `━━━━━━━━━━━━━━━━━━━━━\n`;
        text += `TOTAL: ₹ ${formatIndianCurrency(record.totalAmount)} (${record.totalPieces} pcs)\n`;
        text += `WORDS: ${record.words}\n`;
        navigator.clipboard.writeText(text);
        showToast("Tally copied to clipboard", "success");
      } else if (action === 'delete-history') {
        state.history = state.history.filter(h => h.id !== id);
        saveHistoryToStorage();
        renderHistoryList();
        showToast("Record deleted", "info");
      }
    });
  });
}

function clearAllHistory() {
  if (state.history.length === 0) return;
  if (confirm("Are you sure you want to delete all saved history?")) {
    state.history = [];
    saveHistoryToStorage();
    renderHistoryList();
    showToast("History cleared", "info");
  }
}

function exportHistoryCSV() {
  if (state.history.length === 0) {
    showToast("No history to export", "info");
    return;
  }

  const denomHeaders = DENOMINATIONS.map(d => `"${d.label} (Qty)"`);
  let csv = `"ID","Title","Date Time (IST)","Total Amount (INR)","Total Pieces","Words",${denomHeaders.join(",")}\n`;

  state.history.forEach(item => {
    const denomValues = DENOMINATIONS.map(d => item.breakdown[d.id] || 0);
    const row = [
      `"${item.id}"`,
      `"${item.title.replace(/"/g, '""')}"`,
      `"${item.timestampIST}"`,
      item.totalAmount,
      item.totalPieces,
      `"${item.words.replace(/"/g, '""')}"`,
      ...denomValues
    ];
    csv += row.join(",") + "\n";
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Indian_Currency_Tally_History_${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("CSV file exported successfully", "success");
}

// ==================== TOAST NOTIFICATIONS ====================
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  const iconHtml = type === "success"
    ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`
    : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;

  toast.innerHTML = `${iconHtml}<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    toast.style.transition = "all 0.25s ease";
    setTimeout(() => toast.remove(), 250);
  }, 2800);
}

// ==================== INITIALIZATION ====================
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  renderDenominationCards();
  recalculate();
  initEventHandlers();
  loadHistoryFromStorage();
  initStartupAnimation();

  // Unlock audio on first user gesture (ensures audio context policy compliance)
  const unlockAudio = () => {
    if (sounds) {
      sounds.init();
      if (sounds.ctx && sounds.ctx.state === 'suspended') {
        sounds.ctx.resume();
      }
    }
  };
  window.addEventListener('pointerdown', unlockAudio, { once: true });
  window.addEventListener('keydown', unlockAudio, { once: true });

  // Run IST clock immediately and schedule 1-second interval
  updateISTClock();
  setInterval(updateISTClock, 1000);
});
