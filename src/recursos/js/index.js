//  Importaciones
// Importaciones
import { productos, errorProductos } from './productos.js';

import {
    renderizarProductos,
    filtrarPorCategoria,
    ordenarProductos,
    obtenerProductoPorId,
    renderizarDetalle,
    renderizarOfertas,
    construirJSONContacto,
    validarContacto,
    enviarContacto,
    mostrarMensajeContacto,
    buscarProductos
} from './funciones.js'


// Notificar errores en la carga de productos
if (errorProductos) {
    const mensajeError = document.createElement("p");

    mensajeError.textContent =
        "No pudimos cargar los productos. Intentá nuevamente más tarde.";

    mensajeError.classList.add("mensaje-error-productos");

    mensajeError.setAttribute("role", "alert");

    const contenedorPrincipal = document.querySelector("main");

    if (contenedorPrincipal) {
        contenedorPrincipal.prepend(mensajeError);
    } else {
        document.body.prepend(mensajeError);
    }
}


// ---Vista de catálogo (catalogo.html) ---

// Referencias DOM
const contenedorProductos = document.getElementById("contenedor-productos");
const enlacesCategorias = document.querySelectorAll(".lista-categorias a");
const selectOrdenar = document.getElementById("id-ordenar");
const buscador = document.getElementById("id_buscar");

// Estado de los filtros
let categoriaActual = "Todas";
let textoBusqueda = "";
let ordenActual = "relevancia";

if (contenedorProductos) {

    // Función para aplicar todos los filtros
    const actualizarCatalogo = () => {
        let productosActuales = filtrarPorCategoria(categoriaActual);

        productosActuales = buscarProductos(textoBusqueda, productosActuales);

        productosActuales = ordenarProductos(ordenActual, productosActuales);

        if (productosActuales.length === 0) {
            contenedorProductos.innerHTML = "<p>No se encontraron productos.</p>";
        } else {
            renderizarProductos(contenedorProductos, productosActuales);
        }
    };

    // Evento de categorías
    enlacesCategorias.forEach(enlace => {
        enlace.addEventListener("click", (e) => {
            e.preventDefault();

            categoriaActual = enlace.textContent.trim();

            actualizarCatalogo();
        });
    });

    // Evento de ordenamiento
    selectOrdenar.addEventListener("change", (e) => {
        ordenActual = e.target.value;

        actualizarCatalogo();
    });

    // Evento de búsqueda
    buscador.addEventListener("input", (e) => {
        textoBusqueda = e.target.value;

        actualizarCatalogo();
    });

    // Evitar que el buscador recargue la página
    buscador.closest("form").addEventListener("submit", (e) => {
        e.preventDefault();
    });

    // Carga inicial del catálogo
    actualizarCatalogo();
}




// ---Vista de detalle (detalle_producto.html) ---

const contenedorDetalle = document.getElementById("contenedor-detalle");

if (contenedorDetalle) {
    const urlParams = new URLSearchParams(window.location.search);
    const idProducto = parseInt(urlParams.get("id"));

    const productoSeleccionado = obtenerProductoPorId(idProducto, productos);

    renderizarDetalle(contenedorDetalle, productoSeleccionado);

    const formularioAgregar = document.getElementById("formulario-agregar-carrito");

    if (formularioAgregar) {
        formularioAgregar.addEventListener("submit", (e) => {
            e.preventDefault();

            const cantidad = Number(
                document.getElementById("id-cantidad").value
            );

            const agregado = agregarAlCarrito(idProducto, cantidad);

            if (!agregado) {
                alert("Podés agregar hasta 10 unidades de cada producto.");
                return;
            }

            window.location.href = "./carrito.html";
        });
    }
}



// ---Vista de ofertas (ofertas.html) ---

const contenedorOfertas = document.getElementById("contenedor-ofertas");

if (contenedorOfertas) {

    renderizarOfertas(contenedorOfertas, productos);

    contenedorOfertas.addEventListener("click", (e) => {

        const boton = e.target.closest(".agregar-oferta");

        if (boton) {
            const id = Number(boton.dataset.id);

            const agregado = agregarAlCarrito(id, 1);

            if (!agregado) {
                alert("Podés agregar hasta 10 unidades de cada producto.");
                return;
            }

            window.location.href = "./carrito.html";
        }
    });
}



// ---Vista de contacto (contacto.html) ---
// Referencias DOM
const formularioContacto = document.getElementById('formulario-contacto');
const mensajeFormulario = document.getElementById('mensaje-formulario');

if (formularioContacto) {
    formularioContacto.addEventListener("submit", async (e) => {
        e.preventDefault(); // Evita que la página se recargue

        const datos = construirJSONContacto(formularioContacto);
        const errores = validarContacto(datos);

        if (errores.length > 0) {
            mostrarMensajeContacto(mensajeFormulario, errores, true);
            return;
        }

        try {
            const resultado = await enviarContacto(datos);
            console.log("Respuesta del servidor:", resultado);

            formularioContacto.reset();

            mostrarMensajeContacto(
                mensajeFormulario,
                ["¡Gracias! Tu consulta de prueba fue procesada correctamente."],
                false
            );
        } catch (error) {
            mostrarMensajeContacto(mensajeFormulario, ["No pudimos enviar tu consulta. Intentá de nuevo más tarde."], true);
            console.error(error);
        }
    });

    // Si el usuario toca "Limpiar", también borramos el mensaje
    formularioContacto.addEventListener("reset", () => {
        mensajeFormulario.innerHTML = "";
    });
}

