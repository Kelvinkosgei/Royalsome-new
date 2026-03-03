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

const quickQuoteForm = document.getElementById("quickQuoteForm");
if (quickQuoteForm) {
  const steps = Array.from(quickQuoteForm.querySelectorAll(".quick-step"));
  const pills = Array.from(quickQuoteForm.querySelectorAll("[data-step-pill]"));
  const nextBtn = document.getElementById("quickNext");
  const prevBtn = document.getElementById("quickPrev");
  const submitBtnQuick = document.getElementById("quickSubmit");
  const summaryEl = document.getElementById("quickQuoteSummary");
  const whatsappLink = document.getElementById("quickQuoteWhatsApp");
  const startDateInput = document.getElementById("qqStart");
  let stepIndex = 0;

  if (startDateInput) {
    const today = new Date().toISOString().split("T")[0];
    startDateInput.min = today;
  }

  const updateStep = () => {
    steps.forEach((step, index) => step.classList.toggle("is-active", index === stepIndex));
    pills.forEach((pill, index) => pill.classList.toggle("active", index === stepIndex));
    if (prevBtn) prevBtn.disabled = stepIndex === 0;
    if (nextBtn) nextBtn.hidden = stepIndex === steps.length - 1;
    if (submitBtnQuick) submitBtnQuick.hidden = stepIndex !== steps.length - 1;
  };

  const validateCurrentStep = () => {
    const currentStep = steps[stepIndex];
    const inputs = Array.from(currentStep.querySelectorAll("input, select"));
    for (const field of inputs) {
      if (!field.checkValidity()) {
        field.reportValidity();
        return false;
      }
    }
    return true;
  };

  const buildSnapshot = () => {
    const escapeHtml = (value) =>
      value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const name = document.getElementById("qqName")?.value.trim() || "";
    const email = document.getElementById("qqEmail")?.value.trim() || "";
    const phone = document.getElementById("qqPhone")?.value.trim() || "";
    const type = document.getElementById("qqType")?.value.trim() || "";
    const budget = document.getElementById("qqBudget")?.value.trim() || "";
    const start = document.getElementById("qqStart")?.value.trim() || "";
    const snapshot = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      `Insurance Type: ${type}`,
      `Budget: ${budget} (KES/month)`,
      `Preferred Start: ${start}`
    ];
    if (summaryEl) summaryEl.innerHTML = snapshot.map((line) => `<p>${escapeHtml(line)}</p>`).join("");

    if (whatsappLink) {
      const waMessage = encodeURIComponent(`Quick Quote Snapshot\n${snapshot.join("\n")}`);
      whatsappLink.href = `https://wa.me/254722395474?text=${waMessage}`;
    }
  };

  nextBtn?.addEventListener("click", () => {
    if (!validateCurrentStep()) return;
    if (stepIndex < steps.length - 1) stepIndex += 1;
    if (stepIndex === steps.length - 1) buildSnapshot();
    updateStep();
  });

  prevBtn?.addEventListener("click", () => {
    if (stepIndex > 0) stepIndex -= 1;
    updateStep();
  });

  quickQuoteForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateCurrentStep()) return;
    buildSnapshot();

    const params = new URLSearchParams({
      name: document.getElementById("qqName")?.value.trim() || "",
      email: document.getElementById("qqEmail")?.value.trim() || "",
      insurance_type: document.getElementById("qqType")?.value.trim() || "",
      message: `Quick Quote Intake | Phone: ${document.getElementById("qqPhone")?.value.trim() || ""} | Budget: ${document.getElementById("qqBudget")?.value.trim() || ""} | Preferred Start: ${document.getElementById("qqStart")?.value.trim() || ""}`
    });
    window.location.href = `contact.html?${params.toString()}`;
  });

  updateStep();
}

const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const submitBtn = document.getElementById("contactSubmit");

if (contactForm && formStatus && submitBtn) {
  const params = new URLSearchParams(window.location.search);
  const nameInput = document.getElementById("name");
  const mailInput = document.getElementById("mail");
  const typeInput = document.getElementById("type");
  const msgInput = document.getElementById("msg");

  const prefillName = params.get("name");
  const prefillEmail = params.get("email");
  const prefillType = params.get("insurance_type");
  const prefillMessage = params.get("message");

  if (prefillName && nameInput) nameInput.value = prefillName;
  if (prefillEmail && mailInput) mailInput.value = prefillEmail;
  if (prefillType && typeInput) typeInput.value = prefillType;
  if (prefillMessage && msgInput) msgInput.value = prefillMessage;

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
