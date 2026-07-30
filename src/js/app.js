/**
 * ReviewGlide — Official Google Maps Review Engine
 * Dedicated for Avishkar Photos
 */

import { generateReviewText, rotateVariation, TAG_PRESETS } from './review-generator.js';

document.addEventListener('DOMContentLoaded', () => {
  // Avishkar Photos Profile Data
  const defaultBusiness = {
    id: "avishkar-photos",
    name: "Avishkar Photos",
    category: "Event & Portrait Photography Studio",
    googleRating: 5.0,
    totalReviews: 92,
    link: "https://www.google.com/search?q=Avishkar+Photos#lrd=0x3be7e9cdad5855a1:0x4d14f3a5ec673db9,3,,,,"
  };

  let currentBusiness = defaultBusiness;
  let selectedRating = 5;
  let selectedTagIds = [];

  // DOM Elements
  const bizNameEl = document.getElementById('biz-name');
  const starBtns = document.querySelectorAll('.star');
  const starLbl = document.getElementById('star-lbl');
  const chipsContainer = document.getElementById('chips-container');
  const revTextarea = document.getElementById('rev-text');
  const charCounter = document.getElementById('char-counter');
  const btnReroll = document.getElementById('btn-reroll');
  const postBtn = document.getElementById('post-btn');
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toast-text');
  const genWrap = document.getElementById('gen-wrap');

  // Modal Elements
  const qrModalBackdrop = document.getElementById('qr-modal-backdrop');
  const btnOpenQrStudio = document.getElementById('btn-open-qr-studio');
  const btnCloseQrModal = document.getElementById('btn-close-qr-modal');
  const btnDownloadQr = document.getElementById('btn-download-qr');

  // Fetch Business Data from JSON if available
  fetch('./public/data/businesses.json')
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data) && data.length > 0) {
        currentBusiness = data[0];
        if (bizNameEl) bizNameEl.textContent = currentBusiness.name;
      }
    })
    .catch(() => {
      // Use default fallback
    });

  const RATING_MESSAGES = {
    5: "5 Stars — Thank you! 🎉",
    4: "4 Stars — We are glad you enjoyed it! 👍",
    3: "3 Stars — Thanks for your feedback 😊",
    2: "2 Stars — We will try to do better ⚠️",
    1: "1 Star — We are deeply sorry 😔"
  };

  // Star Rating Interaction
  starBtns.forEach(star => {
    star.addEventListener('click', (e) => {
      const rating = parseInt(star.getAttribute('data-star'));
      setRating(rating);
    });
  });

  function setRating(rating) {
    selectedRating = rating;
    selectedTagIds = []; // reset tags on rating change

    starBtns.forEach(s => {
      const r = parseInt(s.getAttribute('data-star'));
      if (r <= rating) {
        s.classList.add('on');
      } else {
        s.classList.remove('on');
      }

      if (r === rating) {
        s.classList.remove('pop');
        void s.offsetWidth; // trigger reflow
        s.classList.add('pop');
      }
    });

    if (starLbl) starLbl.textContent = RATING_MESSAGES[rating];

    renderChips();
    triggerGenerationAnimation();
  }

  function renderChips() {
    if (!chipsContainer) return;
    const availableTags = TAG_PRESETS[selectedRating] || TAG_PRESETS[5];

    chipsContainer.innerHTML = availableTags.map(tag => `
      <button type="button" class="chip-btn ${selectedTagIds.includes(tag.id) ? 'active' : ''}" data-tag-id="${tag.id}">
        ${tag.label}
      </button>
    `).join('');

    chipsContainer.querySelectorAll('.chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tagId = btn.getAttribute('data-tag-id');
        if (selectedTagIds.includes(tagId)) {
          selectedTagIds = selectedTagIds.filter(id => id !== tagId);
          btn.classList.remove('active');
        } else {
          selectedTagIds.push(tagId);
          btn.classList.add('active');
        }
        updateReviewText();
      });
    });
  }

  function triggerGenerationAnimation() {
    if (genWrap) genWrap.classList.remove('gone');
    setTimeout(() => {
      if (genWrap) genWrap.classList.add('gone');
      updateReviewText();
    }, 400);
  }

  function updateReviewText() {
    if (!revTextarea) return;
    const generated = generateReviewText(selectedRating, selectedTagIds);
    revTextarea.value = generated;
    updateCharCount();
  }

  revTextarea?.addEventListener('input', updateCharCount);

  function updateCharCount() {
    if (charCounter && revTextarea) {
      charCounter.textContent = `${revTextarea.value.length} characters`;
    }
  }

  btnReroll?.addEventListener('click', () => {
    rotateVariation();
    updateReviewText();
  });

  // Copy & Open Google Review Link
  postBtn?.addEventListener('click', () => {
    const textToCopy = revTextarea?.value || '';
    const reviewUrl = currentBusiness.link;

    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        showToast("Copied! Opening Google Reviews…");
        postBtn.classList.add('success');

        setTimeout(() => {
          window.location.href = reviewUrl;
        }, 1200);
      })
      .catch(err => {
        console.error('Clipboard copy failed:', err);
        window.location.href = reviewUrl;
      });
  });

  function showToast(message) {
    if (!toast) return;
    if (toastText) toastText.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // QR Modal Handlers
  btnOpenQrStudio?.addEventListener('click', () => {
    qrModalBackdrop?.classList.add('active');
  });

  btnCloseQrModal?.addEventListener('click', () => {
    qrModalBackdrop?.classList.remove('active');
  });

  qrModalBackdrop?.addEventListener('click', (e) => {
    if (e.target === qrModalBackdrop) {
      qrModalBackdrop.classList.remove('active');
    }
  });

  btnDownloadQr?.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = './public/qr-codes/avishkar-photos-qr.png';
    link.download = 'avishkar-photos-qr.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Initialize
  setRating(5);
});
