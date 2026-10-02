const pages = [...document.querySelectorAll('.page')];
const navLinks = [...document.querySelectorAll('nav a')];
const expandButton = document.getElementById('all');
let expanded = false;
function route() {
  if (location.hash === '#content') return;
  expanded = false;
  document.body.classList.remove('all-view');
  expandButton.textContent = '展开全部';
  const requested = location.hash.slice(1) || 'overview';
  const id = pages.some(p => p.id === requested) ? requested : 'overview';
  pages.forEach(p => { p.hidden = p.id !== id; });
  navLinks.forEach(a => { if (a.hash === '#' + id) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); });
  window.scrollTo({top: 0, behavior: 'instant'});
}
window.addEventListener('hashchange', route);
// Clicking the current hash must also leave the expanded mode.
document.addEventListener('click', event => {
  const a = event.target.closest('a[href^="#"]');
  if (a && pages.some(p => '#'+p.id === a.hash) && a.hash === location.hash) route();
});
expandButton.addEventListener('click', () => {
  if (expanded) { route(); return; }
  expanded = true;
  document.body.classList.add('all-view');
  pages.forEach(p => { p.hidden = false; });
  document.querySelectorAll('details').forEach(d => { d.open = true; });
  expandButton.textContent = '返回单页';
  window.scrollTo({top:0, behavior:'instant'});
});
let printDetails = [];
window.addEventListener('beforeprint', () => {
  printDetails = [...document.querySelectorAll('details')].map(d => [d,d.open]);
  printDetails.forEach(([d]) => { d.open = true; });
});
window.addEventListener('afterprint', () => { printDetails.forEach(([d,open]) => { d.open = open; }); });
document.getElementById('print').addEventListener('click', () => window.print());
document.querySelectorAll('.reference-photo img').forEach(img => {
  const fallback = () => { img.hidden = true; img.nextElementSibling.hidden = false; };
  img.addEventListener('error', fallback);
  if (img.complete && img.naturalWidth === 0) fallback();
});
route();
