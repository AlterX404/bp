const buttons = [...document.querySelectorAll('[data-filter]')];
const search = document.querySelector('#search');
const entries = [...document.querySelectorAll('.service')];
let group = 'all';
function filter() {
  const term = search.value.trim().toLowerCase();
  let count = 0;
  for (const entry of entries) {
    entry.hidden = (group !== 'all' && entry.dataset.group !== group) || !entry.dataset.search.includes(term);
    if (!entry.hidden) count++;
  }
  for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.filter === group));
  document.querySelector('#results').textContent = count + (count === 1 ? ' service' : ' services');
  document.querySelector('#empty').hidden = count !== 0;
}
for (const button of buttons) button.addEventListener('click', () => { group = button.dataset.filter; filter(); });
search.addEventListener('input',filter);
document.querySelector('#reset').addEventListener('click',() => {group = 'all'; search.value = ''; filter(); search.focus();});
filter();