import {
    obtenerCarrito,
    guardarCarrito,
    agregarAlCarrito,
    renderizarCarrito,
    modificarCantidad,
    eliminarDelCarrito,
    calcularEnvio,
    validarCodigoPostal,
    construirMensajePedido
} from './carrito.js';

// ---Vista del carrito (carrito.html) ---

const contenedorCarrito = document.getElementById("contenedor-carrito");

if (contenedorCarrito) {

    // Referencias DOM
    const formularioEnvio = document.getElementById("formulario-envio");
    const selectProvincia = document.getElementById("id-provincia");
    const inputCodigoPostal = document.getElementById("id-codigo-postal");
    const mensajeEnvio = document.getElementById("mensaje-envio");
    const formularioPedido = document.getElementById("formulario-pedido");
    const mensajePedido = document.getElementById("mensaje-pedido");
    const inputNota = document.getElementById("id-nota");

    // Estado del envío
    let provinciaEnvio = "";
    let codigoPostalEnvio = "";
    let subtotal = 0;
    let costoEnvio = 0;

    // Actualizar productos y precios
    const actualizarCarrito = () => {
        subtotal = renderizarCarrito(
            contenedorCarrito,
            productos
        );

        costoEnvio = 0;

        if (provinciaEnvio && subtotal > 0) {
            costoEnvio = calcularEnvio(provinciaEnvio, subtotal);

            document.getElementById("envio-carrito").textContent =
                costoEnvio === 0
                    ? "Gratis"
                    : "$" + costoEnvio.toLocaleString("es-AR");

        } else {
            document.getElementById("envio-carrito").textContent =
                "A calcular";
        }

        if (subtotal === 0) {
            mensajeEnvio.textContent = "";
        }

        const total = subtotal + costoEnvio;

        document.getElementById("subtotal-carrito").textContent =
            "$" + subtotal.toLocaleString("es-AR");

        document.getElementById("total-carrito").textContent =
            "$" + total.toLocaleString("es-AR");
    };

    // Evento para modificar cantidades
    contenedorCarrito.addEventListener("change", (e) => {
        if (e.target.classList.contains("input-cantidad-carrito")) {

            const id = Number(e.target.dataset.id);
            const cantidad = Number(e.target.value);

            const modificado = modificarCantidad(id, cantidad);

            if (!modificado) {
                alert("La cantidad debe ser un número entero entre 1 y 10.");
            }

            actualizarCarrito();
        }
    });

    // Evento para eliminar productos
    contenedorCarrito.addEventListener("click", (e) => {
        const boton = e.target.closest(".boton-quitar");

        if (boton) {
            const id = Number(boton.dataset.id);

            eliminarDelCarrito(id);

            actualizarCarrito();
        }
    });

    // Evento para consultar el envío
    formularioEnvio.addEventListener("submit", (e) => {
        e.preventDefault();

        const provincia = selectProvincia.value;
        const codigoPostal = inputCodigoPostal.value.trim();

        if (subtotal === 0) {
            mensajeEnvio.textContent =
                "Primero agregá productos al carrito.";
            return;
        }

        if (!provincia) {
            mensajeEnvio.textContent =
                "Seleccioná una provincia.";
            return;
        }

        if (!validarCodigoPostal(codigoPostal)) {
            mensajeEnvio.textContent =
                "Ingresá un código postal válido.";
            return;
        }

        provinciaEnvio = provincia;
        codigoPostalEnvio = codigoPostal;

        actualizarCarrito();

        mensajeEnvio.textContent =
            "Costo de envío calculado correctamente.";
    });

    // Reiniciar el envío si se modifica el destino
    formularioEnvio.addEventListener("input", () => {
        provinciaEnvio = "";
        codigoPostalEnvio = "";

        mensajeEnvio.textContent = "";

        actualizarCarrito();
    });

    // Evento para finalizar el pedido
formularioPedido.addEventListener("submit", (e) => {
    e.preventDefault();

    if (obtenerCarrito().length === 0 || subtotal <= 0) {
        mensajePedido.textContent =
            "No podés finalizar un pedido con el carrito vacío.";
        return;
    }

    if (!provinciaEnvio || !codigoPostalEnvio) {
        mensajePedido.textContent =
            "Primero tenés que consultar los gastos de envío.";
        return;
    }

    const nombreProvincia =
        selectProvincia.options[selectProvincia.selectedIndex].text;

    const nota = inputNota.value;

    const mensaje = construirMensajePedido(
        productos,
        nombreProvincia,
        codigoPostalEnvio,
        subtotal,
        costoEnvio,
        nota
    );

    const numeroWhatsApp = "5493884344862"; // Aca puse mi propio numero, remplazar por el numero de la persona que esta haciendo la prueba

    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;

    mensajePedido.textContent =
        "¡Pedido preparado! Confirmá el envío del mensaje en WhatsApp.";

    window.open(url, "_blank", "noopener,noreferrer");
});

    // Carga inicial
    actualizarCarrito();
}