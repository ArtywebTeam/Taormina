/**
 * Ristorante Pizzeria Taormina - Main Script
 * Handles Theme, Language, Flip-Book Menu, and Navigation
 */

// --- Safe LocalStorage Helpers ---
function safeGetStorage(key, fallback) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch (e) {
    return fallback;
  }
}

function safeSetStorage(key, val) {
  try {
    localStorage.setItem(key, val);
  } catch (e) {}
}

// --- Global State ---
let currentLang = safeGetStorage("lang", "it");
let currentTheme = safeGetStorage("theme", "light");

// --- 1. Language Management Functions ---
function getTranslationsDict(lang) {
  if (typeof translations !== "undefined" && translations[lang]) {
    return translations[lang];
  }
  if (typeof window !== "undefined" && window.translations && window.translations[lang]) {
    return window.translations[lang];
  }
  if (typeof globalThis !== "undefined" && globalThis.translations && globalThis.translations[lang]) {
    return globalThis.translations[lang];
  }
  return null;
}

function applyLanguage(lang) {
  currentLang = lang;
  safeSetStorage("lang", lang);

  if (typeof document !== "undefined") {
    document.documentElement.lang = lang;
  }

  const dict = getTranslationsDict(lang);
  if (!dict) return;

  // Translate all text elements
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (dict[key] !== undefined) {
      el.textContent = dict[key];
    }
  });

  // Translate placeholders (inputs, search, textareas)
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (dict[key] !== undefined) {
      el.setAttribute("placeholder", dict[key]);
    }
  });

  // Update language toggle button text
  // When lang is "it", button displays "EN" (click to switch to English)
  // When lang is "en", button displays "IT" (click to switch to Italian)
  const langToggleBtns = document.querySelectorAll("#lang-toggle-btn, .lang-toggle-btn");
  langToggleBtns.forEach(btn => {
    btn.textContent = lang === "it" ? "EN" : "IT";
    btn.setAttribute("aria-label", lang === "it" ? "Switch to English" : "Passa all'italiano");
  });
}

function toggleLanguage() {
  const nextLang = currentLang === "it" ? "en" : "it";
  applyLanguage(nextLang);
}

// Attach globally
window.applyLanguage = applyLanguage;
window.toggleLanguage = toggleLanguage;
window.setLanguage = applyLanguage;

// --- 2. Theme Management Functions ---
function applyTheme(theme) {
  currentTheme = theme;
  safeSetStorage("theme", theme);

  if (typeof document !== "undefined") {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  const iconContainers = document.querySelectorAll("#theme-icon-container, .theme-icon-container");
  iconContainers.forEach(container => {
    if (theme === "dark") {
      container.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
        </svg>`;
    } else {
      container.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
        </svg>`;
    }
  });
}

function toggleTheme() {
  const nextTheme = currentTheme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
}

window.applyTheme = applyTheme;
window.toggleTheme = toggleTheme;

// --- 3. Flip-Book Menu Viewer ---
const menuPages = [
  "assets/images/menu/page-1.jpg",
  "assets/images/menu/page-2.jpg",
  "assets/images/menu/page-3.jpg",
  "assets/images/menu/page-4.jpg",
  "assets/images/menu/page-5.jpg",
  "assets/images/menu/page-6.jpg"
];

let currentMenuPage = 0;

function renderMenuPage(pageIndex) {
  const bookPage = document.getElementById("book-page");
  const menuImg = document.getElementById("menu-page-img");
  const menuCounter = document.getElementById("menu-counter");

  // Circular modulo (0 to 5)
  currentMenuPage = ((pageIndex % menuPages.length) + menuPages.length) % menuPages.length;

  if (menuImg) {
    menuImg.src = menuPages[currentMenuPage];
    menuImg.alt = `Menu Taormina, pagina ${currentMenuPage + 1}`;
  }

  if (menuCounter) {
    menuCounter.textContent = `${String(currentMenuPage + 1).padStart(2, "0")} / 06`;
  }

  // Trigger 3D turn animation
  if (bookPage) {
    bookPage.style.animation = "none";
    void bookPage.offsetWidth; // Force reflow
    bookPage.style.animation = "pageTurn 0.55s ease-out";
  }
}

function changeMenuPage(delta) {
  renderMenuPage(currentMenuPage + delta);
}

window.renderMenuPage = renderMenuPage;
window.changeMenuPage = changeMenuPage;

// --- 4. Initialization ---
function initApp() {
  // Apply initial theme
  let prefersDark = false;
  try {
    prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch (e) {}
  applyTheme(safeGetStorage("theme", prefersDark ? "dark" : "light"));

  // Apply initial language
  applyLanguage(safeGetStorage("lang", "it"));

  // Bind Theme Buttons
  document.querySelectorAll("#theme-toggle-btn, .theme-toggle-btn").forEach(btn => {
    btn.onclick = function(e) {
      if (e) e.preventDefault();
      toggleTheme();
    };
  });

  // Bind Language Buttons
  document.querySelectorAll("#lang-toggle-btn, .lang-toggle-btn").forEach(btn => {
    btn.onclick = function(e) {
      if (e) e.preventDefault();
      toggleLanguage();
    };
  });

  // Bind Mobile Menu
  const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  const mobileNav = document.getElementById("mobile-nav");

  if (mobileMenuToggle && mobileNav) {
    mobileMenuToggle.onclick = function(e) {
      if (e) e.preventDefault();
      mobileNav.classList.toggle("open");
      const isOpen = mobileNav.classList.contains("open");
      mobileMenuToggle.innerHTML = isOpen
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>`;
    };

    mobileNav.querySelectorAll("a").forEach(link => {
      link.onclick = function() {
        mobileNav.classList.remove("open");
        mobileMenuToggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>`;
      };
    });
  }

  // Bind Flip-Book Menu Buttons
  const prevBtn = document.getElementById("menu-prev-btn");
  const nextBtn = document.getElementById("menu-next-btn");

  if (prevBtn) {
    prevBtn.onclick = function(e) {
      if (e) e.preventDefault();
      changeMenuPage(-1);
    };
  }

  if (nextBtn) {
    nextBtn.onclick = function(e) {
      if (e) e.preventDefault();
      changeMenuPage(1);
    };
  }

  // Click on book page directly turns page
  const bookPageEl = document.getElementById("book-page");
  if (bookPageEl) {
    bookPageEl.style.cursor = "pointer";
    bookPageEl.onclick = function(e) {
      if (e && e.target && e.target.closest && e.target.closest("button")) return;
      changeMenuPage(1);
    };
  }

  // Touch Swipe on Menu
  const bookContainer = document.querySelector(".book") || bookPageEl;
  if (bookContainer) {
    let startX = 0;
    bookContainer.addEventListener("touchstart", (e) => {
      if (e.touches && e.touches[0]) {
        startX = e.touches[0].clientX;
      }
    }, { passive: true });

    bookContainer.addEventListener("touchend", (e) => {
      if (e.changedTouches && e.changedTouches[0]) {
        const endX = e.changedTouches[0].clientX;
        const diffX = endX - startX;
        if (Math.abs(diffX) > 30) {
          if (diffX > 0) {
            changeMenuPage(-1); // Swipe right -> prev
          } else {
            changeMenuPage(1);  // Swipe left -> next
          }
        }
      }
    }, { passive: true });
  }

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") changeMenuPage(-1);
    if (e.key === "ArrowRight") changeMenuPage(1);
  });
}

// Run immediately or on DOM ready
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }
}
