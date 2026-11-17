(() => {
  const options = window.BrandPulseSigns;
  const render = window.BrandPulseRender;
  const get = id => document.getElementById(id);
  const form = get('design-controls');
  const canvas = get('sign-preview');
  const sceneButtons = [...document.querySelectorAll('[data-scene]')];
  const lightInputs = [...document.querySelectorAll('[name="lighting"]')];
  const photoInput = get('shop-photo');
  const quote = get('quote-design');
  const download = get('download-preview');
  const photoButton = sceneButtons.find(button => button.dataset.scene === 'photo');
  const search = new URLSearchParams(location.search);

  let design = options.read(search);
  let sceneId = design.scene;
  let activeImage;
  let localPhoto;
  let photoId = search.get('photo') ?? '';
  let area;
  let sceneRequest = 0;
  let photoRequest = 0;

  for (const {id,label} of options.types) get('sign-type').add(new Option(label, id));
  for (const {id,label} of options.fonts) get('sign-font').add(new Option(label, id));
  for (const colour of options.colours) {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'colour';
    input.value = colour.id;
    const swatch = document.createElement('span');
    swatch.className = 'swatch';
    swatch.style.setProperty('--swatch', colour.hex);
    const name = document.createElement('span');
    name.className = 'visually-hidden';
    name.textContent = colour.label;
    label.append(input, swatch, name);
    get('colour-options').append(label);
  }

  function field(name) {
    return form.elements.namedItem(name);
  }

  function showMessage(message = '') {
    const status = get('preview-message');
    status.hidden = !message;
    status.textContent = message;
  }

  function fillFields() {
    for (const name of ['wording', 'type', 'colour', 'font', 'width', 'height', 'x', 'y']) {
      field(name).value = design[name];
    }
    for (const input of lightInputs) input.checked = input.value === design.light;
  }

  function checkoutExtras() {
    return sceneId === 'photo' ? {photo:photoId} : {};
  }

  function paint() {
    const type = options.choice(options.types, design.type);
    const colour = options.choice(options.colours, design.colour);
    const scene = options.choice(options.scenes, design.scene);
    const sceneName = sceneId === 'photo' ? 'your shop photo' : 'the sample ' + scene.label.toLowerCase();
    area = render.draw(canvas, design, activeImage, sceneId === 'photo');
    const selected = design.wording || 'Blank sign';
    canvas.setAttribute('aria-label', selected + ' in ' + colour.label + ' on ' + sceneName + ', ' + design.light + ' lighting');
    get('scene-caption').textContent = (sceneId === 'photo' ? 'Your photo' : 'Illustrative ' + scene.label.toLowerCase()) + ' · approximate sign scale';
    get('word-count').textContent = Array.from(field('wording').value).length + ' / 36 characters';
    get('type-detail').textContent = type.description;
    get('colour-name').textContent = '· ' + colour.label;
    get('design-price').textContent = options.money(options.unitPrice(design));
    quote.href = options.link('estimate.html', design, {service:type.service, from:'sign', ...checkoutExtras()});
    download.disabled = !activeImage || !design.wording;
  }

  function readFields() {
    design = options.normalize({...design, ...Object.fromEntries(new FormData(form))});
    field('wording').setCustomValidity(design.wording ? '' : 'Enter the wording you want on the sign.');
    paint();
  }

  async function showScene(id, resetPosition) {
    const request = ++sceneRequest;
    const previous = options.choice(options.scenes, design.scene);
    sceneId = id;
    activeImage = null;
    showMessage();
    if (id === 'photo') {
      if (resetPosition) design = {...design, x:50, y:32};
      activeImage = localPhoto;
    } else {
      const scene = options.choice(options.scenes, id);
      const changes = resetPosition ? {x:scene.x, y:scene.y} : {};
      if (resetPosition && design.colour === previous.colour) changes.colour = scene.colour;
      design = {...design, scene:id, ...changes};
    }
    for (const button of sceneButtons) button.setAttribute('aria-pressed', String(button.dataset.scene === id));
    fillFields();
    paint();
    if (id === 'photo') return;
    try {
      const image = await render.loadScene(id);
      if (request !== sceneRequest) return;
      activeImage = image;
      paint();
    } catch {
      if (request === sceneRequest) showMessage('The sample photo could not load. You can still set up your sign or use your own photo.');
    }
  }

  form.addEventListener('input', readFields);
  form.addEventListener('submit', event => {
    event.preventDefault();
    rememberDesign();
    location.href = options.link('purchase.html', design, checkoutExtras());
  });
  quote.addEventListener('click', event => {
    if (!form.reportValidity()) { event.preventDefault(); return; }
    rememberDesign();
  });

  function rememberDesign() {
    try { history.replaceState(null, '', options.link('sign-design.html', design, checkoutExtras())); } catch {}
  }

  for (const button of sceneButtons) {
    button.addEventListener('click', () => {
      if (button.dataset.scene !== sceneId) showScene(button.dataset.scene, true);
    });
  }
  for (const input of lightInputs) {
    input.addEventListener('change', () => {
      if (!input.checked) return;
      design.light = input.value;
      paint();
    });
  }
  photoInput.addEventListener('change', async () => {
    const file = photoInput.files[0];
    if (!file) return;
    const request = ++photoRequest;
    const supported = /^image\/(jpeg|png|webp)$/.test(file.type) || (!file.type && /\.(jpe?g|png|webp)$/i.test(file.name));
    if (!supported || file.size > 12 * 1024 * 1024) {
      showMessage('Choose a JPG, PNG or WebP image under 12 MB.');
      photoInput.value = '';
      return;
    }
    const source = URL.createObjectURL(file);
    try {
      const image = await render.loadImage(source);
      if (request !== photoRequest) return;
      if (image.naturalWidth * image.naturalHeight > 28_000_000) {
        showMessage('This photo is too large to preview comfortably. Try a smaller copy.');
        return;
      }
      localPhoto = image;
      photoId = render.savePhoto(image);
      photoButton.hidden = false;
      await showScene('photo', true);
    } catch {
      if (request === photoRequest) showMessage('This photo could not be loaded. Try opening a different image.');
    } finally {
      URL.revokeObjectURL(source);
      if (request === photoRequest) photoInput.value = '';
    }
  });

  canvas.addEventListener('click', event => {
    if (!activeImage || !area) return;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * canvas.width / rect.width - area.x;
    const y = (event.clientY - rect.top) * canvas.height / rect.height - area.y;
    if (x < 0 || y < 0 || x > area.width || y > area.height) return;
    design = options.normalize({...design, x:100 * x / area.width, y:100 * y / area.height});
    field('x').value = design.x;
    field('y').value = design.y;
    paint();
  });
  get('reset-position').addEventListener('click', () => {
    const scene = options.choice(options.scenes, design.scene);
    field('x').value = sceneId === 'photo' ? 50 : scene.x;
    field('y').value = sceneId === 'photo' ? 32 : scene.y;
    readFields();
  });
  get('reset-design').addEventListener('click', () => {
    photoRequest++;
    localPhoto = null;
    render.removePhoto(photoId);
    photoId = '';
    photoInput.value = '';
    photoButton.hidden = true;
    design = options.normalize();
    field('wording').setCustomValidity('');
    showScene(design.scene, false);
    rememberDesign();
  });
  download.addEventListener('click', () => {
    if (!form.reportValidity()) return;
    const output = document.createElement('canvas');
    output.width = canvas.width;
    output.height = canvas.height;
    const context = output.getContext('2d');
    const caption = 'SIGN CONCEPT  /  BRAND PULSE CREATIVES';
    context.drawImage(canvas, 0, 0);
    context.font = '700 17px Arial, sans-serif';
    context.fillStyle = 'rgba(23,24,20,.88)';
    context.fillRect(18, output.height - 54, context.measureText(caption).width + 24, 36);
    context.fillStyle = '#fffdf6';
    context.fillText(caption, 30, output.height - 31);
    const name = design.wording.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    try {
      output.toBlob(blob => {
        if (!blob) { showMessage('The mockup could not be downloaded. Try another image.'); return; }
        const href = URL.createObjectURL(blob);
        const file = document.createElement('a');
        file.href = href;
        file.download = (name || 'custom-sign') + '-mockup.png';
        document.body.append(file);
        file.click();
        file.remove();
        setTimeout(() => URL.revokeObjectURL(href), 15000);
      }, 'image/png');
    } catch { showMessage('The mockup could not be downloaded in this browser. Try the local preview server.'); }
  });

  showScene(photoId ? 'photo' : sceneId, false);
  readFields();
  if (photoId) {
    const request = sceneRequest;
    render.loadPhoto(photoId).then(image => {
      if (request !== sceneRequest || photoRequest) return;
      if (!image) {
        photoId = '';
        showScene(design.scene, true);
        showMessage('Choose your shop photo again to continue the mockup.');
        return;
      }
      localPhoto = image;
      photoButton.hidden = false;
      showScene('photo', false);
    });
  }
})();

