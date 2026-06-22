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

  /* -------- Room Modal -------- */
  const ROOM_DATA = {
    Sencilla: {
      title: "Habitación Sencilla",
      price: 1800,
      capacity: "1 huésped",
      badge: "",
      tag: "1 huésped",
      desc: "Ideal para el viajero individual. Cama cómoda, baño privado y todo lo esencial para una estancia tranquila.",
      feats: ["1 cama", "Baño privado", "Aire acondicionado", "WiFi gratis", "TV por cable"],
      img: "img/sencilla.jpg",
    },
    Doble: {
      title: "Habitación Doble",
      price: 2500,
      capacity: "Hasta 2 huéspedes",
      badge: "Más popular",
      tag: "2 huéspedes",
      desc: "Perfecta para parejas o dos viajeros. Dos camas, amplitud y comodidad para disfrutar tu estadía.",
      feats: ["2 camas", "Baño privado", "Aire acondicionado", "WiFi gratis", "TV por cable"],
      img: "img/doble.jpg",
    },
    Triple: {
      title: "Habitación Triple",
      price: 3200,
      capacity: "Hasta 3 huéspedes",
      badge: "",
      tag: "3 huéspedes",
      desc: "Espaciosa y versátil, pensada para familias o grupos de amigos que viajan juntos.",
      feats: ["3 camas", "Baño privado", "Aire acondicionado", "WiFi gratis", "TV por cable"],
      img: "img/triple.jpg",
    },
  };

  const roomModal  = document.getElementById("roomModal");
  const rmClose    = document.getElementById("rmClose");
  const rmImg      = document.getElementById("rmImg");
  const rmTitle    = document.getElementById("rmTitle");
  const rmCapacity = document.getElementById("rmCapacity");
  const rmBadge    = document.getElementById("rmBadge");
  const rmTag      = document.getElementById("rmTag");
  const rmDesc     = document.getElementById("rmDesc");
  const rmFeats    = document.getElementById("rmFeats");
  const rmCalc     = document.getElementById("rmCalc");
  const rmReserve  = document.getElementById("rmReserve");
  const rmCheckin  = document.getElementById("rmCheckin");
  const rmCheckout = document.getElementById("rmCheckout");
  let   rmCurrentKey = "";

  function fmtPrice(n) {
    return "RD$ " + n.toLocaleString("es-DO");
  }

  function updateRoomCalc() {
    const room = ROOM_DATA[rmCurrentKey];
    if (!room || !rmCheckin.value || !rmCheckout.value) {
      rmCalc.innerHTML = "<span>Selecciona las fechas para ver el total.</span>";
      return;
    }
    const d1 = new Date(rmCheckin.value);
    const d2 = new Date(rmCheckout.value);
    const nights = Math.round((d2 - d1) / 86400000);
    if (nights <= 0) {
      rmCalc.innerHTML = "<span>La salida debe ser después de la llegada.</span>";
      return;
    }
    const total = nights * room.price;
    rmCalc.innerHTML =
      '<span class="calc-nights">' + nights + " noche" + (nights > 1 ? "s" : "") +
      " × " + fmtPrice(room.price) + " / noche</span>" +
      "<strong>" + fmtPrice(total) + "</strong>";
  }

  function openRoomModal(key) {
    const room = ROOM_DATA[key];
    if (!room || !roomModal) return;
    rmCurrentKey = key;

    rmImg.src          = room.img;
    rmImg.alt          = room.title;
    rmTitle.textContent    = room.title;
    rmCapacity.textContent = room.capacity;
    rmBadge.textContent    = room.badge;
    rmTag.textContent      = room.tag;
    rmDesc.textContent     = room.desc;
    rmFeats.innerHTML = room.feats.map((f) => "<li>" + f + "</li>").join("");

    const today = new Date().toISOString().split("T")[0];
    rmCheckin.min  = today;
    rmCheckout.min = today;
    rmCheckin.value  = "";
    rmCheckout.value = "";
    rmCalc.innerHTML = "<span>Selecciona las fechas para ver el total.</span>";

    roomModal.classList.add("open");
    roomModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    rmClose.focus();
  }

  function closeRoomModal() {
    if (!roomModal) return;
    roomModal.classList.remove("open");
    roomModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  if (roomModal) {
    rmClose.addEventListener("click", closeRoomModal);
    roomModal.addEventListener("click", (e) => { if (e.target === roomModal) closeRoomModal(); });
    rmCheckin.addEventListener("change", () => {
      rmCheckout.min = rmCheckin.value || new Date().toISOString().split("T")[0];
      if (rmCheckout.value && rmCheckout.value <= rmCheckin.value) rmCheckout.value = "";
      updateRoomCalc();
    });
    rmCheckout.addEventListener("change", updateRoomCalc);

    rmReserve.addEventListener("click", () => {
      const room = ROOM_DATA[rmCurrentKey];
      if (!room) return;
      const parts = [
        "¡Hola " + HOTEL + "! Quiero hacer una reserva.",
        "",
        "• Habitación: " + room.title,
        rmCheckin.value  ? "• Llegada: "  + rmCheckin.value  : null,
        rmCheckout.value ? "• Salida: "   + rmCheckout.value : null,
      ].filter(Boolean);
      window.open("https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(parts.join("\n")), "_blank", "noopener");
    });
  }

  /* Click & keyboard on room cards */
  document.querySelectorAll("[data-open-room]").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("a, button")) return;
      openRoomModal(card.getAttribute("data-open-room"));
    });
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openRoomModal(card.getAttribute("data-open-room"));
      }
    });
  });

  /* Legacy [data-room] reserve buttons -> open modal */
  document.querySelectorAll("[data-room]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      openRoomModal(btn.getAttribute("data-room"));
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
    if (roomModal && roomModal.classList.contains("open")) {
      if (e.key === "Escape") closeRoomModal();
      return;
    }
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });
})();
