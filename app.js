// Progressive enhancement only. The research text and ordinary navigation work without JavaScript.
const quotes = [...document.querySelectorAll('details.quote')];
const quoteToggle = document.getElementById('quote-toggle');
function updateQuoteButton() {
  quoteToggle.textContent = quotes.every(q => q.open) ? 'Close all original passages' : 'Open all original passages';
}
quoteToggle.addEventListener('click', () => {
  const open = !quotes.every(q => q.open);
  quotes.forEach(q => { q.open = open; });
  updateQuoteButton();
});
quotes.forEach(q => q.addEventListener('toggle', updateQuoteButton));
function revealAnchor() {
  if (/^#p0[1-5]$/.test(location.hash)) {
    location.replace('archive/initial-five/index.html' + location.hash);
    return;
  }
  const legacy = {'#collections':'#objects','#references':'#sources','#research':'#overview'};
  if (legacy[location.hash]) { location.replace(legacy[location.hash]); return; }
  let target;
  try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { return; }
  if (!target) return;
  const detail = target.closest('details');
  if (detail) detail.open = true;
  if (detail) requestAnimationFrame(() => target.scrollIntoView({block:'start'}));
}
window.addEventListener('hashchange', revealAnchor);
revealAnchor();
let printState = [];
window.addEventListener('beforeprint', () => {
  printState = [...document.querySelectorAll('details')].map(d => [d,d.open]);
  printState.forEach(([d]) => { d.open = true; });
});
window.addEventListener('afterprint', () => {
  printState.forEach(([d,open]) => { d.open = open; });
  updateQuoteButton();
});
document.getElementById('print').addEventListener('click', () => window.print());
const links = [...document.querySelectorAll('nav a')];
const sections = [...document.querySelectorAll('main>section')];
let scrollFrame = false;
function markSection() {
  const edge = document.querySelector('.site-header').getBoundingClientRect().height + 32;
  const active = sections.filter(s => s.getBoundingClientRect().top <= edge).pop();
  links.forEach(a => {
    if (active && a.hash === '#' + active.id) a.setAttribute('aria-current','location');
    else a.removeAttribute('aria-current');
  });
  scrollFrame = false;
}
window.addEventListener('scroll', () => {
  if (!scrollFrame) { scrollFrame = true; requestAnimationFrame(markSection); }
},{passive:true});
window.addEventListener('resize', markSection);
markSection();
document.querySelectorAll('.venue-photo img').forEach(img => {
  const fallback = () => {
    img.hidden = true;
    if (img.parentElement.querySelector('.image-fallback')) return;
    const note = document.createElement('p');
    note.className = 'image-fallback';
    note.textContent = 'The source image is unavailable. Open the official exhibition record in reference [28] to view it.';
    img.insertAdjacentElement('afterend',note);
  };
  img.addEventListener('error', fallback);
  if (img.complete && img.naturalWidth === 0) fallback();
});
