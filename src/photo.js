// Уменьшение фото с телефона: длинная сторона не больше 720 px, JPEG качества 0,72 (обычно 40–120 КБ)
export async function shrinkPhoto(file, { max = 720, quality = 0.72 } = {}) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((ok, fail) => { const i = new Image(); i.onload = () => ok(i); i.onerror = fail; i.src = url; });
    const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    let q = quality, out = c.toDataURL('image/jpeg', q);
    while (out.length > 280000 && q > 0.4) { q -= 0.1; out = c.toDataURL('image/jpeg', q); }
    return out;
  } finally { URL.revokeObjectURL(url); }
}
