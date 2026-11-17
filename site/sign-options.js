(() => {
  const types = [
    {id:'channel', label:'3D channel letters', description:'Raised lettering with a lit face.', service:'storefront', base:7400, perFoot:1300},
    {id:'neon', label:'Neon lettering', description:'A continuous glow for a wordmark or short phrase.', service:'neon', base:5200, perFoot:950},
    {id:'panel', label:'Printed sign panel', description:'Lettering mounted on a single rectangular panel.', service:'storefront', base:3400, perFoot:650}
  ];
  const colours = [
    {id:'ivory', label:'Warm white', hex:'#fff3d8'},
    {id:'ice', label:'Cool white', hex:'#d8ebff'},
    {id:'gold', label:'Champagne', hex:'#ffc571'},
    {id:'lime', label:'Lime', hex:'#dbff72'},
    {id:'rose', label:'Rose', hex:'#ff9fcb'},
    {id:'slate', label:'Charcoal', hex:'#263632'}
  ];
  const fonts = [
    {id:'modern', label:'Modern', css:'800 {size}px Arial, sans-serif'},
    {id:'classic', label:'Classic', css:'700 {size}px Georgia, serif'},
    {id:'script', label:'Italic', css:'italic 700 {size}px Georgia, serif'}
  ];
  const scenes = [
    {id:'street', label:'Shopfront', x:50, y:25, width:78, height:22, colour:'ivory'},
    {id:'reception', label:'Reception', x:50, y:38, width:70, height:31, colour:'slate'}
  ];
  const defaults = {
    wording:'MORROW COFFEE', type:'channel', colour:'ivory', font:'modern',
    width:6, height:1.5, quantity:1, scene:'street', light:'day', x:50, y:25
  };
  const currency = new Intl.NumberFormat('en-IN', {style:'currency', currency:'INR', maximumFractionDigits:0});
  const choice = (items, id) => items.find(item => item.id === id);

  function bounded(value, fallback, lower, upper, step = 1) {
    const number = Number(value);
    if (value == null || value === '' || !Number.isFinite(number)) return fallback;
    return Math.min(upper, Math.max(lower, Math.round(number / step) * step));
  }

  function normalize(values = {}) {
    const scene = choice(scenes, values.scene) ?? scenes[0];
    return {
      wording: Array.from(String(values.wording ?? defaults.wording).replace(/[\r\n\t]/g, ' ').trim()).slice(0, 36).join(''),
      type: choice(types, values.type)?.id ?? defaults.type,
      colour: choice(colours, values.colour)?.id ?? scene.colour,
      font: choice(fonts, values.font)?.id ?? defaults.font,
      width: bounded(values.width, defaults.width, 2, 12, 0.5),
      height: bounded(values.height, defaults.height, 0.5, 4, 0.5),
      quantity: bounded(values.quantity, defaults.quantity, 1, 25),
      scene: scene.id,
      light: values.light === 'night' ? 'night' : 'day',
      x: bounded(values.x, scene.x, 5, 95),
      y: bounded(values.y, scene.y, 5, 95)
    };
  }

  function read(search) {
    const values = {};
    const params = new URLSearchParams(search);
    for (const key of Object.keys(defaults)) {
      if (params.has(key)) values[key] = params.get(key);
    }
    return normalize(values);
  }

  function link(page, values, extra = {}) {
    const params = new URLSearchParams({...normalize(values), ...extra});
    return page + '?' + params.toString();
  }

  function unitPrice(design) {
    const type = choice(types, design.type);
    const additionalWidth = Math.max(0, design.width - 4) * type.perFoot;
    const additionalHeight = Math.max(0, design.height - 1) * type.perFoot * 0.6;
    return Math.round((type.base + additionalWidth + additionalHeight) / 100) * 100;
  }

  window.BrandPulseSigns = Object.freeze({
    types, colours, fonts, scenes, defaults, choice, normalize, read, link, unitPrice,
    money: amount => currency.format(amount),
    dimensions: design => design.width + ' × ' + design.height + ' ft'
  });
})();

