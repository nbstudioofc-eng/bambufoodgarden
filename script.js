import * as core from "./core.js";

(function initializeSite() {
  

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const telemetry = window.BambuTelemetry;

  document.documentElement.classList.add("js");
  document.querySelectorAll("[data-whatsapp]").forEach((link) => {
    link.href = core.buildWhatsAppUrl(link.dataset.whatsapp);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  });

  const loader = document.querySelector("[data-loader]");
  const loaderBar = document.querySelector("[data-loader-bar]");
  const loaderValue = document.querySelector("[data-loader-value]");
  let loaderProgress = 0;
  let loaderFrame = 0;

  function renderLoader(value) {
    loaderProgress = Math.min(100, value);
    loaderBar.style.transform = `scaleX(${loaderProgress / 100})`;
    loaderValue.textContent = `${Math.round(loaderProgress)}%`;
  }

  function advanceLoader() {
    if (loaderProgress < 88) {
      renderLoader(loaderProgress + Math.max(0.35, (88 - loaderProgress) * 0.035));
      loaderFrame = requestAnimationFrame(advanceLoader);
    }
  }

  function finishLoader() {
    cancelAnimationFrame(loaderFrame);
    renderLoader(100);
    window.setTimeout(() => {
      loader.classList.add("is-complete");
      document.body.classList.add("is-ready");
      telemetry?.record("ui_ready", { duration: String(Math.round(performance.now())) });
    }, reducedMotion ? 0 : 180);
  }

  advanceLoader();
  if (document.readyState === "complete") finishLoader();
  else window.addEventListener("load", finishLoader, { once: true });

  document.querySelectorAll("img[loading='lazy']").forEach((image) => {
    image.decoding = "async";
    image.classList.add("lazy-media");
    const markLoaded = () => image.classList.add("is-loaded");
    if (image.complete) markLoaded();
    else {
      image.addEventListener("load", markLoaded, { once: true });
      image.addEventListener("error", () => {
        image.classList.add("is-error");
        telemetry?.record("image_error", { source: image.currentSrc || image.src });
      }, { once: true });
    }
  });

  const header = document.querySelector("[data-header]");
  const progressBar = document.querySelector("[data-scroll-progress]");
  let scrollFrame;
  function updateScrollState() {
    header.classList.toggle("scrolled", window.scrollY > 24);
    const progress = core.getScrollProgress(window.scrollY, document.documentElement.scrollHeight, window.innerHeight);
    progressBar.style.transform = `scaleX(${progress})`;
    scrollFrame = null;
  }
  window.addEventListener("scroll", () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollState);
  }, { passive: true });
  updateScrollState();

  const menuButton = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  function closeMenu() {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir menu");
    mobileMenu.classList.remove("open");
    window.setTimeout(() => { mobileMenu.hidden = true; }, reducedMotion ? 0 : 180);
  }
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    if (isOpen) closeMenu();
    else {
      mobileMenu.hidden = false;
      requestAnimationFrame(() => mobileMenu.classList.add("open"));
      menuButton.setAttribute("aria-expanded", "true");
      menuButton.setAttribute("aria-label", "Fechar menu");
    }
  });
  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  if (reducedMotion || !("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal").forEach((element) => {
      element.classList.add("visible");
    });
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -4%" });
    document.querySelectorAll(".reveal").forEach((element) => {
      observer.observe(element);
    });
  }

  document.querySelector("[data-year]").textContent = new Date().getFullYear();

  const lightbox = document.querySelector(".lightbox");
  const lightboxImage = lightbox.querySelector("img");
  const lightboxCaption = lightbox.querySelector("p");
  const lightboxClose = lightbox.querySelector(".lightbox-close");
  document.querySelectorAll(".gallery-item").forEach((item) => {
    item.addEventListener("click", () => {
      const source = item.querySelector("img");
      lightboxImage.src = source.src;
      lightboxImage.alt = source.alt;
      lightboxCaption.textContent = source.alt;
      lightbox.showModal();
      requestAnimationFrame(() => lightbox.classList.add("is-open"));
      telemetry?.record("gallery_open", { image: source.alt });
    });
  });
  function closeLightbox() {
    lightbox.classList.remove("is-open");
    window.setTimeout(() => lightbox.close(), reducedMotion ? 0 : 180);
  }
  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => { if (event.target === lightbox) closeLightbox(); });

  document.querySelectorAll("a[href]").forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      if (event.defaultPrevented || !core.isInternalPageLink(anchor, window.location)) return;
      event.preventDefault();
      document.body.classList.add("is-leaving");
      telemetry?.flush();
      window.setTimeout(() => { window.location.href = anchor.href; }, reducedMotion ? 0 : 180);
    });
  });
})();
