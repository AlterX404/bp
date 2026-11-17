(() => {
  const options = window.BrandPulseSigns;
  const render = window.BrandPulseRender;
  const get = id => document.getElementById(id);
  const form = get('purchase-form');
  const canvas = get('order-preview');
  const summary = document.querySelector('.order-summary');
  const layout = document.querySelector('.purchase-layout');
  const methods = {upi:'UPI', card:'Card', bank:'Bank transfer'};
  const paymentPanels = [...document.querySelectorAll('[data-method]')];
  const search = new URLSearchParams(location.search);
  const photoId = search.get('photo');
  let design = options.read(search);
  let image;
  if (!design.wording) design.wording = options.defaults.wording;

  for (const {id,label} of options.types) get('purchase-type').add(new Option(label, id));
  get('purchase-type').value = design.type;
  get('order-quantity').value = design.quantity;
  if (photoId) get('order-photo-note').textContent = 'Lettering preview';

  function selection() {
    const type = options.choice(options.types, design.type);
    const colour = options.choice(options.colours, design.colour);
    return {type, colour, dimensions:options.dimensions(design)};
  }

  function update() {
    const data = new FormData(form);
    design = options.normalize({...design, type:data.get('type'), quantity:data.get('quantity')});
    const {type, colour, dimensions} = selection();
    const unit = options.unitPrice(design);
    get('product-wording').textContent = design.wording;
    get('product-spec').textContent = [type.label, dimensions, colour.label].join(' · ');
    const back = options.link('sign-design.html', design, photoId ? {photo:photoId} : {});
    get('edit-design').href = back;
    get('back-design').href = back;
    const quote = options.link('estimate.html', design, {service:type.service, from:'sign', ...(photoId ? {photo:photoId} : {})});
    get('order-quote').href = quote;
    get('confirm-quote').href = quote;
    get('order-unit').textContent = options.money(unit);
    get('order-count').textContent = design.quantity;
    get('order-total').textContent = options.money(unit * design.quantity);
    for (const panel of paymentPanels) panel.hidden = data.get('method') !== panel.dataset.method;
    const sceneLabel = image ? (photoId ? ' on your shop photo' : ' on a sample scene') : '';
    canvas.setAttribute('aria-label', design.wording + ' in ' + type.label + sceneLabel);
    render.draw(canvas, !image ? {...design, x:50, y:50} : design, image, Boolean(photoId));
  }

  if (photoId) {
    render.loadPhoto(photoId).then(photo => {
      if (!photo) return;
      image = photo;
      get('order-photo-note').textContent = 'Your photo · approximate sign scale';
      update();
    });
  } else {
    render.loadScene(design.scene).then(scene => { image = scene; update(); }).catch(() => {
      get('order-photo-note').textContent = 'Lettering preview';
    });
  }
  form.addEventListener('input', update);
  form.addEventListener('submit', event => {
    event.preventDefault();
    update();
    const method = methods[new FormData(form).get('method')];
    if (!method) return;
    const {type, colour, dimensions} = selection();
    const total = options.unitPrice(design) * design.quantity;
    const reference = 'BP-DEMO-' + Date.now().toString(36).slice(-6).toUpperCase();
    const lines = [
      ['Reference', reference], ['Sign', design.wording], ['Style', type.label], ['Dimensions', dimensions],
      ['Colour', colour.label], ['Quantity', String(design.quantity)], ['Payment option', method],
      ['Sample subtotal', options.money(total)], ['Charged', options.money(0)]
    ];
    let saved = true;
    try {
      sessionStorage.setItem('bpc-demo-sign-order', JSON.stringify({reference, method, design, total}));
    } catch { saved = false; }
    get('order-reference').textContent = 'ORDER PREVIEW · ' + reference;
    get('order-confirm-title').textContent = saved ? 'Demo order saved.' : 'Demo order ready.';
    get('order-result').textContent = design.wording + ' · ' + method + ' selected for this demo.';
    const details = get('saved-order-lines');
    details.replaceChildren();
    for (const [label, value] of lines) {
      const row = document.createElement('div');
      const name = document.createElement('dt');
      const entry = document.createElement('dd');
      name.textContent = label;
      entry.textContent = value;
      row.append(name, entry);
      details.append(row);
    }
    form.hidden = true;
    summary.hidden = true;
    layout.dataset.complete = 'true';
    get('order-confirmation').hidden = false;
    get('order-confirm-title').focus();
  });

  get('print-order').addEventListener('click', () => window.print());
  get('retry-order').addEventListener('click', () => {
    get('order-confirmation').hidden = true;
    delete layout.dataset.complete;
    form.hidden = false;
    summary.hidden = false;
    get('design-title').tabIndex = -1;
    get('design-title').focus();
  });
  update();
})();

