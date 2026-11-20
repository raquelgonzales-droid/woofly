
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
