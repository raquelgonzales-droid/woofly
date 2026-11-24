
/* =========================================
   W21 - SERVICIOS OFRECIDOS
   Funcionalidades exclusivas de la sección 21
========================================= */

(function () {

    const seccion = document.getElementById("w21");

    // Si la sección no está en la página, no ejecutar este código.
    if (!seccion) return;

    // Buscar elementos únicamente dentro de W21.
    const $ = (id) => seccion.querySelector("#w21-" + id);

    const KEY = "woofly-w21-servicios";

    const INICIALES = [
        {
            id: 1,
            icono: "🐾",
            nombre: "Paseo",
            precio: 50,
            unidad: ""
        },
        {
            id: 2,
            icono: "🏠",
            nombre: "Cuidado en casa",
            precio: 150,
            unidad: "/día"
        },
        {
            id: 3,
            icono: "❤️",
            nombre: "Visita a domicilio",
            precio: 30,
            unidad: ""
        }
    ];

    let servicios = cargar();
    let editandoId = null;

    function copiar(datos) {
        return JSON.parse(JSON.stringify(datos));
    }

    function cargar() {
        try {
            const datos = JSON.parse(localStorage.getItem(KEY));

            if (Array.isArray(datos)) {
                return datos;
            }
        } catch (error) {
            console.warn("No se pudieron cargar los servicios:", error);
        }

        return copiar(INICIALES);
    }

    function guardar() {
        try {
            localStorage.setItem(KEY, JSON.stringify(servicios));
        } catch (error) {
            console.warn("No se pudieron guardar los servicios:", error);
        }
    }

    function etiqueta(servicio) {
        return servicio.nombre + " · " +
            servicio.precio + " Bs" + servicio.unidad;
    }

    // Dibujar servicios en la página y en la ventana.
    function dibujar() {
        const ul = $("servicios");
        const lista = $("lista");

        ul.textContent = "";
        lista.textContent = "";

        if (servicios.length === 0) {
            const vacio = document.createElement("li");

            vacio.className = "w21-vacio";
            vacio.textContent =
                "Aún no hay servicios. Pulsa Editar para añadir el primero.";

            ul.appendChild(vacio);
        }

        servicios.forEach(function (servicio, indice) {

            // Píldora del recuadro principal.
            const li = document.createElement("li");
            li.className = "w21-servicio w21-c" + (indice % 6);

            const icono = document.createElement("span");
            icono.className = "w21-icono";
            icono.setAttribute("aria-hidden", "true");
            icono.textContent = servicio.icono;

            const texto = document.createElement("span");
            texto.textContent = etiqueta(servicio);

            li.appendChild(icono);
            li.appendChild(texto);
            ul.appendChild(li);

            // Fila dentro de la ventana emergente.
            const fila = document.createElement("li");
            fila.className = "w21-fila";

            const nombre = document.createElement("span");
            nombre.className = "w21-nombre-fila";
            nombre.textContent =
                servicio.icono + " " + etiqueta(servicio);

            const botones = document.createElement("div");
            botones.className = "w21-botones";

            const editar = document.createElement("button");
            editar.type = "button";
            editar.className = "w21-btn w21-btn-sec w21-pequeno";
            editar.textContent = "Editar";

            editar.addEventListener("click", function () {
                empezarEdicion(servicio.id);
            });

            const eliminar = document.createElement("button");
            eliminar.type = "button";
            eliminar.className = "w21-btn w21-btn-peligro w21-pequeno";
            eliminar.textContent = "Eliminar";

            eliminar.addEventListener("click", function () {
                eliminarServicio(servicio.id);
            });

            botones.appendChild(editar);
            botones.appendChild(eliminar);

            fila.appendChild(nombre);
            fila.appendChild(botones);

            lista.appendChild(fila);
        });
    }

    // Cargar datos de un servicio en el formulario.
    function empezarEdicion(id) {
        const servicio = servicios.find(function (elemento) {
            return elemento.id === id;
        });

        if (!servicio) return;

        editandoId = id;

        $("icono").value = servicio.icono;
        $("nombre").value = servicio.nombre;
        $("precio").value = servicio.precio;
        $("unidad").value = servicio.unidad;

        $("guardar").textContent = "Guardar cambios";
        $("cancelar").hidden = false;
        $("error").textContent = "";

        $("nombre").focus();
    }

    // Limpiar el formulario y cancelar la edición.
    function terminarEdicion() {
        editandoId = null;

        $("formulario").reset();
        $("guardar").textContent = "Añadir servicio";
        $("cancelar").hidden = true;
        $("error").textContent = "";
    }

    // Eliminar un servicio.
    function eliminarServicio(id) {
        servicios = servicios.filter(function (servicio) {
            return servicio.id !== id;
        });

        if (editandoId === id) {
            terminarEdicion();
        }

        guardar();
        dibujar();
    }

    // Abrir ventana.
    function abrirVentana() {
        terminarEdicion();
        $("ventana").showModal();
    }

    // Cerrar ventana.
    function cerrarVentana() {
        terminarEdicion();
        $("ventana").close();
    }

    // Eventos de los botones.
    $("abrir").addEventListener("click", abrirVentana);
    $("cerrar").addEventListener("click", cerrarVentana);
    $("listo").addEventListener("click", cerrarVentana);

    // Cerrar al pulsar fuera del cuadro.
    $("ventana").addEventListener("click", function (evento) {
        if (evento.target === $("ventana")) {
            cerrarVentana();
        }
    });

    // Añadir o guardar cambios de un servicio.
    $("formulario").addEventListener("submit", function (evento) {
        evento.preventDefault();

        const nombre = $("nombre").value.trim();
        const precio = parseFloat($("precio").value);

        if (!nombre) {
            $("error").textContent =
                "Escribe el nombre del servicio.";
            return;
        }

        if (isNaN(precio) || precio < 0) {
            $("error").textContent =
                "Escribe un precio válido.";
            return;
        }

        const datos = {
            icono: $("icono").value,
            nombre: nombre,
            precio: precio,
            unidad: $("unidad").value
        };

        if (editandoId !== null) {

            // Actualizar servicio existente.
            servicios = servicios.map(function (servicio) {
                if (servicio.id === editandoId) {
                    return Object.assign(
                        { id: servicio.id },
                        datos
                    );
                }

                return servicio;
            });

        } else {

            // Crear un nuevo servicio.
            const nuevoId = servicios.reduce(
                function (mayor, servicio) {
                    return Math.max(mayor, servicio.id);
                },
                0
            ) + 1;

            servicios.push(
                Object.assign({ id: nuevoId }, datos)
            );
        }

        guardar();
        terminarEdicion();
        dibujar();
    });

    // Cancelar edición.
    $("cancelar").addEventListener("click", terminarEdicion);

    // Restaurar los tres servicios iniciales.
    $("restaurar").addEventListener("click", function () {
        servicios = copiar(INICIALES);

        terminarEdicion();
        guardar();
        dibujar();
    });

    // Mostrar los servicios al cargar la página.
    dibujar();

})();

