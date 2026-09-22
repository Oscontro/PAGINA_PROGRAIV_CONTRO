/* ============================================================================
   BAND OF BROTHERS · JavaScript vanilla
   ----------------------------------------------------------------------------
   Este archivo es COMPARTIDO por todas las páginas del sitio
   (index.html, capitulos.html, historia.html, galeria.html, contacto.html).
   Cada bloque comprueba si sus elementos existen antes de actuar, así que
   el mismo script funciona en cualquier página sin dar errores.

   Funcionalidades:
     1. Menú hamburguesa (abrir/cerrar, accesibilidad, cerrar con Esc / clic
        fuera / al pulsar un enlace).
     2. Resaltado del enlace de navegación de la página actual.
     3. Galería: filtrado por categoría.
     4. Galería: modal con slider para ampliar la imagen y pasar de una
        foto a otra (abrir, cerrar, foco, flechas de teclado y Esc).
     5. Validación simple del formulario de contacto.
     6. Año dinámico en el footer.
     7. Capítulos: slider de episodios + sinopsis del capítulo activo.
     8. Tráiler: clic en la miniatura para cargar el iframe del vídeo.
     9. Botón "volver arriba" (aparece al bajar, sube con scroll suave).

   Todo el código se envuelve en una IIFE para no contaminar el scope global
   y se ejecuta cuando el DOM está listo (el <script> usa "defer").
   ========================================================================== */

