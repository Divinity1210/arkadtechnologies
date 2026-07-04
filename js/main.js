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

  // ===== WAITLIST INTEREST (per-product) =====
  const chip = document.getElementById('interestChip');
  const chipLabel = document.getElementById('interestLabel');
  const chipClear = document.getElementById('interestClear');
  const ctaBanner = document.getElementById('ctaBanner');
  const emailInput = document.getElementById('ctaEmail');
  let productInterest = '';

  function setInterest(product) {
    productInterest = product;
    if (chip && chipLabel) {
      chipLabel.textContent = product;
      chip.hidden = !product;
    }
  }

  document.querySelectorAll('.sol-waitlist').forEach(btn => {
    btn.addEventListener('click', () => {
      setInterest(btn.dataset.product);
      const contact = document.getElementById('contact');
      if (contact) window.scrollTo({ top: contact.offsetTop - nav.offsetHeight - 20, behavior: 'smooth' });
      if (ctaBanner) {
        ctaBanner.classList.remove('banner-pulse');
        void ctaBanner.offsetWidth;
        ctaBanner.classList.add('banner-pulse');
      }
      setTimeout(() => emailInput && emailInput.focus({ preventScroll: true }), 700);
    });
  });

  if (chipClear) chipClear.addEventListener('click', () => setInterest(''));

  // ===== CTA FORM =====
  // Submissions are emailed via FormSubmit.co — the first submission triggers a
  // one-time activation email to the address below.
  const WAITLIST_ENDPOINT = 'https://formsubmit.co/ajax/gramefdigitals@gmail.com';
  const form = document.getElementById('ctaForm');
  if (form) {
    const btn = document.getElementById('ctaSubmit');
    const roleSelect = document.getElementById('ctaRole');
    const msg = document.getElementById('ctaMsg');
    const defaultMsg = msg ? msg.textContent : '';

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const email = emailInput.value.trim();

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        msg.textContent = 'Please enter a valid email address.';
        msg.classList.add('cta-note-error');
        emailInput.focus();
        return;
      }
      if (!roleSelect.value) {
        msg.textContent = 'Please tell us who you are — it helps us send you the right updates.';
        msg.classList.add('cta-note-error');
        roleSelect.focus();
        return;
      }

      const originalText = btn.textContent;
      btn.textContent = 'Submitting…';
      btn.style.opacity = '0.7';
      btn.disabled = true;

      try {
        const res = await fetch(WAITLIST_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            email: email,
            role: roleSelect.value,
            product_interest: productInterest || 'General',
            _subject: 'New Arkad waitlist signup',
            _template: 'table',
            _captcha: 'false'
          })
        });
        if (!res.ok) throw new Error('Submission failed');
        const data = await res.json();
        // FormSubmit returns success:"false" until the form owner clicks the
        // one-time activation link — treat that as a failure so leads aren't lost silently.
        if (String(data.success) !== 'true') throw new Error(data.message || 'Submission rejected');

        btn.textContent = "You're on the list ✓";
        btn.style.background = '#10B981';
        btn.style.opacity = '1';
        msg.textContent = 'Thank you! We’ll be in touch when there’s something worth sharing.';
        msg.classList.remove('cta-note-error');
        emailInput.value = '';
        roleSelect.selectedIndex = 0;
        setInterest('');

        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.disabled = false;
          msg.textContent = defaultMsg;
        }, 5000);
      } catch (error) {
        btn.textContent = originalText;
        btn.disabled = false;
        btn.style.opacity = '1';
        msg.textContent = 'Something went wrong — please try again in a moment.';
        msg.classList.add('cta-note-error');
      }
    });
  }
});
