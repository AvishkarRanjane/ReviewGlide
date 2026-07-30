/**
 * ReviewGlide — Interactive Live QR Code Studio Modal
 * Allows business owners to input details, preview styled QR codes, and download high-res PNGs.
 */

export function initQRStudio() {
  const modalBackdrop = document.getElementById('qr-modal-backdrop');
  const openBtn = document.getElementById('btn-open-qr-studio');
  const closeBtn = document.getElementById('btn-close-qr-modal');
  const bizIdInput = document.getElementById('studio-biz-id');
  const qrImageEl = document.getElementById('studio-qr-image');
  const downloadBtn = document.getElementById('btn-download-qr');

  if (!modalBackdrop || !openBtn) return;

  openBtn.addEventListener('click', () => {
    modalBackdrop.classList.add('active');
    updateQRPreview();
  });

  closeBtn?.addEventListener('click', () => {
    modalBackdrop.classList.remove('active');
  });

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      modalBackdrop.classList.remove('active');
    }
  });

  bizIdInput?.addEventListener('input', () => {
    updateQRPreview();
  });

  function updateQRPreview() {
    const bizId = (bizIdInput?.value || 'sample-business').trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const targetUrl = `${window.location.origin}${window.location.pathname}?id=${bizId}`;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&margin=10&data=${encodeURIComponent(targetUrl)}`;
    
    if (qrImageEl) {
      qrImageEl.src = qrApiUrl;
      qrImageEl.alt = `QR Code for ${bizId}`;
    }

    if (downloadBtn) {
      downloadBtn.onclick = () => {
        const link = document.createElement('a');
        link.href = qrApiUrl;
        link.download = `${bizId}-qr-code.png`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
    }
  }
}
