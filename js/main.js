(() => {
  "use strict";

  const root = document.documentElement;
  const navbar = document.getElementById("mainNav");
  const menuToggle = document.getElementById("menuToggle");
  const navMenu = document.getElementById("navMenu");
  const navLinks = [...document.querySelectorAll(".nav-link[href^='#']")];
  const themeToggle = document.getElementById("themeToggle");
  const themeLabel = document.getElementById("themeLabel");
  const typedText = document.getElementById("typedText");
  const backToTop = document.getElementById("backToTop");
  const toast = document.getElementById("toast");
  const currentYear = document.getElementById("currentYear");

  currentYear.textContent = new Date().getFullYear();

  // Alterna entre las dos paletas infantiles solicitadas.
  const savedTheme = localStorage.getItem("karen-color-theme") || "turquesa";
  applyTheme(savedTheme);

  function applyTheme(theme) {
    const isAgua = theme === "agua";
    root.setAttribute("data-color-theme", isAgua ? "agua" : "turquesa");
    localStorage.setItem("karen-color-theme", isAgua ? "agua" : "turquesa");
    themeLabel.textContent = isAgua ? "Tema" : "Tema";
    themeToggle.setAttribute("aria-label", isAgua ? "Cambiar a tema turquesa" : "Cambiar a tema verde agua");
    themeToggle.setAttribute("title", isAgua ? "Cambiar a turquesa" : "Cambiar a verde agua");

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    metaTheme?.setAttribute("content", isAgua ? "#53b99a" : "#22bec4");
  }

  themeToggle.addEventListener("click", () => {
    const current = root.getAttribute("data-color-theme");
    applyTheme(current === "agua" ? "turquesa" : "agua");
  });

  // Menú móvil.
  function closeMenu() {
    navMenu.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menú");
    menuToggle.innerHTML = '<i class="bi bi-list" aria-hidden="true"></i>';
    document.body.classList.remove("menu-open");
  }

  menuToggle.addEventListener("click", () => {
    const opening = !navMenu.classList.contains("open");
    navMenu.classList.toggle("open", opening);
    menuToggle.setAttribute("aria-expanded", String(opening));
    menuToggle.setAttribute("aria-label", opening ? "Cerrar menú" : "Abrir menú");
    menuToggle.innerHTML = opening
      ? '<i class="bi bi-x-lg" aria-hidden="true"></i>'
      : '<i class="bi bi-list" aria-hidden="true"></i>';
    document.body.classList.toggle("menu-open", opening);
  });

  navMenu.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("click", (event) => {
    if (navMenu.classList.contains("open") && !event.target.closest(".nav-inner")) closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeMenu();
  });

  // Texto animado en la portada.
  const roles = [
    "nutricionista pediátrica",
    "enfoque en nutrición infantil",
    "acompañamiento a familias"
  ];
  let roleIndex = 0;
  let charIndex = roles[0].length;
  let deleting = true;

  function typeRole() {
    const role = roles[roleIndex];
    charIndex += deleting ? -1 : 1;
    typedText.textContent = role.slice(0, Math.max(0, charIndex));

    if (deleting && charIndex <= 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      setTimeout(typeRole, 350);
      return;
    }

    if (!deleting && charIndex >= roles[roleIndex].length) {
      deleting = true;
      setTimeout(typeRole, 1600);
      return;
    }

    setTimeout(typeRole, deleting ? 42 : 72);
  }

  setTimeout(typeRole, 1500);

  // Animaciones al entrar en pantalla.
  const revealElements = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("visible"));
  }

  // Navegación activa y botón volver arriba.
  const sections = [...document.querySelectorAll("main .section-anchor[id]")];
  let ticking = false;

  function updateOnScroll() {
    const scrollY = window.scrollY;
    navbar.classList.toggle("scrolled", scrollY > 18);
    backToTop.classList.toggle("visible", scrollY > 650);

    let currentId = "inicio";
    sections.forEach((section) => {
      if (scrollY >= section.offsetTop - 150) currentId = section.id;
    });
    navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${currentId}`));
    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(updateOnScroll);
      ticking = true;
    }
  }, { passive: true });
  updateOnScroll();

  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // Copiado de datos de contacto y pago.
  let toastTimer;
  function showToast(message = "Copiado") {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 1700);
  }

  async function copyText(value) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        if (!document.execCommand("copy")) throw new Error("No se pudo copiar");
        textarea.remove();
      }
      return true;
    } catch {
      window.prompt("Copia este dato:", value);
      return false;
    }
  }

  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const copied = await copyText(button.dataset.copy);
      if (copied) {
        showToast("Dato copiado");
        button.classList.add("copied");
        setTimeout(() => button.classList.remove("copied"), 1400);
      }
    });
  });
})();