(function () {
  "use strict";

  /* Atajo para seleccionar elementos */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ==========================================================================
     1. MENÚ HAMBURGUESA
     ========================================================================== */
  const botonMenu = $("#btnMenu");
  const menu      = $("#menuPrincipal");

  /**
   * Abre o cierra el menú móvil.
   * @param {boolean} abrir - true para abrir, false para cerrar.
   */
  function alternarMenu(abrir) {
    document.body.classList.toggle("menu-abierto", abrir);
    botonMenu.setAttribute("aria-expanded", String(abrir));
    botonMenu.setAttribute(
      "aria-label",
      abrir ? "Cerrar menú de navegación" : "Abrir menú de navegación"
    );
    /* Al cerrar el menú también se pliegan los submenús que hubiera abiertos */
    if (!abrir) cerrarSubmenus();
  }

  /**
   * Pliega todos los submenús desplegables (uso en móvil).
   */
  function cerrarSubmenus() {
    $$(".menu__item--drop.abierto").forEach((item) => {
      item.classList.remove("abierto");
      const toggle = $(".submenu__toggle", item);
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    });
  }

  if (botonMenu && menu) {
    /* Clic en la hamburguesa: alterna según el estado actual */
    botonMenu.addEventListener("click", function () {
      const estaAbierto = document.body.classList.contains("menu-abierto");
      alternarMenu(!estaAbierto);
    });

    /* Al pulsar cualquier enlace del menú o del submenú, se cierra (útil en móvil) */
    $$(".menu__enlace, .submenu__enlace", menu).forEach((enlace) => {
      enlace.addEventListener("click", () => alternarMenu(false));
    });

    /* Botón chevron: despliega / pliega el submenú de "Capítulos".
       En escritorio el CSS ya lo muestra al pasar el ratón; este botón
       es sobre todo para pantallas táctiles, donde no hay :hover. */
    $$(".menu__item--drop").forEach((item) => {
      const toggle = $(".submenu__toggle", item);
      if (!toggle) return;
      toggle.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const abierto = item.classList.toggle("abierto");
        toggle.setAttribute("aria-expanded", String(abierto));
      });
    });

    /* Tecla Escape: cierra el menú */
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && document.body.classList.contains("menu-abierto")) {
        alternarMenu(false);
        botonMenu.focus();
      }
    });

    /* Clic fuera de la cabecera: cierra el menú */
    document.addEventListener("click", (e) => {
      const dentroCabecera = e.target.closest(".cabecera");
      if (!dentroCabecera && document.body.classList.contains("menu-abierto")) {
        alternarMenu(false);
      }
    });

    /* Si se agranda la ventana a escritorio, se limpia el estado móvil */
    window.matchMedia("(min-width: 900px)").addEventListener("change", (ev) => {
      if (ev.matches) alternarMenu(false);
    });
  }

  /* ==========================================================================
     2. ENLACE ACTIVO SEGÚN LA PÁGINA ACTUAL (sitio multipágina)
     Compara el archivo del href de cada enlace con el archivo de la URL
     actual y marca el que coincida con .activo + aria-current="page".
     ========================================================================== */
  (function marcarPaginaActual() {
    /* Archivo de la URL actual: "" o "/" se tratan como index.html */
    const paginaActual = (location.pathname.split("/").pop() || "index.html").toLowerCase();

    $$(".menu__enlace").forEach((a) => {
      const href = a.getAttribute("href") || "";
      /* Se ignoran los enlaces con ancla (#cap-1, etc.): solo la página */
      if (href.includes("#")) return;
      const destino = href.split("/").pop().toLowerCase();
      if (destino && destino === paginaActual) {
        a.classList.add("activo");
        a.setAttribute("aria-current", "page");
      }
    });
  })();

  /* ==========================================================================
     3. GALERÍA · FILTRADO POR CATEGORÍA
     ========================================================================== */
  const botonesFiltro = $$(".filtro");
  const itemsGaleria  = $$(".galeria__item");

  botonesFiltro.forEach((boton) => {
    boton.addEventListener("click", function () {
      const categoria = boton.dataset.filtro;

      /* Estado visual y accesible de los botones */
      botonesFiltro.forEach((b) => {
        const activo = b === boton;
        b.classList.toggle("filtro--activo", activo);
        b.setAttribute("aria-pressed", String(activo));
      });

      /* Muestra u oculta cada figura según su data-categoria */
      itemsGaleria.forEach((item) => {
        const coincide = categoria === "todas" || item.dataset.categoria === categoria;
        item.hidden = !coincide;
      });
    });
  });

  /* ==========================================================================
     4. GALERÍA · MODAL DE IMAGEN AMPLIADA + SLIDER
     El modal no solo amplía la imagen pulsada: también deja pasar a la
     foto anterior/siguiente (con las flechas del modal o las del
     teclado) dentro del conjunto de imágenes que el filtro activo deja
     visibles en ese momento.
     ========================================================================== */
  const modal        = $("#modalGaleria");
  const modalImg      = $("#modalImg");
  const modalTitulo   = $("#modalTitulo");
  const modalTituloTexto = $("#modalTituloTexto");
  const modalPrev     = $("#modalPrev");
  const modalNext     = $("#modalNext");
  const modalContador = $("#modalContador");
  const disparadores  = $$(".galeria__disparador");
  let ultimoFoco  = null; // para devolver el foco al cerrar
  let indiceModal = 0;    // posición actual dentro de las imágenes visibles

  /**
   * Devuelve los botones-disparador de las imágenes NO ocultas por el
   * filtro de la galería (mismo orden en el que aparecen en la rejilla).
   */
  function imagenesVisibles() {
    return disparadores.filter((btn) => !btn.closest(".galeria__item").hidden);
  }

  /**
   * Vuelca en el modal la imagen "i" (con vuelta circular) dentro del
   * conjunto de imágenes visibles.
   */
  function mostrarImagenModal(i) {
    const visibles = imagenesVisibles();
    if (!visibles.length) return;
    indiceModal = (i + visibles.length) % visibles.length;
    const actual = visibles[indiceModal];
    modalImg.src = actual.dataset.img;
    modalImg.alt = actual.dataset.titulo;
    modalTituloTexto.textContent = actual.dataset.titulo;
    if (modalContador) modalContador.textContent = `${indiceModal + 1} / ${visibles.length}`;
  }

  /**
   * Abre el modal empezando por el disparador pulsado.
   * @param {HTMLElement} disparador - botón de la imagen pulsada.
   */
  function abrirModal(disparador) {
    mostrarImagenModal(imagenesVisibles().indexOf(disparador));
    modal.hidden = false;
    document.body.style.overflow = "hidden"; // evita scroll de fondo
    /* Lleva el foco al botón de cerrar (accesibilidad) */
    $(".modal__cerrar", modal).focus();
  }

  function cerrarModal() {
    modal.hidden = true;
    modalImg.src = "";
    document.body.style.overflow = "";
    if (ultimoFoco) ultimoFoco.focus();
  }

  disparadores.forEach((btn) => {
    btn.addEventListener("click", function () {
      ultimoFoco = btn;
      abrirModal(btn);
    });
  });

  if (modal) {
    /* Cierra al pulsar la X o el fondo (elementos con data-cerrar-modal) */
    $$("[data-cerrar-modal]", modal).forEach((el) => {
      el.addEventListener("click", cerrarModal);
    });

    /* Flechas del slider dentro del modal */
    if (modalPrev) modalPrev.addEventListener("click", () => mostrarImagenModal(indiceModal - 1));
    if (modalNext) modalNext.addEventListener("click", () => mostrarImagenModal(indiceModal + 1));

    /* Teclado: Escape cierra, las flechas izquierda/derecha pasan de foto */
    document.addEventListener("keydown", (e) => {
      if (modal.hidden) return;
      if (e.key === "Escape")     cerrarModal();
      if (e.key === "ArrowLeft")  mostrarImagenModal(indiceModal - 1);
      if (e.key === "ArrowRight") mostrarImagenModal(indiceModal + 1);
    });
  }

  /* ==========================================================================
     5. VALIDACIÓN DEL FORMULARIO DE CONTACTO
     ========================================================================== */
  const form      = $("#formContacto");
  const resultado = $("#resultadoForm");

  /* Expresión regular sencilla para el correo */
  const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  /**
   * Muestra un mensaje de error en el campo indicado.
   * @param {HTMLElement} campo   - input o textarea.
   * @param {string}      mensaje - texto de error ("" para limpiar).
   */
  function marcarError(campo, mensaje) {
    const spanError = document.getElementById("error-" + campo.name);
    campo.setAttribute("aria-invalid", mensaje ? "true" : "false");
    if (spanError) spanError.textContent = mensaje;
    return !mensaje; // devuelve true si el campo es válido
  }

  /**
   * Valida un campo concreto y devuelve true/false.
   */
  function validarCampo(campo) {
    const valor = campo.value.trim();

    if (campo.name === "nombre") {
      if (!valor)              return marcarError(campo, "Escribe tu nombre.");
      if (valor.length < 2)    return marcarError(campo, "El nombre es demasiado corto.");
      return marcarError(campo, "");
    }

    if (campo.name === "email") {
      if (!valor)              return marcarError(campo, "Escribe tu correo electrónico.");
      if (!RE_EMAIL.test(valor)) return marcarError(campo, "El formato del correo no es válido.");
      return marcarError(campo, "");
    }

    if (campo.name === "mensaje") {
      if (!valor)              return marcarError(campo, "Escribe un mensaje.");
      if (valor.length < 10)   return marcarError(campo, "Cuéntanos un poco más (mínimo 10 caracteres).");
      return marcarError(campo, "");
    }

    return true;
  }

  if (form) {
    const campos = $$("input, textarea", form);

    /* Validación en vivo: al salir del campo (blur) */
    campos.forEach((campo) => {
      campo.addEventListener("blur", () => validarCampo(campo));
      /* Al corregir, se limpia el error en cuanto vuelve a ser válido */
      campo.addEventListener("input", () => {
        if (campo.getAttribute("aria-invalid") === "true") validarCampo(campo);
      });
    });

    /* Validación al enviar */
    form.addEventListener("submit", function (e) {
      e.preventDefault(); // prototipo: no se envía a ningún servidor

      /* Se validan todos y se guarda si alguno falla */
      let todoOk = true;
      campos.forEach((campo) => {
        if (!validarCampo(campo)) todoOk = false;
      });

      if (!todoOk) {
        resultado.textContent = "Revisa los campos marcados en rojo.";
        resultado.className = "formulario__resultado err";
        /* Foco en el primer campo inválido */
        const primerError = campos.find((c) => c.getAttribute("aria-invalid") === "true");
        if (primerError) primerError.focus();
        return;
      }

      /* Éxito (simulado) */
      resultado.textContent = "¡Gracias! Tu mensaje se ha registrado correctamente.";
      resultado.className = "formulario__resultado ok";
      form.reset();
      campos.forEach((c) => c.setAttribute("aria-invalid", "false"));
    });
  }

  /* ==========================================================================
     6. AÑO DINÁMICO EN EL FOOTER
     ========================================================================== */
  const spanAnio = $("#anio");
  if (spanAnio) spanAnio.textContent = new Date().getFullYear();

  /* ==========================================================================
     7. CAPÍTULOS · HÉROE-SLIDER (el fondo y el título cambian por capítulo)
     El héroe de capitulos.html es el propio slider: sus fondos
     (.hero-slider__fondo) se alternan con un fundido y, a la vez, se
     actualizan el título del héroe (que pasa a mostrar el nombre del
     episodio, p. ej. "Currahee") y la sinopsis de abajo, con los datos
     (data-numero / data-titulo / data-desc / data-sinopsis) guardados en
     la lista oculta [data-slider-datos].
     ========================================================================== */
  const slider = $("[data-slider]");

  if (slider) {
    const fondos = $$("[data-slider-fondos] .hero-slider__fondo", slider);
    const datos  = $$("[data-slider-datos] > li");
    const btnPrev = $("[data-slider-prev]", slider);
    const btnNext = $("[data-slider-next]", slider);

    const heroTitulo = $("[data-slider-titulo]", slider);

    const panelNumero = $("[data-sinopsis-numero]");
    const panelTitulo = $("[data-sinopsis-titulo]");
    const panelTexto  = $("[data-sinopsis-texto]");

    const destacadoNombre = $("[data-destacado-nombre]");
    const destacadoTexto  = $("[data-destacado-texto]");

    let indice = 0;

    /**
     * Activa el capítulo "i" (con vuelta circular): cruza el fondo del
     * héroe y vuelca sus datos en el título del héroe y la sinopsis de abajo.
     */
    function irACapitulo(i) {
      indice = (i + datos.length) % datos.length;

      fondos.forEach((fondo, j) => {
        fondo.classList.toggle("hero-slider__fondo--activo", j === indice);
      });

      const actual = datos[indice];
      if (heroTitulo) heroTitulo.textContent = actual.dataset.titulo;

      if (panelNumero) panelNumero.textContent = actual.dataset.numero;
      if (panelTitulo) panelTitulo.textContent = actual.dataset.titulo;
      if (panelTexto)  panelTexto.textContent  = actual.dataset.sinopsis;

      if (destacadoNombre) destacadoNombre.textContent = actual.dataset.personaje;
      if (destacadoTexto)  destacadoTexto.textContent  = actual.dataset.personajeTexto;
    }

    if (btnPrev) btnPrev.addEventListener("click", () => irACapitulo(indice - 1));
    if (btnNext) btnNext.addEventListener("click", () => irACapitulo(indice + 1));

    /* Activa el capítulo indicado por el hash actual de la URL (o el
     * primero si no hay uno reconocible). Se usa tanto al cargar la
     * página como cada vez que cambia el hash sin recargarla. */
    function irAHashActual() {
      const i = datos.findIndex((li) => li.id === location.hash.slice(1));
      irACapitulo(i >= 0 ? i : 0);
    }

    irAHashActual();

    /* Si ya se está en capitulos.html y se pulsa otro enlace del submenú
       o del footer (p. ej. capitulos.html#cap-5), el navegador solo
       cambia el hash sin recargar la página, así que hay que escuchar
       "hashchange" para que el slider también salte a ese capítulo. */
    window.addEventListener("hashchange", irAHashActual);
  }

  /* ==========================================================================
     8. TRÁILER · CLIC EN LA MINIATURA PARA CARGAR EL IFRAME DEL VÍDEO
     El iframe arranca sin "src" (solo con "data-src") para no pedirle nada
     a YouTube hasta que el usuario decide reproducirlo. Al pulsar el botón
     se oculta la miniatura, se muestra el iframe y recién ahí se le asigna
     la URL real, lo que dispara la carga (con autoplay porque ocurre
     dentro del propio gesto de clic).
     ========================================================================== */
  const marcoTrailer = $("[data-video]");

  if (marcoTrailer) {
    const disparador = $("[data-video-boton]", marcoTrailer);
    const reproductor = $("[data-video-elemento]", marcoTrailer);

    if (disparador && reproductor) {
      disparador.addEventListener("click", function () {
        disparador.hidden = true;
        reproductor.hidden = false;
        if (reproductor.dataset.src) reproductor.src = reproductor.dataset.src;
      });
    }
  }

  /* ==========================================================================
     9. BOTÓN "VOLVER ARRIBA"
     Estilizado como una insignia de rango (un solo galón), así que el
     propio chevron hace también de flecha "hacia arriba". Permanece oculto
     hasta que se baja un tramo de la página, y al pulsarlo hace scroll
     suave hasta el principio.
     ========================================================================== */
  const btnArriba = $("#btnArriba");

  if (btnArriba) {
    const UMBRAL_SCROLL = 400;

    function actualizarBtnArriba() {
      btnArriba.classList.toggle("visible", window.scrollY > UMBRAL_SCROLL);
    }

    window.addEventListener("scroll", actualizarBtnArriba, { passive: true });
    actualizarBtnArriba();

    btnArriba.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
})();
