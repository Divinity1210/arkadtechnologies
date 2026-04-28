document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  // ===== REVOLUT-STYLE HERO SCALE-DOWN TRANSITION =====
  const heroEl = document.querySelector('.hero');
  const heroWrapper = document.querySelector('.hero-pin-wrapper');

  if (heroEl && heroWrapper) {
    gsap.to(heroEl, {
      scale: 0.92, opacity: 0.6, borderRadius: '32px',
      scrollTrigger: { trigger: heroWrapper, start: 'top top', end: 'bottom top', scrub: 0.8 }
    });
    gsap.to('.hero-content', {
      yPercent: -30, opacity: 0,
      scrollTrigger: { trigger: heroWrapper, start: '20% top', end: '60% top', scrub: 0.6 }
    });
    gsap.to('.hero-bg-img', {
      scale: 1.15,
      scrollTrigger: { trigger: heroWrapper, start: 'top top', end: 'bottom top', scrub: 1.2 }
    });
    gsap.to('.hero-scroll-indicator', {
      opacity: 0,
      scrollTrigger: { trigger: heroWrapper, start: '5% top', end: '15% top', scrub: 0.3 }
    });
  }

  // ===== SINGLE UNIFIED REVEAL SYSTEM =====
  // One observer handles ALL reveal elements — no competing animation systems.
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        entry.target.dataset.revealed = 'true';
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // ===== BENTO + WHY CARD ENTRY (CSS-only, no inline style conflicts) =====
  // Instead of setting inline styles that conflict with hover transforms,
  // add the reveal class so the CSS transition system handles everything cleanly.
  document.querySelectorAll('.bento-card').forEach((card, i) => {
    card.classList.add('reveal');
    card.style.transitionDelay = `${i * 0.1}s`;
    revealObserver.observe(card);
  });

  document.querySelectorAll('.why-card').forEach((card, i) => {
    card.classList.add('reveal');
    card.style.transitionDelay = `${i * 0.08}s`;
    revealObserver.observe(card);
  });

  // ===== SOLUTION CARDS — GSAP staggered reveal =====
  // sol-cards already have .reveal in HTML, so the observer handles opacity.
  // GSAP adds a premium staggered animation for the inner content only —
  // NOT the card itself, avoiding a double-animation conflict.
  gsap.utils.toArray('.sol-card').forEach((card) => {
    const content = card.querySelector('.sol-card-content');
    const visual = card.querySelector('.sol-card-visual');
    const tl = gsap.timeline({
      scrollTrigger: { trigger: card, start: 'top 80%', once: true }
    });
    if (content) tl.from(content, { y: 40, opacity: 0, duration: 0.8, ease: 'power3.out' }, 0);
    if (visual) tl.from(visual, { y: 50, opacity: 0, scale: 0.97, duration: 0.9, ease: 'power3.out' }, 0.12);
  });

  // ===== NAV =====
  const nav = document.querySelector('.nav');
  let lastScrollY = 0;
  let ticking = false;
  window.addEventListener('scroll', () => {
    lastScrollY = window.pageYOffset;
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('scrolled', lastScrollY > 80);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Mobile menu
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

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const t = document.querySelector(a.getAttribute('href'));
      if (t) window.scrollTo({ top: t.offsetTop - nav.offsetHeight - 20, behavior: 'smooth' });
    });
  });

  // ===== HERO ORB PARALLAX =====
  const orbs = document.querySelectorAll('.hero-orb');
  if (heroEl && orbs.length && window.matchMedia('(min-width:1024px)').matches) {
    heroEl.addEventListener('mousemove', e => {
      const rect = heroEl.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      orbs.forEach((orb, i) => {
        gsap.to(orb, { x: x * (i + 1) * 18, y: y * (i + 1) * 18, duration: 1.2, ease: 'power2.out' });
      });
    });
  }

  // ===== CARD TILT EFFECT (Desktop only) =====
  // Only applies 3D tilt — does NOT set translateY to avoid conflicting
  // with the reveal animation's transform.
  if (window.matchMedia('(min-width:768px)').matches) {
    document.querySelectorAll('.why-card, .bento-card').forEach(card => {
      const glow = card.querySelector('.why-card-glow');

      card.addEventListener('mousemove', e => {
        // Don't apply tilt until the card has been revealed
        if (card.dataset.revealed !== 'true') return;

        const r = card.getBoundingClientRect();
        if (glow) {
          glow.style.left = `${e.clientX - r.left - r.width}px`;
          glow.style.top = `${e.clientY - r.top - r.height}px`;
        }
        const cx = (e.clientX - r.left) / r.width - 0.5;
        const cy = (e.clientY - r.top) / r.height - 0.5;
        // Use perspective + rotate only — no translateY here (CSS :hover handles that)
        card.style.transform = `translateY(-6px) perspective(800px) rotateX(${cy * -3}deg) rotateY(${cx * 3}deg)`;
      });

      card.addEventListener('mouseleave', () => {
        // Reset to the revealed resting state, not empty string
        card.style.transform = '';
        if (glow) glow.style.opacity = '0';
      });

      card.addEventListener('mouseenter', () => {
        if (glow) glow.style.opacity = '1';
      });
    });
  }

  // ===== FAILSAFE: Guarantee visibility after 3s =====
  // Only force-reveal elements that haven't been revealed yet
  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
      el.classList.add('visible');
      el.dataset.revealed = 'true';
    });
  }, 3000);

  // ===== FORM =====
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
        btn.style.opacity = '0.8';
        btn.disabled = true;

        try {
          // TODO: To enable real email collection, uncomment this and replace YOUR_FORM_ID
          /*
          await fetch('https://formspree.io/f/YOUR_FORM_ID', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
          */
          
          // Simulate network delay for premium feel during presentations
          await new Promise(resolve => setTimeout(resolve, 800));

          // Success state
          btn.textContent = 'Thank you! ✓';
          btn.style.background = 'linear-gradient(135deg, #10B981, #635BFF)';
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
