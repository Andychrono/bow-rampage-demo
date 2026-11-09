/* Mantém o retrato original como fonte e limita a resolução exibida. */
for (const id of ['seller-portrait', 'witch-portrait', 'gardener-portrait']) {
  const portrait = document.getElementById(id);
  const pixels = document.createElement('canvas');
  pixels.className = 'seller-avatar-img npc-pixels';
  pixels.setAttribute('aria-hidden', 'true');
  const context = pixels.getContext('2d');
  if (!context) continue;
  portrait.after(pixels);
  const render = () => {
    if (!portrait.naturalWidth) return;
    pixels.width = Math.min(192, portrait.naturalWidth);
    pixels.height = Math.round(pixels.width * portrait.naturalHeight / portrait.naturalWidth);
    context.imageSmoothingQuality = 'high';
    context.drawImage(portrait, 0, 0, pixels.width, pixels.height);
    pixels.style.filter = getComputedStyle(portrait).filter;
    portrait.classList.add('npc-pixel-source');
  };
  portrait.addEventListener('load', render);
  if (portrait.complete) render();
}