/* =================================
   W27 - BUSCADOR DE CUIDADORES
================================= */

(() => {
  const seccion = document.getElementById("w27");

  if (!seccion) return;

  // Datos de ejemplo de cuidadores
  const cuidadores = [
    {
      id: "maria-quispe",
      nombre: "María Quispe",
      servicios: ["Paseo"],
      zona: "Cochabamba",
      precio: 60,
      calificacion: 4.9,
      resenas: 41,
      dias: [1, 2, 3, 4, 5, 6]
    },
    {
      id: "carlos-rojas",
      nombre: "Carlos Rojas",
      servicios: ["Cuidado", "Visita"],
      zona: "Cochabamba",
      precio: 120,
      calificacion: 4.6,
      resenas: 27,
      dias: [0, 1, 2, 3, 4, 5, 6]
    },
    {
      id: "lucia-fernandez",
      nombre: "Lucía Fernández",
      servicios: ["Paseo", "Visita"],
      zona: "Cochabamba",
      precio: 80,
      calificacion: 4.8,
      resenas: 35,
      dias: [0, 5, 6]
    },
    {
      id: "andrea-salvatierra",
      nombre: "Andrea Salvatierra",
      servicios: ["Cuidado"],
      zona: "La Paz",
      precio: 140,
      calificacion: 4.5,
      resenas: 18,
      dias: [1, 2, 3, 4]
    },
    {
      id: "diego-torres",
      nombre: "Diego Torres",
      servicios: ["Cuidado", "Visita"],
      zona: "Santa Cruz",
      precio: 150,
      calificacion: 4.7,
      resenas: 63,
      dias: [0, 1, 2, 3, 4, 5, 6]
    }
  ];

  const formulario = seccion.querySelector("#w27-form-filtros");
  const resultados = seccion.querySelector("#w27-resultados");
  const contador = seccion.querySelector("#w27-contador");

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    buscarCuidadores();
  });

  function buscarCuidadores() {
    const servicio = seccion.querySelector("#w27-servicio").value;
    const fecha = seccion.querySelector("#w27-fecha").value;
    const zona = seccion.querySelector("#w27-zona").value;
    const precio = seccion.querySelector("#w27-precio").value;

    const encontrados = cuidadores.filter((cuidador) => {

      if (
        servicio &&
        !cuidador.servicios.includes(servicio)
      ) return false;

      if (zona && cuidador.zona !== zona) return false;

      if (precio) {
        const [minimo, maximo] = precio.split("-").map(Number);

        if (
          cuidador.precio < minimo ||
          cuidador.precio > maximo
        ) return false;
      }

      if (fecha) {
        const dia = new Date(fecha + "T00:00:00").getDay();

        if (!cuidador.dias.includes(dia)) return false;
      }

      return true;
    });

    mostrarResultados(encontrados);
  }

  function mostrarResultados(lista) {
    if (lista.length === 0) {
      resultados.innerHTML = "";
      contador.textContent =
        "No encontramos cuidadores con esos filtros. Prueba cambiando los criterios.";
      return;
    }

    contador.textContent = lista.length === 1
      ? "1 cuidador encontrado"
      : lista.length + " cuidadores encontrados";

    resultados.innerHTML = lista.map((cuidador) => `
      <article class="w27-tarjeta">

        <div class="w27-avatar" aria-hidden="true">
          ${cuidador.nombre.charAt(0)}
        </div>

        <h3>${cuidador.nombre}</h3>

        <p class="w27-servicio">
          ${cuidador.servicios.join(" · ")}
        </p>

        <p class="w27-zona">
          ${cuidador.zona}, Bolivia
        </p>

        <p class="w27-calificacion">
          <span>★</span>
          <strong>${cuidador.calificacion}</strong>
          <small>· ${cuidador.resenas} reseñas</small>
        </p>

        <p class="w27-precio">
          Desde ${cuidador.precio} BS / día
        </p>

        <a class="w27-boton"
           href="perfil.html?id=${cuidador.id}">
          Ver perfil
        </a>

      </article>
    `).join("");
  }

})();


