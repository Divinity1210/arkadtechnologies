document.addEventListener('DOMContentLoaded', () => {

  // ===== REVEAL SYSTEM =====
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // ===== NAV SCROLL =====
  const nav = document.querySelector('.nav');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('scrolled', window.pageYOffset > 60);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // ===== MOBILE MENU =====
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      navLinks.classList.toggle('active');
      document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // ===== SMOOTH SCROLL =====
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const t = document.querySelector(a.getAttribute('href'));
      if (t) window.scrollTo({ top: t.offsetTop - nav.offsetHeight - 20, behavior: 'smooth' });
    });
  });

  // ===== FAILSAFE VISIBILITY =====
  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
      el.classList.add('visible');
    });
  }, 3000);

  // ===== CTA FORM =====
  const form = document.getElementById('ctaForm');
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = form.querySelector('.btn-primary');
      const inp = form.querySelector('.cta-input');
      const email = inp.value.trim();

      if (email) {
        const originalText = btn.textContent;
        btn.textContent = 'Submitting...';
        btn.style.opacity = '0.7';
        btn.disabled = true;

        try {
          // TODO: Replace with real endpoint
          await new Promise(resolve => setTimeout(resolve, 800));

          btn.textContent = 'Thank you! ✓';
          btn.style.background = '#10B981';
          btn.style.opacity = '1';
          inp.value = '';

          setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.disabled = false;
          }, 3500);
        } catch (error) {
          btn.textContent = 'Error. Try again';
          btn.disabled = false;
          btn.style.opacity = '1';
          setTimeout(() => { btn.textContent = originalText; }, 3000);
        }
      }
    });
  }
});
