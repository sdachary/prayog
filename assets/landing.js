/* ============================================================
   Prayog Landing — GSAP Animations & Interactions
   ============================================================ */

(() => {
  'use strict';

  // ============================================================
  // GSAP Registration
  // ============================================================
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  // ============================================================
  // Reduced Motion Check
  // ============================================================
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ============================================================
  // Floating Glass Nav - Hide/Show on Scroll
  // ============================================================
  function initNavGlass() {
    const nav = document.querySelector('.nav-glass');
    if (!nav) return;

    let lastScroll = 0;
    let ticking = false;

    function onScroll() {
      const currentScroll = window.scrollY;

      if (currentScroll > 100) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }

      if (currentScroll > lastScroll && currentScroll > 200) {
        nav.style.transform = 'translateX(-50%) translateY(-120%)';
        nav.style.opacity = '0';
      } else {
        nav.style.transform = 'translateX(-50%) translateY(0)';
        nav.style.opacity = '1';
      }

      lastScroll = currentScroll;
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    }, { passive: true });
  }

  // ============================================================
  // Scroll Reveal (IntersectionObserver)
  // ============================================================
  function initScrollReveal() {
    if (prefersReduced) {
      document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.1
    });

    document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => observer.observe(el));
  }

  // ============================================================
  // Tool Cards Staggered Entrance
  // ============================================================
  function initToolCardsEntrance() {
    if (prefersReduced) return;

    const cards = document.querySelectorAll('.tool-card');
    if (!cards.length) return;

    gsap.fromTo(cards,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.06,
        scrollTrigger: {
          trigger: '.tools-bento',
          start: 'top 80%',
          once: true
        }
      }
    );
  }

  // ============================================================
  // Philosophy Section: Pinned + Scrubbing Text
  // ============================================================
  function initPhilosophyPinned() {
    if (prefersReduced || !window.gsap) return;

    const points = gsap.utils.toArray('.philosophy-point');
    if (!points.length) return;

    // Pin the left column
    ScrollTrigger.create({
      trigger: '.philosophy-grid',
      start: 'top 100px',
      end: 'bottom 100px',
      pin: '.philosophy-pinned',
      pinSpacing: false,
      anticipatePin: 1
    });

    // Animate points on scroll
    points.forEach((point) => {
      gsap.fromTo(point,
        { opacity: 0.3, x: -40 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: point,
            start: 'top 75%',
            end: 'top 30%',
            scrub: 0.5,
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    // Gallery items - scale and fade on scroll
    const galleryItems = gsap.utils.toArray('.gallery-item');
    galleryItems.forEach((item) => {
      gsap.fromTo(item,
        { opacity: 0, scale: 0.9, y: 40 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
            end: 'top 40%',
            scrub: 0.8,
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Parallax on image
      const img = item.querySelector('img');
      if (img) {
        gsap.to(img, {
          yPercent: 15,
          ease: 'none',
          scrollTrigger: {
            trigger: item,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
          }
        });
      }
    });
  }

  // ============================================================
  // Testimonial Carousel
  // ============================================================
  function initTestimonialCarousel() {
    const track = document.querySelector('.testimonial-track');
    const cards = document.querySelectorAll('.testimonial-card');
    const prevBtn = document.querySelector('.testimonial-btn--prev');
    const nextBtn = document.querySelector('.testimonial-btn--next');
    const dotsContainer = document.querySelector('.testimonial-dots');

    if (!track || !cards.length) return;

    const cardWidth = cards[0].offsetWidth + 24; // card + gap
    const visibleCards = Math.floor(track.offsetWidth / cardWidth);
    const totalGroups = Math.ceil(cards.length / 2 / visibleCards); // accounting for duplicates
    let currentIndex = 0;
    let isAnimating = false;

    // Create dots
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      for (let i = 0; i < totalGroups; i++) {
        const dot = document.createElement('button');
        dot.className = 'testimonial-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Testimonial ${i + 1}`);
        dot.addEventListener('click', () => goToGroup(i));
        dotsContainer.appendChild(dot);
      }
    }

    function updateDots() {
      document.querySelectorAll('.testimonial-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
    }

    function goToGroup(index) {
      if (isAnimating) return;
      isAnimating = true;
      currentIndex = Math.max(0, Math.min(index, totalGroups - 1));
      const scrollX = currentIndex * track.offsetWidth;
      track.scrollTo({ left: scrollX, behavior: 'smooth' });
      updateDots();
      setTimeout(() => { isAnimating = false; }, 500);
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => goToGroup(currentIndex - 1));
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => goToGroup(currentIndex + 1));
    }

    // Auto-scroll pause on hover
    let autoScrollTimer;
    function startAutoScroll() {
      autoScrollTimer = setInterval(() => {
        if (!track.matches(':hover')) {
          goToGroup((currentIndex + 1) % totalGroups);
        }
      }, 5000);
    }
    function stopAutoScroll() { clearInterval(autoScrollTimer); }

    track.addEventListener('mouseenter', stopAutoScroll);
    track.addEventListener('mouseleave', startAutoScroll);
    track.addEventListener('focusin', stopAutoScroll);
    track.addEventListener('focusout', startAutoScroll);

    startAutoScroll();

    // Touch/swipe support
    let touchStartX = 0;
    track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        goToGroup(currentIndex + (diff > 0 ? 1 : -1));
      }
    }, { passive: true });
  }

  // ============================================================
  // Infinite Marquee Pause on Hover (CSS handles animation)
  // ============================================================
  function initMarquee() {
    const marquee = document.querySelector('.marquee');
    if (!marquee) return;

    marquee.addEventListener('mouseenter', () => {
      marquee.style.animationPlayState = 'paused';
    });
    marquee.addEventListener('mouseleave', () => {
      marquee.style.animationPlayState = 'running';
    });
  }

  // ============================================================
  // Tool Card Hover Physics (GSAP)
  // ============================================================
  function initToolCardHover() {
    if (prefersReduced || !window.gsap) return;

    document.querySelectorAll('.tool-card').forEach(card => {
      const media = card.querySelector('.tool-card-media img');

      card.addEventListener('mouseenter', () => {
        gsap.to(card, { y: -8, duration: 0.3, ease: 'power2.out' });
        if (media) {
          gsap.to(media, { scale: 1.05, duration: 0.6, ease: 'power2.out' });
        }
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, { y: 0, duration: 0.4, ease: 'power2.out' });
        if (media) {
          gsap.to(media, { scale: 1, duration: 0.8, ease: 'power2.out' });
        }
      });
    });
  }

  // ============================================================
  // Hero Title Scrub Animation
  // ============================================================
  function initHeroScrub() {
    if (prefersReduced || !window.gsap) return;

    const title = document.querySelector('.hero-title');
    if (!title) return;

    // Split text into words for sequential reveal
    const text = title.textContent;
    const words = text.split(' ');
    title.innerHTML = words.map(w => `<span class="word">${w}</span>`).join(' ');

    gsap.fromTo('.hero-title .word',
      { opacity: 0.15, y: 10 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.08,
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1
        }
      }
    );
  }

  // ============================================================
  // CTA Section Entrance
  // ============================================================
  function initCTAEntrance() {
    if (prefersReduced || !window.gsap) return;

    gsap.fromTo('.section-cta .cta-title, .section-cta .cta-lead, .section-cta .cta-actions',
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: '.section-cta',
          start: 'top 80%',
          once: true
        }
      }
    );
  }

  // ============================================================
  // Footer Entrance
  // ============================================================
  function initFooterEntrance() {
    if (prefersReduced || !window.gsap) return;

    gsap.fromTo('.footer-grid > *',
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: {
          trigger: '.site-footer',
          start: 'top 90%',
          once: true
        }
      }
    );
  }

  // ============================================================
  // Smooth Scroll for Anchor Links
  // ============================================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          const navHeight = document.querySelector('.nav-glass')?.offsetHeight || 0;
          const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
          window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        }
      });
    });
  }

  // ============================================================
  // Initialize All
  // ============================================================
  function init() {
    // Immediate (no GSAP needed)
    initNavGlass();
    initScrollReveal();
    initMarquee();
    initSmoothScroll();
    initToolCardHover();

    // Wait for GSAP
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      initToolCardsEntrance();
      initPhilosophyPinned();
      initTestimonialCarousel();
      initHeroScrub();
      initCTAEntrance();
      initFooterEntrance();

      // Refresh ScrollTrigger on load
      window.addEventListener('load', () => {
        ScrollTrigger.refresh();
      });
    } else {
      // Fallback if GSAP fails to load
      document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => el.classList.add('visible'));
    }
  }

  // Run when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();