(() => {
  'use strict';
  const header = document.querySelector('.site-header');
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-nav');
  const progress = document.querySelector('.reading-progress');
  const topLink = document.querySelector('.back-top');
  const toggleAll = document.querySelector('#expand-all');
  const allDetails = [...document.querySelectorAll('details')];
  let frame = false;
  function updateScroll() {
    header.classList.toggle('scrolled', window.scrollY > 35);
    topLink.classList.toggle('visible', window.scrollY > 600);
    const length = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${length > 0 ? Math.min(1, window.scrollY / length) : 0})`;
    frame = false;
  }
  window.addEventListener('scroll', () => { if (!frame) { requestAnimationFrame(updateScroll); frame = true; } }, { passive: true });
  window.addEventListener('resize', updateScroll);
  updateScroll();
  function closeMenu(returnFocus = false) {
    nav.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', '메뉴 열기');
    if (returnFocus) menu.focus();
  }
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    nav.classList.toggle('is-open', open);
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') closeMenu(true); });
  document.addEventListener('click', e => { if (!header.contains(e.target)) closeMenu(); });
  matchMedia('(min-width: 761px)').addEventListener('change', e => { if(e.matches) closeMenu(); });
  function syncExpand() {
    const expanded = allDetails.every(d => d.open);
    toggleAll.setAttribute('aria-pressed', String(expanded));
    toggleAll.innerHTML = expanded ? '모든 문단 접기 <span>−</span>' : '모든 문단 펼치기 <span>＋</span>';
    updateScroll();
  }
  toggleAll.addEventListener('click', () => {
    const open = !allDetails.every(d => d.open);
    allDetails.forEach(d => { d.open = open; }); syncExpand();
  });
  allDetails.forEach(d => d.addEventListener('toggle', syncExpand));
  let beforePrintState;
  window.addEventListener('beforeprint', () => { beforePrintState = allDetails.map(d => d.open); allDetails.forEach(d => { d.open = true; }); });
  window.addEventListener('afterprint', () => { if(beforePrintState) allDetails.forEach((d,i) => { d.open = beforePrintState[i]; }); beforePrintState = null; });
  document.querySelector('.print-button').addEventListener('click', () => window.print());
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) { nav.querySelectorAll('a').forEach(a => { if(a.hash === '#' + entry.target.id) a.setAttribute('aria-current','location'); else a.removeAttribute('aria-current'); }); } });
  }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
  document.querySelectorAll('.chapter').forEach(s => observer.observe(s));
  // Direct paragraph links also work when their containing section is collapsed.
  function revealHash() {
    const target = document.getElementById(location.hash.slice(1));
    if(!target || !target.id.startsWith('paragraph-')) return;
    let ancestor = target.parentElement;
    while(ancestor) { if(ancestor.tagName === 'DETAILS') ancestor.open = true; ancestor = ancestor.parentElement; }
    requestAnimationFrame(() => target.scrollIntoView());
  }
  window.addEventListener('hashchange', revealHash); revealHash();
})();
