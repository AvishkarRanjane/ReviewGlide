/**
 * ReviewGlide — Primary Client Application Engine
 * Apple-inspired Glassmorphic UI with Dynamic URL Routing, Smart Tag Builder & Clipboard Redirection
 */

import { generateReviewText, rotateVariation, TAG_PRESETS } from './review-generator.js';
import { initQRStudio } from './qr-studio.js';

document.addEventListener('DOMContentLoaded', () => {
  // State
  let currentBusiness = null;
  let selectedRating = 5;
  let selectedTagIds = [];
  let businessDatabase = [];

  // DOM Elements
  const bizTitleEl = document.getElementById('biz-title');
  const bizCategoryEl = document.getElementById('biz-category');
  const bizAvatarEl = document.getElementById('biz-avatar');
  const bizRatingBadgeEl = document.getElementById('biz-rating-badge');
  
  const starBtns = document.querySelectorAll('.star-btn');
  const ratingLabelEl = document.getElementById('rating-label');
  const tagsContainerEl = document.getElementById('tags-container');
  const reviewTextareaEl = document.getElementById('review-textarea');
  const charCounterEl = document.getElementById('char-counter');
  const btnShuffleEl = document.getElementById('btn-shuffle-review');
  const btnPrimaryActionEl = document.getElementById('btn-primary-action');
  const toastNotificationEl = document.getElementById('toast-notification');
  const toastMsgEl = document.getElementById('toast-msg');
  const themeToggleBtnEl = document.getElementById('theme-toggle-btn');
  const businessGridEl = document.getElementById('business-grid');

  // URL Parsing
  const urlParams = new URLSearchParams(window.location.search);
  const activeBizId = urlParams.get('id')?.trim().toLowerCase() || 'kumar-digital-photo-studio';

  // Ratings Label Map
  const RATING_LABELS = {
    5: "5 Stars — Outstanding Experience! 🎉",
    4: "4 Stars — Great Service! 👍",
    3: "3 Stars — Satisfactory Visit 😊",
    2: "2 Stars — Needs Improvement ⚠️",
    1: "1 Star — Disappointing Visit 😔"
  };

  // Theme Init
  const savedTheme = localStorage.getItem('reviewglide_theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  themeToggleBtnEl?.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('reviewglide_theme', newTheme);
    updateThemeIcon(newTheme);
  });

  function updateThemeIcon(theme) {
    if (!themeToggleBtnEl) return;
    themeToggleBtnEl.innerHTML = theme === 'dark' 
      ? `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`
      : `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>`;
  }

  // Load Business Data
  fetch('./public/data/businesses.json')
    .then(res => {
      if (!res.ok) throw new Error('Data load error');
      return res.json();
    })
    .then(data => {
      businessDatabase = data;
      currentBusiness = data.find(b => b.id.toLowerCase() === activeBizId) || data[0];
      renderBusinessProfile(currentBusiness);
      renderBusinessDirectory(data);
    })
    .catch(err => {
      console.warn('Fallback data initialization:', err);
      currentBusiness = {
        id: 'kumar-digital-photo-studio',
        name: 'Kumar Digital Photo Studio',
        category: 'Photography Studio',
        googleRating: 4.9,
        totalReviews: 148,
        link: 'https://www.google.com/search?q=Kumar+Digital+Photo+Studio'
      };
      renderBusinessProfile(currentBusiness);
    });

  function renderBusinessProfile(biz) {
    if (!biz) return;
    if (bizTitleEl) bizTitleEl.textContent = biz.name;
    if (bizCategoryEl) bizCategoryEl.textContent = biz.category || 'Local Business';
    if (bizAvatarEl) bizAvatarEl.textContent = biz.name.charAt(0).toUpperCase();
    if (bizRatingBadgeEl) {
      bizRatingBadgeEl.innerHTML = `★ ${biz.googleRating || '5.0'} (${biz.totalReviews || '100+'} reviews)`;
    }

    // Set default rating & render
    setRating(5);
  }

  function renderBusinessDirectory(businesses) {
    if (!businessGridEl) return;
    businessGridEl.innerHTML = businesses.map(b => `
      <a href="?id=${encodeURIComponent(b.id)}" class="biz-card-item">
        <div class="biz-item-avatar">${b.name.charAt(0)}</div>
        <div class="biz-item-info">
          <div class="biz-item-name">${b.name}</div>
          <div class="biz-item-cat">${b.category || 'Business Profile'}</div>
        </div>
      </a>
    `).join('');
  }

  // Star Rating Handling
  starBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const rating = parseInt(btn.getAttribute('data-star'));
      setRating(rating);
    });
  });

  function setRating(rating) {
    selectedRating = rating;
    selectedTagIds = []; // reset tags on rating switch

    starBtns.forEach(btn => {
      const r = parseInt(btn.getAttribute('data-star'));
      if (r <= rating) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
      
      if (r === rating) {
        btn.classList.remove('pop-anim');
        void btn.offsetWidth; // trigger reflow for animation
        btn.classList.add('pop-anim');
      }
    });

    if (ratingLabelEl) {
      ratingLabelEl.textContent = RATING_LABELS[rating] || "";
    }

    renderTagPills();
    updateReviewOutput();
  }

  function renderTagPills() {
    if (!tagsContainerEl) return;
    const availableTags = TAG_PRESETS[selectedRating] || [];
    
    tagsContainerEl.innerHTML = availableTags.map(tag => `
      <button type="button" class="tag-pill ${selectedTagIds.includes(tag.id) ? 'selected' : ''}" data-tag-id="${tag.id}">
        ${tag.label}
      </button>
    `).join('');

    tagsContainerEl.querySelectorAll('.tag-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const tagId = pill.getAttribute('data-tag-id');
        if (selectedTagIds.includes(tagId)) {
          selectedTagIds = selectedTagIds.filter(id => id !== tagId);
          pill.classList.remove('selected');
        } else {
          selectedTagIds.push(tagId);
          pill.classList.add('selected');
        }
        updateReviewOutput();
      });
    });
  }

  function updateReviewOutput() {
    if (!reviewTextareaEl) return;
    const generatedText = generateReviewText(selectedRating, selectedTagIds);
    reviewTextareaEl.value = generatedText;
    updateCharCounter();
  }

  reviewTextareaEl?.addEventListener('input', updateCharCounter);

  function updateCharCounter() {
    if (charCounterEl && reviewTextareaEl) {
      charCounterEl.textContent = `${reviewTextareaEl.value.length} characters`;
    }
  }

  btnShuffleEl?.addEventListener('click', () => {
    rotateVariation();
    updateReviewOutput();
  });

  // Action Button (Copy & Open Google Review Link)
  btnPrimaryActionEl?.addEventListener('click', () => {
    const textToCopy = reviewTextareaEl?.value || '';
    const targetLink = currentBusiness?.link || 'https://www.google.com';

    // Copy to clipboard
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        showToast("Review copied! Redirecting to Google Reviews...");
        btnPrimaryActionEl.classList.add('success');
        
        // Immediate or short delayed redirect
        setTimeout(() => {
          window.location.href = targetLink;
        }, 1200);
      })
      .catch(err => {
        console.error('Clipboard copy failed:', err);
        // Fallback redirect directly
        window.location.href = targetLink;
      });
  });

  function showToast(message) {
    if (!toastNotificationEl) return;
    if (toastMsgEl) toastMsgEl.textContent = message;
    toastNotificationEl.classList.add('active');
    setTimeout(() => {
      toastNotificationEl.classList.remove('active');
    }, 3500);
  }

  // Initialize QR Studio Modal
  initQRStudio();
});
