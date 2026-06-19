/* ============================================================
   HOTEL PLAZA KÁVIA — interacciones
   ============================================================ */
(function () {
  "use strict";

  /* -------- CONFIG (edita estos datos reales) -------- */
  const WHATSAPP = "18090000000";              // número con código de país, sin signos
  const HOTEL    = "Hotel Plaza Kávia";

  /* -------- Navbar: sólida al hacer scroll -------- */
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 60);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* -------- Menú móvil -------- */
  const toggle = document.getElementById("navToggle");
  const links  = document.getElementById("navLinks");
  const closeMenu = () => {
    links.classList.remove("open");
    nav.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
  };
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    nav.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });
  links.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

  /* -------- Reveal al hacer scroll -------- */
  const revealEls = document.querySelectorAll(".reveal");
  revealEls.forEach((el) => {
    const d = el.getAttribute("data-delay");
    if (d) el.style.setProperty("--d", d);
  });
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* -------- Año del footer -------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* -------- Botones "Reservar" de cada habitación -> preselecciona tipo -------- */
  document.querySelectorAll("[data-room]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tipo = btn.getAttribute("data-room");
      const sel = document.getElementById("tipo");
      if (sel) sel.value = tipo;
    });
  });

  /* -------- Formulario de reserva -> WhatsApp -------- */
  const form = document.getElementById("reservaForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nombre = (document.getElementById("nombre").value || "").trim();
      if (!nombre) {
        document.getElementById("nombre").focus();
        return;
      }
      const checkin  = document.getElementById("checkin").value;
      const checkout = document.getElementById("checkout").value;
      const tipo     = document.getElementById("tipo").value;
      const huesp    = document.getElementById("huespedes").value;
      const msg      = (document.getElementById("mensaje").value || "").trim();

      const partes = [
        `¡Hola ${HOTEL}! Quiero hacer una reserva.`,
        ``,
        `• Nombre: ${nombre}`,
        `• Habitación: ${tipo}`,
        `• Huéspedes: ${huesp}`,
        checkin  ? `• Llegada: ${checkin}`  : null,
        checkout ? `• Salida: ${checkout}` : null,
        msg ? `• Nota: ${msg}` : null,
      ].filter(Boolean);

      const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(partes.join("\n"))}`;
      window.open(url, "_blank", "noopener");
    });
  }

  /* -------- WhatsApp flotante -> abre chat directo -------- */
  const wa = document.getElementById("waFloat");
  if (wa) {
    wa.addEventListener("click", (e) => {
      e.preventDefault();
      const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
        `¡Hola ${HOTEL}! Me gustaría más información para reservar.`
      )}`;
      window.open(url, "_blank", "noopener");
    });
  }

  /* -------- Lightbox de la galería -------- */
  const items = Array.from(document.querySelectorAll(".gallery__item"));
  const lb     = document.getElementById("lightbox");
  const lbImg  = document.getElementById("lbImg");
  const lbClose= document.getElementById("lbClose");
  const lbPrev = document.getElementById("lbPrev");
  const lbNext = document.getElementById("lbNext");
  let current = 0;

  const sources = items.map((it) => ({
    src: it.getAttribute("data-src"),
    alt: it.querySelector("img") ? it.querySelector("img").alt : "",
  }));

  const show = (i) => {
    current = (i + sources.length) % sources.length;
    lbImg.src = sources[current].src;
    lbImg.alt = sources[current].alt;
  };
  const openLb = (i) => {
    show(i);
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };
  const closeLb = () => {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  items.forEach((it, i) => it.addEventListener("click", () => openLb(i)));
  lbClose.addEventListener("click", closeLb);
  lbPrev.addEventListener("click", () => show(current - 1));
  lbNext.addEventListener("click", () => show(current + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });
})();
