/**
 * كنيسة السيدة العذراء مريم بشبين الكوم
 * برمجة وتطوير المبدع: MINA SAMUEL
 * محرك التفاعل والسكيومورفيزم الفاخر (Tactile Skeuomorphic Engine)
 */

(function () {
  'use strict';

  // --- 1. Sound Synthesizer for Physical Skeuomorphic Clicks (Web Audio API) ---
  let audioCtx = null;
  function playTactileClick(type = 'click') {
    try {
      if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          audioCtx = new AudioContext();
        }
      }
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      if (type === 'switch') {
        // Crisp physical rocker toggle sound
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(140, audioCtx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
      } else {
        // Soft button tap
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.03);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.03);
      }
    } catch (e) {
      // Audio autoplay or permission silently handled
    }
  }

  // --- 2. Dark / Light Mode Switcher with Persistence ---
  function initTheme() {
    const savedTheme = localStorage.getItem('mery_church_theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const activeTheme = savedTheme ? savedTheme : (prefersDark ? 'dark' : 'light');

    document.documentElement.setAttribute('data-theme', activeTheme);
    updateSwitchA11y(activeTheme);

    const themeSwitchers = document.querySelectorAll('.theme-switch');
    themeSwitchers.forEach(sw => {
      sw.addEventListener('click', () => {
        playTactileClick('switch');
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('mery_church_theme', next);
        updateSwitchA11y(next);
      });
    });
  }

  function updateSwitchA11y(theme) {
    const themeSwitchers = document.querySelectorAll('.theme-switch');
    themeSwitchers.forEach(sw => {
      sw.setAttribute('aria-label', theme === 'dark' ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي');
      sw.setAttribute('title', theme === 'dark' ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي');
    });
  }

  // --- 3. Lightbox Image Viewer ---
  function initLightbox() {
    let modal = document.querySelector('.lightbox-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'lightbox-modal';
      modal.innerHTML = `
        <div class="lightbox-content">
          <button class="lightbox-close" aria-label="إغلاق">&times;</button>
          <img class="lightbox-img" src="" alt="عرض مكبر">
        </div>
      `;
      document.body.appendChild(modal);

      modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('lightbox-close')) {
          closeLightbox();
        }
      });
    }

    const inspectBtns = document.querySelectorAll('.btn-inspect, .card-img-wrap, .skeuo-canvas-mat');
    inspectBtns.forEach(elem => {
      elem.addEventListener('click', (e) => {
        // Only trigger if not clicking a link or inside a link when wanting page navigation
        if (elem.classList.contains('card-img-wrap')) return; // let cards navigate
        playTactileClick('click');
        const img = elem.closest('.masterpiece-wrapper') ? elem.closest('.masterpiece-wrapper').querySelector('.masterpiece-img') : elem.querySelector('img');
        if (img && modal) {
          const targetSrc = img.src;
          const targetAlt = img.alt || 'لوحة كتابية';
          const lightImg = modal.querySelector('.lightbox-img');
          lightImg.src = targetSrc;
          lightImg.alt = targetAlt;
          modal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
        closeLightbox();
      }
    });

    function closeLightbox() {
      playTactileClick('click');
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // --- 4. Filtering for Homepage Cards ---
  function initGalleryFilters() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    const cards = document.querySelectorAll('.story-card');
    if (!filterTabs.length || !cards.length) return;

    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        playTactileClick('click');
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const category = tab.getAttribute('data-filter');
        let visibleCount = 0;

        cards.forEach(card => {
          const cardCat = card.getAttribute('data-category') || 'all';
          if (category === 'all' || cardCat.includes(category)) {
            card.style.display = 'flex';
            visibleCount++;
          } else {
            card.style.display = 'none';
          }
        });

        const countBadge = document.querySelector('.section-count-badge');
        if (countBadge) {
          countBadge.textContent = `${visibleCount} قصة مختارة`;
        }
      });
    });
  }

  // --- 5. Interactive Sound for Buttons ---
  function initTactileSounds() {
    const buttons = document.querySelectorAll('.nav-btn, .card-action-btn, .nav-direction-btn, .filter-tab, .tv-btn, .pager-btn, .nav-back-btn');
    buttons.forEach(btn => {
      btn.addEventListener('mousedown', () => playTactileClick('click'));
    });
  }

  // --- 6. Keyboard Paging for Story Detail Pages ---
  function initKeyboardPaging() {
    const prevLink = document.querySelector('.nav-prev');
    const nextLink = document.querySelector('.nav-next');

    document.addEventListener('keydown', (e) => {
      // Don't intercept if user is typing or modal is open
      if (document.querySelector('.lightbox-modal.active')) return;
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      if (e.key === 'ArrowRight' && prevLink) {
        // In Arabic RTL, ArrowRight naturally moves to previous
        prevLink.click();
      } else if (e.key === 'ArrowLeft' && nextLink) {
        // ArrowLeft moves to next
        nextLink.click();
      }
    });
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initTheme();
      initLightbox();
      initGalleryFilters();
      initTactileSounds();
      initKeyboardPaging();
    });
  } else {
    initTheme();
    initLightbox();
    initGalleryFilters();
    initTactileSounds();
    initKeyboardPaging();
  }
})();
