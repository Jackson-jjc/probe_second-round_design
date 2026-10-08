const pages = [...document.querySelectorAll('.page')];
const navLinks = [...document.querySelectorAll('nav a')];
const expandButton = document.getElementById('all');
let expanded = false;
let detailsBeforeExpand = [];
function route() {
  if (location.hash === '#content') return;
  if (expanded) detailsBeforeExpand.forEach(([detail, open]) => { detail.open = open; });
  detailsBeforeExpand = [];
  expanded = false;
  document.body.classList.remove('all-view');
  expandButton.textContent = 'Expand all';
  const requested = location.hash.slice(1) || 'overview';
  const target = document.getElementById(requested);
  const owner = target?.closest('.page');
  const id = owner?.id || 'overview';
  pages.forEach(p => { p.hidden = p.id !== id; });
  navLinks.forEach(a => { if (a.hash === '#' + id) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); });
  if (target && owner && target !== owner) {
    requestAnimationFrame(() => target.scrollIntoView({block: 'start', behavior: 'instant'}));
  } else {
    window.scrollTo({top: 0, behavior: 'instant'});
  }
}
window.addEventListener('hashchange', route);
// Clicking the current hash must also leave the expanded mode.
document.addEventListener('click', event => {
  const a = event.target.closest('a[href^="#"]');
  if (a && a.hash === location.hash && document.getElementById(a.hash.slice(1))?.closest('.page')) route();
});
expandButton.addEventListener('click', () => {
  if (expanded) { route(); return; }
  expanded = true;
  document.body.classList.add('all-view');
  pages.forEach(p => { p.hidden = false; });
  detailsBeforeExpand = [...document.querySelectorAll('details')].map(d => [d, d.open]);
  document.querySelectorAll('details').forEach(d => { d.open = true; });
  expandButton.textContent = 'Return to single page';
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
