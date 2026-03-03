const revealElements = document.querySelectorAll("[data-reveal]");

if (revealElements.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -40px 0px" }
  );

  revealElements.forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index * 40, 240)}ms`;
    observer.observe(element);
  });
}

const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const currentPage = window.location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".nav-links a").forEach((link) => {
  if (link.getAttribute("href") === currentPage) {
    link.classList.add("active");
    link.setAttribute("aria-current", "page");
  }
});

const formatCounterValue = (value, format) => {
  if (format === "kPlusRound") return `${Math.round(value / 1000)}k+`;
  if (format === "kPlusOne") return `${(value / 1000).toFixed(1)}k+`;
  if (format === "percent") return `${Math.round(value)}%`;
  if (format === "moneyMPlus") return `$${Math.round(value)}M+`;
  return Math.round(value).toString();
};

const animateCounter = (counterEl) => {
  const target = Number(counterEl.dataset.target || 0);
  const format = counterEl.dataset.format || "";
  const duration = 1700;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = target * eased;
    counterEl.textContent = formatCounterValue(current, format);
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      counterEl.textContent = formatCounterValue(target, format);
    }
  };

  requestAnimationFrame(tick);
};

const counters = document.querySelectorAll(".counter-number");
if (counters.length > 0) {
  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.45 }
  );
  counters.forEach((counterEl) => counterObserver.observe(counterEl));
}

const navWrap = document.querySelector(".nav-wrap");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuToggle && navLinks) {
  const closeMenu = () => {
    navLinks.classList.remove("open");
    menuToggle.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

  document.addEventListener("click", (event) => {
    if (navWrap && !navWrap.contains(event.target)) closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) closeMenu();
  });
}

const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const submitBtn = document.getElementById("contactSubmit");

if (contactForm && formStatus && submitBtn) {
  const nextInput = contactForm.querySelector('input[name="_next"]');
  const thankYouUrl = new URL("thank-you.html", window.location.href).href;
  if (nextInput) nextInput.value = thankYouUrl;

  contactForm.addEventListener("submit", async (event) => {
    const ajaxAction = contactForm.dataset.ajaxAction;
    const shouldUseAjax = Boolean(ajaxAction) && window.location.protocol !== "file:";

    if (!shouldUseAjax) {
      // Allow normal form POST when running from file:// or if ajax action is missing.
      return;
    }

    event.preventDefault();
    formStatus.textContent = "Sending your request...";
    formStatus.className = "form-status";
    submitBtn.classList.add("is-loading");
    submitBtn.disabled = true;

    try {
      const response = await fetch(ajaxAction, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { Accept: "application/json" }
      });
      if (!response.ok) throw new Error("Request failed.");
      formStatus.textContent = "Request sent successfully. Our team will contact you shortly.";
      formStatus.classList.add("success");
      contactForm.reset();
      window.location.href = thankYouUrl;
      return;
    } catch (error) {
      // Fallback to a normal form submit to maximize deliverability.
      formStatus.textContent = "Finalizing your request...";
      formStatus.className = "form-status";
      contactForm.submit();
      return;
    } finally {
      submitBtn.classList.remove("is-loading");
      submitBtn.disabled = false;
    }
  });
}
