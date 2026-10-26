/* =====================================================
   SMK BINA KARYA NUSANTARA — script.js
   Vanilla JS, no frameworks.
   Phase 1: Mobile navbar toggle
   Phase 2: Counter animation
   Phase 3: Form submit + modal redirect
   ===================================================== */

(function () {
  "use strict";

  /**
   * Utility: Query selector shorthand
   */
  var qs = function (selector, context) {
    return (context || document).querySelector(selector);
  };

  var qsAll = function (selector, context) {
    return Array.prototype.slice.call((context || document).querySelectorAll(selector));
  };

  /**
   * 1. MOBILE NAVBAR TOGGLE
   */
  function initNavbarToggle() {
    var toggle = qs("#navbarToggle");
    var menu = qs("#navbar-menu");
    var navLinks = qsAll(".navbar__menu .nav-link");

    if (!toggle || !menu) return;

    function closeMenu() {
      menu.classList.remove("active");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }

    function openMenu() {
      menu.classList.add("active");
      toggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    }

    // Toggle button click
    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      if (expanded) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close menu when clicking a nav link
    navLinks.forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    // Close menu on Escape key
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("active")) {
        closeMenu();
        toggle.focus();
      }
    });

    // Close menu when clicking outside (on mobile)
    document.addEventListener("click", function (e) {
      if (
        menu.classList.contains("active") &&
        !menu.contains(e.target) &&
        !toggle.contains(e.target)
      ) {
        closeMenu();
      }
    });

    // Handle resize: close menu if window becomes desktop size
    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (window.innerWidth > 992 && menu.classList.contains("active")) {
          closeMenu();
        }
      }, 100);
    });
  }

  /**
   * 2. COUNTER ANIMATION (IntersectionObserver)
   */
  function initCounterAnimation() {
    var counters = qsAll(".stat-card__num[data-target]");
    if (!counters.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        var el = entry.target;
        var target = parseInt(el.getAttribute("data-target"), 10);
        if (isNaN(target) || el.dataset.animated === "true") return;

        el.dataset.animated = "true";

        var duration = 2000; // 2 seconds
        var startTime = null;
        var startValue = 0;

        function easeOutCubic(t) {
          return 1 - Math.pow(1 - t, 3);
        }

        function animate(timestamp) {
          if (!startTime) startTime = timestamp;
          var progress = Math.min((timestamp - startTime) / duration, 1);
          var eased = easeOutCubic(progress);
          var current = Math.floor(startValue + (target - startValue) * eased);
          el.textContent = current.toLocaleString();

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            el.textContent = target.toLocaleString();
          }
        }

        requestAnimationFrame(animate);
        observer.unobserve(el);
      });
    }, {
      threshold: 0.3,
      rootMargin: "0px 0px -50px 0px"
    });

counters.forEach(function (counter) {
      observer.observe(counter);
    });
  }

  /**
   * 3. NAVBAR ACTIVE LINK ON SCROLL (IntersectionObserver)
   */
  function initNavActiveScroll() {
    var navLinks = qsAll(".nav-link[data-nav]");
    if (!navLinks.length) return;

    var sections = [];
    navLinks.forEach(function (link) {
      var id = link.getAttribute("data-nav");
      var section = document.getElementById(id);
      if (section) {
        sections.push({ link: link, section: section });
      }
    });
    if (!sections.length) return;

    // 1. Click event: immediate active state
    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.forEach(function (l) { l.classList.remove("active"); });
        this.classList.add("active");
      });
    });

    // 2. Scroll detection via IntersectionObserver
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        var target = entry.target;
        var activeLink = null;

        for (var i = 0; i < sections.length; i++) {
          if (sections[i].section === target) {
            activeLink = sections[i].link;
            break;
          }
        }

        if (!activeLink) return;

        navLinks.forEach(function (link) {
          link.classList.remove("active");
        });

        activeLink.classList.add("active");
      });
    }, {
      threshold: 0.4,
      rootMargin: "-80px 0px -60% 0px"
    });

    sections.forEach(function (item) {
      observer.observe(item.section);
    });
  }

  /**
   * 4. COUNTER ANIMATION (IntersectionObserver)
   */
  function initFormSubmit() {
    var form = qs("#registrationForm");
    var overlay = qs("#modalOverlay");
    var redirectBtn = qs("#redirectBtn");
    var countdownEl = qs("#countdownNumber");
    var summaryNama = qs("#summaryNama");
    var summaryJurusan = qs("#summaryJurusan");
    var summaryNoHp = qs("#summaryNoHp");

    if (!form || !overlay) return;

    var countdownTimer = null;
    var countdownSeconds = 3;

    function showModal(data) {
      // Populate summary
      if (summaryNama) summaryNama.textContent = data.nama || "-";
      if (summaryJurusan) summaryJurusan.textContent = data.jurusan || "-";
      if (summaryNoHp) summaryNoHp.textContent = data.noHp || "-";

      // Reset countdown
      countdownSeconds = 3;
      if (countdownEl) countdownEl.textContent = countdownSeconds;

      // Show modal
      overlay.hidden = false;
      document.body.style.overflow = "hidden";

      // Force reflow for transition
      overlay.offsetHeight;

      // Start countdown
      startCountdown();
    }

    function hideModal() {
      if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
      }
      overlay.hidden = true;
      document.body.style.overflow = "";
      form.reset();
    }

    function startCountdown() {
      if (countdownTimer) clearInterval(countdownTimer);
      
      countdownTimer = setInterval(function () {
        countdownSeconds--;
        if (countdownEl) countdownEl.textContent = countdownSeconds;
        
        if (countdownSeconds <= 0) {
          clearInterval(countdownTimer);
          redirectToHome();
        }
      }, 1000);
    }

    function redirectToHome() {
      if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
      }
      window.location.href = "index.html";
    }

    // Form submit
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Collect key data for summary
      var namaEl = qs("#nama");
      var jurusanEl = qs("#jurusan");
      var noHpEl = qs("#no-hp");
      var data = {
        nama: namaEl ? namaEl.value.trim() : "",
        jurusan: jurusanEl ? jurusanEl.value : "",
        noHp: noHpEl ? noHpEl.value.trim() : ""
      };

      // Convert jurusan value to label
      var jurusanSelect = qs("#jurusan");
      if (jurusanSelect && jurusanSelect.selectedIndex > 0) {
        data.jurusan = jurusanSelect.options[jurusanSelect.selectedIndex].text;
      }

      showModal(data);
    });

    // Redirect button
    if (redirectBtn) {
      redirectBtn.addEventListener("click", redirectToHome);
    }

    // Close modal on overlay click
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) {
        hideModal();
      }
    });

    // Close modal on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !overlay.hidden) {
        hideModal();
      }
    });
  }

  /**
   * INITIALIZER
   */
  function init() {
    initNavbarToggle();
    initNavActiveScroll();
    initCounterAnimation();
    initFormSubmit();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();