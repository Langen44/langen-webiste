// Langen Motorcycles — shared JS
// Scroll reveal
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); obs.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
  document.querySelectorAll('.rev').forEach(el => obs.observe(el));

  // Nav solidify on scroll
  const nav = document.querySelector('nav');
  if(nav) window.addEventListener('scroll', () => {
    nav.style.background = window.scrollY > 80 ? 'rgba(8,8,7,.97)' : 'rgba(8,8,7,.82)';
    }, { passive: true });
