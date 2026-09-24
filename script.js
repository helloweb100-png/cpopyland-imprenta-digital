(function () {
  "use strict";

  var root = document.documentElement;
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* =========================================================
     LOADER
     ========================================================= */
  var loader = document.getElementById("loader");
  var loaderFill = document.getElementById("loaderFill");
  var loaderPct = document.getElementById("loaderPct");

  if (loader) {
    var progress = 0;
    var done = false;

    var finishLoad = function () {
      if (done) return;
      done = true;
      if (loaderFill) loaderFill.style.width = "100%";
      if (loaderPct) loaderPct.textContent = "100%";
      loader.classList.add("is-done");
      root.classList.remove("is-loading");
      window.setTimeout(function () {
        loader.classList.add("is-gone");
      }, 950);
    };

    if (prefersReduced) {
      finishLoad();
    } else {
      var tick = function () {
        if (done) return;
        progress += Math.random() * 16 + 8;
        if (progress >= 100) {
          finishLoad();
          return;
        }
        if (loaderFill) loaderFill.style.width = progress + "%";
        if (loaderPct) loaderPct.textContent = Math.floor(progress) + "%";
        window.setTimeout(tick, 130 + Math.random() * 170);
      };

      window.addEventListener("load", function () {
        window.setTimeout(tick, 250);
      });
      window.setTimeout(finishLoad, 6000);
    }
  }

  /* =========================================================
     SCROLL REVEAL (IntersectionObserver)
     ========================================================= */
  var revealTargets = document.querySelectorAll("[data-reveal]");
  if (revealTargets.length) {
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
      );
      revealTargets.forEach(function (el) {
        io.observe(el);
      });
    } else {
      revealTargets.forEach(function (el) {
        el.classList.add("is-visible");
      });
    }
  }

  /* =========================================================
     HEADER: scroll state + progress bar
     ========================================================= */
  var header = document.getElementById("header");
  var headerProgress = document.getElementById("headerProgress");

  if (header) {
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: function (self) {
          header.classList.toggle("is-scrolled", self.scroll() > 40);
          if (headerProgress) {
            headerProgress.style.width = (self.progress * 100).toFixed(2) + "%";
          }
        },
      });
    } else {
      var ticking = false;
      window.addEventListener(
        "scroll",
        function () {
          if (ticking) return;
          ticking = true;
          requestAnimationFrame(function () {
            header.classList.toggle("is-scrolled", window.scrollY > 40);
            ticking = false;
          });
        },
        { passive: true }
      );
    }
  }

  /* =========================================================
     STATEMENT PARALLAX (GSAP ScrollTrigger)
     ========================================================= */
  var statementBg = document.querySelector(".statement__bg");
  if (
    statementBg &&
    window.gsap &&
    window.ScrollTrigger &&
    !prefersReduced &&
    window.innerWidth >= 768
  ) {
    gsap.to(statementBg, {
      yPercent: 14,
      ease: "none",
      scrollTrigger: {
        trigger: statementBg.closest(".statement"),
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  }

  /* =========================================================
     MOBILE NAV
     ========================================================= */
  var navToggle = document.getElementById("navToggle");
  var nav = document.getElementById("nav");

  if (navToggle && nav) {
    var navScrim = document.querySelector(".nav-scrim");
    if (!navScrim) {
      navScrim = document.createElement("button");
      navScrim.type = "button";
      navScrim.className = "nav-scrim";
      navScrim.setAttribute("aria-hidden", "true");
      navScrim.tabIndex = -1;
      document.body.appendChild(navScrim);
    }

    var closeNav = function () {
      document.body.classList.remove("nav-open");
      navToggle.setAttribute("aria-expanded", "false");
    };
    var openNav = function () {
      document.body.classList.add("nav-open");
      navToggle.setAttribute("aria-expanded", "true");
    };

    navToggle.addEventListener("click", function () {
      if (document.body.classList.contains("nav-open")) {
        closeNav();
      } else {
        openNav();
      }
    });
    navScrim.addEventListener("click", closeNav);
    nav.querySelectorAll(".nav__link").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* =========================================================
     WHATSAPP MODAL
     ========================================================= */
  var waModal = document.getElementById("waModal");
  var waFloat = document.getElementById("waFloat");

  if (waModal) {
    var waLastFocused = null;
    var waPanel = waModal.querySelector(".wa-modal__panel");
    var waCloseBtn = waModal.querySelector(".wa-modal__close");

    var openWaModal = function (trigger) {
      waLastFocused = trigger || document.activeElement;
      waModal.setAttribute("aria-hidden", "false");
      document.body.classList.add("wa-modal-open");
      if (waCloseBtn) waCloseBtn.focus();
    };
    var closeWaModal = function () {
      waModal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("wa-modal-open");
      if (waLastFocused && typeof waLastFocused.focus === "function") {
        waLastFocused.focus();
      }
    };

    if (waFloat) {
      waFloat.addEventListener("click", function () {
        openWaModal(waFloat);
      });
    }

    document.querySelectorAll("[data-wa-open]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        openWaModal(el);
      });
    });

    waModal.querySelectorAll("[data-wa-close]").forEach(function (el) {
      el.addEventListener("click", closeWaModal);
    });

    window.addEventListener("keydown", function (e) {
      if (waModal.getAttribute("aria-hidden") !== "false") return;
      if (e.key === "Escape") {
        closeWaModal();
        return;
      }
      if (e.key === "Tab" && waPanel) {
        var focusable = waPanel.querySelectorAll('a[href], button:not([disabled])');
        if (!focusable.length) return;
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  /* =========================================================
     CONTACT FORM -> WHATSAPP
     ========================================================= */
  var quoteForm = document.getElementById("quoteForm");
  if (quoteForm) {
    quoteForm.querySelectorAll("input, select, textarea").forEach(function (field) {
      field.addEventListener("input", function () {
        var wrapper = field.closest(".field");
        if (wrapper && wrapper.classList.contains("is-invalid") && field.checkValidity()) {
          wrapper.classList.remove("is-invalid");
        }
      });
    });

    quoteForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var valid = true;
      var firstInvalid = null;
      quoteForm.querySelectorAll("[required]").forEach(function (field) {
        var wrapper = field.closest(".field");
        var ok = field.checkValidity();
        if (wrapper) wrapper.classList.toggle("is-invalid", !ok);
        if (!ok) {
          valid = false;
          if (!firstInvalid) firstInvalid = field;
        }
      });
      if (!valid) {
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var data = new FormData(quoteForm);
      var name = (data.get("name") || "").toString().trim();
      var phone = (data.get("phone") || "").toString().trim();
      var service = (data.get("service") || "").toString().trim();
      var qty = (data.get("qty") || "").toString().trim();
      var message = (data.get("message") || "").toString().trim();

      var text = "Hola, soy " + name + ". Quiero cotizar: " + service + ".";
      if (qty) text += " Cantidad aproximada: " + qty + ".";
      if (message) text += " Detalles: " + message + ".";
      text += " Mi contacto: " + phone + ".";

      var url = "https://wa.me/5218135732728?text=" + encodeURIComponent(text);
      var win = window.open(url, "_blank");
      if (win) win.opener = null;
    });
  }

  /* =========================================================
     FAQ: un acordeon abierto a la vez
     ========================================================= */
  var faqItems = document.querySelectorAll(".faq__item");
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (item.open) {
        faqItems.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  /* =========================================================
     HERO: red de particulas en canvas
     ========================================================= */
  var canvas = document.getElementById("heroCanvas");
  if (canvas && !prefersReduced) {
    var ctx = canvas.getContext("2d");
    var w, h, dpr, particles;
    var rafId = null;
    var running = false;
    var heroInView = true;

    var resize = function () {
      var parent = canvas.parentElement;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var count = w < 640 ? 24 : w < 1024 ? 40 : 56;
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          r: Math.random() * 1.6 + 0.6,
        });
      }
    };

    var step = function () {
      ctx.clearRect(0, 0, w, h);
      var maxDist = w < 768 ? 110 : 150;

      particles.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      });

      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var a = particles[i];
          var b = particles[j];
          var dx = a.x - b.x;
          var dy = a.y - b.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            ctx.strokeStyle = "rgba(221,31,214," + (1 - dist / maxDist) * 0.35 + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        ctx.fillStyle = "rgba(246,243,251,0.6)";
        ctx.beginPath();
        ctx.arc(particles[i].x, particles[i].y, particles[i].r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (running) rafId = requestAnimationFrame(step);
    };

    var start = function () {
      if (running) return;
      running = true;
      rafId = requestAnimationFrame(step);
    };
    var stop = function () {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
    };

    resize();

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        stop();
      } else if (heroInView) {
        start();
      }
    });

    var heroSection = document.getElementById("inicio");
    if (heroSection && "IntersectionObserver" in window) {
      var heroIo = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            heroInView = entry.isIntersecting;
            if (heroInView && !document.hidden) {
              start();
            } else {
              stop();
            }
          });
        },
        { threshold: 0.05 }
      );
      heroIo.observe(heroSection);
    } else {
      start();
    }
  }

  /* =========================================================
     HERO: parelaje sutil del set flotante segun el cursor
     ========================================================= */
  var heroField = document.querySelector(".hero__field");
  var heroSectionEl = document.querySelector(".hero");
  if (
    heroField &&
    heroSectionEl &&
    !prefersReduced &&
    window.matchMedia("(pointer: fine)").matches
  ) {
    var targetX = 0,
      targetY = 0,
      curX = 0,
      curY = 0,
      tiltTicking = false;

    var applyTilt = function () {
      curX += (targetX - curX) * 0.06;
      curY += (targetY - curY) * 0.06;
      heroField.style.transform = "translate3d(" + curX * -10 + "px," + curY * -10 + "px,0)";
      if (Math.abs(targetX - curX) > 0.001 || Math.abs(targetY - curY) > 0.001) {
        requestAnimationFrame(applyTilt);
      } else {
        tiltTicking = false;
      }
    };

    heroSectionEl.addEventListener("mousemove", function (e) {
      var rect = heroSectionEl.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      if (!tiltTicking) {
        tiltTicking = true;
        requestAnimationFrame(applyTilt);
      }
    });
  }

  /* =========================================================
     FOOTER YEAR
     ========================================================= */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