/* =========================================
   W51 - FORMULARIO DE REGISTRO DE CUIDADOR
========================================= */

(function () {
    const form = document.getElementById('w51-formulario');

    // Si la página no contiene W51, no ejecuta este código.
    if (!form) return;

    const aviso = document.getElementById('w51-aviso');
    const inputFoto = document.getElementById('w51-foto');
    const zonaFoto = document.getElementById('w51-zona-foto');
    const vista = document.getElementById('w51-vista-previa');
    const textoFoto = document.getElementById('w51-texto-foto');

    const MAX_BYTES = 5 * 1024 * 1024;
    const TIPOS = ['image/jpeg', 'image/png'];

    // Validaciones de los campos
    const reglas = {
        nombre: v =>
            v.length < 3
                ? 'Escribe tu nombre completo (mínimo 3 letras).'
                : !/^[\p{L}\s'.-]+$/u.test(v)
                    ? 'El nombre solo puede contener letras.'
                    : '',

        edad: v =>
            v === ''
                ? 'Indica tu edad.'
                : (!/^\d+$/.test(v) || +v < 18 || +v > 99)
                    ? 'Debes ser mayor de 18 años (entre 18 y 99).'
                    : '',

        zona: v =>
            v.length < 2
                ? 'Indica tu ciudad o barrio.'
                : '',

        servicio: v =>
            v === ''
                ? 'Selecciona un tipo de servicio.'
                : '',

        experiencia: v =>
            v.length < 20
                ? 'Cuéntanos un poco más (mínimo 20 caracteres).'
                : '',

        disponibilidad: v =>
            v.length < 3
                ? 'Indica tus días y horarios disponibles.'
                : '',

        contacto: v => {
            const correo = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
            const telefono = /^\+?[\d\s-]{7,15}$/.test(v);

            return (correo || telefono)
                ? ''
                : 'Escribe un correo válido o un teléfono de 7 a 15 dígitos.';
        }
    };

    // Mostrar u ocultar errores
    function mostrarError(campoEl, mensaje) {
        const contenedor = campoEl.closest('.w51-campo');

        contenedor.classList.toggle('w51-invalido', !!mensaje);
        contenedor.querySelector('.w51-msg-error').textContent = mensaje;

        if (campoEl.setAttribute) {
            campoEl.setAttribute(
                'aria-invalid',
                mensaje ? 'true' : 'false'
            );
        }
    }

    // Validar un campo
    function validarCampo(nombre) {
        const el = form.elements[nombre];
        const mensaje = reglas[nombre](el.value.trim());

        mostrarError(el, mensaje);

        return mensaje === '';
    }

    // Validar fotografía
    function validarFoto() {
        const archivo = inputFoto.files[0];
        let mensaje = '';

        if (!archivo) {
            mensaje = 'Sube una foto tuya.';
        } else if (!TIPOS.includes(archivo.type)) {
            mensaje = 'El archivo debe ser JPG o PNG.';
        } else if (archivo.size > MAX_BYTES) {
            mensaje = 'La foto pesa más de 5MB. Elige una más ligera.';
        }

        mostrarError(inputFoto, mensaje);

        return mensaje === '';
    }

    // Validación al salir de cada campo
    Object.keys(reglas).forEach(nombre => {
        const el = form.elements[nombre];

        el.addEventListener('blur', () => {
            validarCampo(nombre);
        });

        el.addEventListener('input', () => {
            if (
                el.closest('.w51-campo')
                    .classList.contains('w51-invalido')
            ) {
                validarCampo(nombre);
            }
        });
    });

    // Vista previa de la fotografía
    inputFoto.addEventListener('change', () => {
        const archivo = inputFoto.files[0];

        if (
            archivo &&
            TIPOS.includes(archivo.type) &&
            archivo.size <= MAX_BYTES
        ) {
            vista.src = URL.createObjectURL(archivo);
            zonaFoto.classList.add('w51-con-foto');
            textoFoto.textContent = archivo.name;
        } else {
            zonaFoto.classList.remove('w51-con-foto');
            vista.removeAttribute('src');
            textoFoto.textContent =
                'Arrastra una foto o haz clic para subir';
        }

        validarFoto();
    });

    // Efecto visual al arrastrar una fotografía
    ['dragenter', 'dragover'].forEach(evento => {
        zonaFoto.addEventListener(evento, () => {
            zonaFoto.classList.add('arrastrando');
        });
    });

    ['dragleave', 'drop'].forEach(evento => {
        zonaFoto.addEventListener(evento, () => {
            zonaFoto.classList.remove('arrastrando');
        });
    });

    // Convertir fotografía a formato Data URL
    function leerComoDataURL(archivo) {
        return new Promise((resolve, reject) => {
            const lector = new FileReader();

            lector.onload = () => resolve(lector.result);
            lector.onerror = reject;

            lector.readAsDataURL(archivo);
        });
    }

    // Enviar formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        aviso.className = 'w51-aviso';
        aviso.textContent = '';

        // Validar todos los campos
        const resultados = Object.keys(reglas).map(validarCampo);
        resultados.push(validarFoto());

        if (resultados.includes(false)) {
            aviso.className = 'w51-aviso w51-error';
            aviso.textContent =
                'Revisa los campos marcados en rojo: faltan datos o son incorrectos.';

            const primero = form.querySelector(
                '.w51-invalido input, .w51-invalido select, .w51-invalido textarea'
            );

            if (primero) primero.focus();

            return;
        }

        // Crear solicitud del cuidador
        let solicitud;

        try {
            solicitud = {
                id: Date.now(),
                fecha: new Date().toISOString(),
                nombre: form.elements.nombre.value.trim(),
                edad: Number(form.elements.edad.value),
                zona: form.elements.zona.value.trim(),
                servicio: form.elements.servicio.value,
                experiencia: form.elements.experiencia.value.trim(),
                disponibilidad: form.elements.disponibilidad.value.trim(),
                contacto: form.elements.contacto.value.trim(),
                foto: await leerComoDataURL(inputFoto.files[0])
            };
        } catch (error) {
            aviso.className = 'w51-aviso w51-error';
            aviso.textContent =
                'No pudimos procesar tu fotografía. Inténtalo de nuevo.';
            return;
        }

        // Guardar solicitud en el navegador
        try {
            const lista = JSON.parse(
                localStorage.getItem('woofly_cuidadores') || '[]'
            );

            lista.push(solicitud);

            localStorage.setItem(
                'woofly_cuidadores',
                JSON.stringify(lista)
            );

        } catch (error) {
            // Intentar guardar los datos sin la fotografía
            try {
                const lista = JSON.parse(
                    localStorage.getItem('woofly_cuidadores') || '[]'
                );

                lista.push({
                    ...solicitud,
                    foto: '(foto no guardada: sin espacio)'
                });

                localStorage.setItem(
                    'woofly_cuidadores',
                    JSON.stringify(lista)
                );

            } catch (error2) {
                aviso.className = 'w51-aviso w51-error';
                aviso.textContent =
                    'No pudimos guardar tu registro. Inténtalo de nuevo.';
                return;
            }
        }

        // Confirmación de registro
        console.log('Solicitud registrada:', solicitud);

        aviso.className = 'w51-aviso w51-ok';
        aviso.textContent =
            '¡Listo, ' + solicitud.nombre.split(' ')[0] +
            '! Registramos tu solicitud como cuidador.';

        form.reset();

        zonaFoto.classList.remove('w51-con-foto');
        vista.removeAttribute('src');

        textoFoto.textContent =
            'Arrastra una foto o haz clic para subir';

        form.querySelectorAll('.w51-invalido').forEach(campo => {
            campo.classList.remove('w51-invalido');
        });

        aviso.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    });

})();
