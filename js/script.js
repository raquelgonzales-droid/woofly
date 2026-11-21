
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

