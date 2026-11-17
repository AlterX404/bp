const byId = id => document.getElementById(id);
const form = byId('brief');
const value = name => form.elements.namedItem(name).value.trim();
const select = form.elements.namedItem('service');
const keys = ['first','second','review','done'];
let review = '';
let leads = [];
try { leads = JSON.parse(sessionStorage.getItem('bpc-demo-leads') || '[]'); } catch {}
if (!Array.isArray(leads)) leads = [];

select.add(new Option('Choose a service', ''));
for (const service of services) select.add(new Option(service.name, service.id));
select.add(new Option('Help me choose', 'unsure'));

function scrollToElement(element) { requestAnimationFrame(() => element.scrollIntoView({block:'start'})); }
function show(state, focus = true) {
  form.hidden = !['first','second'].includes(state);
  document.querySelectorAll('.steps li').forEach((item, index) => {
    if (index === Math.min(keys.indexOf(state), 2)) item.setAttribute('aria-current', 'step');
    else item.removeAttribute('aria-current');
  });
  for (const key of keys) byId(key).hidden = key !== state;
  if (focus) {
    byId(state).querySelector('h3').focus({preventScroll:true});
    scrollToElement(byId('estimate'));
  }
}
function clearError() {
  byId('formError').hidden = true;
  for (const field of form.querySelectorAll('[aria-invalid]')) {
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');
  }
}
function validate(entries) {
  clearError();
  for (const [name, test, message] of entries) {
    if (test) continue;
    const field = form.elements.namedItem(name);
    const error = byId('formError');
    error.textContent = message;
    error.hidden = false;
    field.setAttribute('aria-invalid','true');
    field.setAttribute('aria-describedby','formError');
    field.focus();
    return false;
  }
  return true;
}
function advance() {
  if (!validate([['service',value('service'),'Choose a service or select Help me choose.'],['locality',value('locality'),'Enter the locality or PIN code where the work is needed.']])) return;
  const service = services.find(item => item.id === value('service'));
  for (const label of form.querySelectorAll('[data-sign]')) {
    label.hidden = service?.sign === false;
    label.querySelector('input,select').disabled = label.hidden;
  }
  byId('notesLabel').querySelector('span').textContent = service?.sign === false ? 'Space and branding details' : 'Project details';
  form.elements.notes.placeholder = service?.sign === false ? 'Floor area, surfaces and opening plans' : 'Wording, lighting, placement or access notes';
  show('second');
}
byId('next').addEventListener('click', advance);
form.querySelector('[data-back]').addEventListener('click', () => { clearError(); show('first'); });
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!byId('first').hidden) { advance(); return; }
  if (!validate([
    ['quantity',form.elements.quantity.validity.valid,'Enter a whole number between 1 and 100,000, or leave the field blank.'],
    ['date',form.elements.date.validity.valid,'Enter a valid required date.'],
    ['name',value('name'),'Enter your name.'],
    ['email',value('email') && form.elements.email.validity.valid,'Enter a valid email address, for example buyer@example.com.']
  ])) return;
  const labels = {placement:'Placement',dimensions:'Approx. dimensions',material:'Material or finish',quantity:'Signs or locations',installation:'Installation',date:'Needed by',notes:'Project details',name:'Contact name',email:'Email',business:'Business'};
  const entries = ['Service: ' + select.selectedOptions[0].textContent, 'Project locality: ' + value('locality')];
  for (const [name,label] of Object.entries(labels)) {
    if (!form.elements.namedItem(name).disabled && value(name)) entries.push(label + ': ' + value(name));
  }
  review = 'New estimate enquiry | Brand Pulse Creatives\n\n' + entries.join('\n');
  byId('reviewText').textContent = review;
  show('review');
});
byId('edit').addEventListener('click', () => show('second'));
function renderInbox() {
  const inbox = byId('inbox');
  inbox.replaceChildren();
  if (!leads.length) { inbox.textContent = 'No demo enquiries yet.'; return; }
  const list = document.createElement('ul');
  for (const lead of leads) {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = lead.id + ' · ' + lead.service;
    button.addEventListener('click', () => displayLead(lead, 'Saved demo enquiry.'));
    item.append(button);
    list.append(item);
  }
  inbox.append(list);
}
function displayLead(lead, message) {
  byId('doneTitle').textContent = lead.id;
  byId('doneMessage').textContent = message;
  byId('doneText').textContent = lead.summary;
  show('done');
}
byId('save').addEventListener('click', () => {
  const lead = {id:'Demo ' + new Date().toISOString().slice(11,23) + ' UTC', service:select.selectedOptions[0].textContent, summary:review};
  leads = [lead, ...leads].slice(0,20);
  let message = 'Saved in this browser session. Open the demo lead inbox to see it again. No message was sent.';
  try { sessionStorage.setItem('bpc-demo-leads', JSON.stringify(leads)); }
  catch { message = 'Saved for this open page. Browser storage is unavailable. No message was sent.'; }
  renderInbox();
  displayLead(lead, message);
});
byId('again').addEventListener('click', () => { form.reset(); byId('design-brief-summary').hidden = true; clearError(); show('first'); });
const params = new URLSearchParams(location.search);
const requested = params.get('service');
if (services.some(item => item.id === requested)) select.value = requested;
if (params.get('from') === 'sign' && window.BrandPulseSigns) {
  const signs = window.BrandPulseSigns;
  const design = signs.read(params);
  const type = signs.choice(signs.types, design.type);
  const colour = signs.choice(signs.colours, design.colour);
  const font = signs.choice(signs.fonts, design.font);
  select.value = type.service;
  form.elements.namedItem('dimensions').value = signs.dimensions(design);
  form.elements.namedItem('material').value = type.label;
  form.elements.namedItem('quantity').value = design.quantity;
  if (!params.has('photo')) {
    form.elements.namedItem('placement').value = design.scene === 'reception' ? 'Indoor' : 'Outdoor';
  }
  form.elements.namedItem('notes').value = 'Sign wording: ' + design.wording + '\nLetter colour: ' + colour.label + '\nLettering: ' + font.label;
  const brief = byId('design-brief-summary');
  brief.textContent = 'Design attached: ' + design.wording + ' · ' + type.label + ' · ' + signs.dimensions(design);
  brief.hidden = false;
}
renderInbox();
