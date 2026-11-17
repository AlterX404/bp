(() => {
  const options = window.BrandPulseSigns;
  const imageCache = new Map();
  const photoKey = 'bpc-demo-sign-photo';

  function loadImage(source) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('This image could not be opened.'));
      image.src = source;
    });
  }

  function loadScene(id) {
    if (!imageCache.has(id)) imageCache.set(id, loadImage(window.BrandPulseScenes[id]));
    return imageCache.get(id);
  }

  function savePhoto(image) {
    try {
      const scale = Math.min(1, 1400 / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext('2d');
      context.fillStyle = '#1b2420';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const bytes = crypto.getRandomValues(new Uint8Array(8));
      const id = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
      sessionStorage.setItem(photoKey, JSON.stringify({id, jpeg:canvas.toDataURL('image/jpeg', 0.82)}));
      return id;
    } catch {
      return 'local';
    }
  }

  function storedPhoto(id) {
    if (!/^[a-f0-9]{16}$/.test(id)) return null;
    try {
      const photo = JSON.parse(sessionStorage.getItem(photoKey));
      return photo?.id === id && photo.jpeg?.startsWith('data:image/jpeg;base64,') ? photo : null;
    } catch {
      return null;
    }
  }

  async function loadPhoto(id) {
    const photo = storedPhoto(id);
    if (!photo) return null;
    try { return await loadImage(photo.jpeg); }
    catch { return null; }
  }

  function removePhoto(id) {
    if (storedPhoto(id)) sessionStorage.removeItem(photoKey);
  }

  function contain(image, width, height) {
    if (!image) return {x:0, y:0, width, height};
    const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
    const w = image.naturalWidth * scale;
    const h = image.naturalHeight * scale;
    return {x:(width - w) / 2, y:(height - h) / 2, width:w, height:h};
  }

  function textMetrics(context, design, maxWidth, height) {
    const font = options.choice(options.fonts, design.font);
    let size = Math.max(12, height * 0.84);
    context.font = font.css.replace('{size}', size);
    const width = context.measureText(design.wording).width;
    size *= Math.min(1, maxWidth / (width || 1));
    context.font = font.css.replace('{size}', size);
    return size;
  }

  function drawSign(context, design, area, scene, isPhoto) {
    if (!design.wording) return;
    const night = design.light === 'night';
    const panel = design.type === 'panel';
    const neon = design.type === 'neon';
    const colour = options.choice(options.colours, design.colour).hex;
    const widthLimit = area.width * (isPhoto ? 0.78 : scene.width / 100);
    const heightLimit = area.height * (isPhoto ? 0.35 : scene.height / 100);
    const ratio = design.width / design.height;
    const boardWidth = Math.min(widthLimit, (0.22 + design.width / 12 * 0.68) * area.width, heightLimit * ratio);
    const boardHeight = boardWidth / ratio;
    const signX = area.x + Math.min(area.width - boardWidth / 2, Math.max(boardWidth / 2, area.width * design.x / 100));
    const signY = area.y + Math.min(area.height - boardHeight / 2, Math.max(boardHeight / 2, area.height * design.y / 100));
    context.save();
    context.textAlign = 'center';
    context.textBaseline = 'alphabetic';
    context.lineJoin = 'round';
    if (panel) {
      context.shadowColor = 'rgba(0,0,0,.55)';
      context.shadowBlur = 14;
      context.shadowOffsetY = 7;
      const gradient = context.createLinearGradient(0, signY - boardHeight / 2, 0, signY + boardHeight / 2);
      gradient.addColorStop(0, design.colour === 'slate' ? '#e0dac9' : '#344442');
      gradient.addColorStop(1, design.colour === 'slate' ? '#bfb9ac' : '#192623');
      context.fillStyle = gradient;
      context.fillRect(signX - boardWidth / 2, signY - boardHeight / 2, boardWidth, boardHeight);
      context.shadowBlur = 0;
      context.shadowOffsetY = 0;
      context.strokeStyle = 'rgba(240,244,228,.25)';
      context.strokeRect(signX - boardWidth / 2 + 1, signY - boardHeight / 2 + 1, boardWidth - 2, boardHeight - 2);
    }

    const size = textMetrics(context, design, boardWidth * (panel ? 0.89 : 1), boardHeight * (panel ? 0.75 : 1));
    const metrics = context.measureText(design.wording);
    const textY = signY + ((metrics.actualBoundingBoxAscent || size * 0.72) - (metrics.actualBoundingBoxDescent || 0)) / 2;

    if (neon) {
      context.strokeStyle = colour;
      context.lineWidth = Math.max(1.7, Math.min(4, size * 0.038));
      context.shadowColor = colour;
      context.shadowBlur = night ? 29 : 12;
      context.strokeText(design.wording, signX, textY);
      context.strokeText(design.wording, signX, textY);
      context.shadowBlur = 0;
      context.globalAlpha = 0.60;
      context.strokeStyle = design.colour === 'slate' ? '#799087' : '#fffbea';
      context.lineWidth *= 0.34;
      context.strokeText(design.wording, signX, textY);
    } else if (panel) {
      context.fillStyle = colour;
      context.fillText(design.wording, signX, textY);
    } else {
      const depth = Math.min(6, Math.max(2, Math.round(size / 13)));
      context.shadowColor = 'rgba(0,0,0,.55)';
      context.shadowBlur = 5;
      context.shadowOffsetY = 3;
      context.fillStyle = '#25312d';
      for (let offset = depth; offset >= 1; offset--) {
        context.fillText(design.wording, signX + offset * 0.58, textY + offset);
      }
      context.shadowColor = colour;
      context.shadowOffsetY = 0;
      context.shadowBlur = night && design.colour !== 'slate' ? 21 : 0;
      context.fillStyle = colour;
      context.fillText(design.wording, signX, textY);
    }
    context.restore();
  }

  function draw(canvas, design, image, isPhoto = false) {
    const context = canvas.getContext('2d');
    const {width, height} = canvas;
    const area = contain(image, width, height);
    context.fillStyle = '#1b2420';
    context.fillRect(0, 0, width, height);
    if (image) context.drawImage(image, area.x, area.y, area.width, area.height);
    if (image && design.light === 'night') {
      context.fillStyle = 'rgba(10,19,37,.56)';
      context.fillRect(area.x, area.y, area.width, area.height);
    }
    drawSign(context, design, area, options.choice(options.scenes, design.scene), isPhoto);
    return area;
  }

  window.BrandPulseRender = Object.freeze({loadImage, loadScene, savePhoto, loadPhoto, removePhoto, draw});
})();

