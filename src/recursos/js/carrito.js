// Obtener los productos guardados en el carrito
const obtenerCarrito = () => {
    const datos = localStorage.getItem("carrito");

    return datos ? JSON.parse(datos) : [];
};

// Guardar el carrito
const guardarCarrito = (carrito) => {
    localStorage.setItem("carrito", JSON.stringify(carrito));
};

// Agregar un producto al carrito
const agregarAlCarrito = (id, cantidad) => {
    const carrito = obtenerCarrito();

    const productoExistente = carrito.find(
        producto => producto.id === id
    );

    const cantidadActual = productoExistente
        ? productoExistente.cantidad
        : 0;

    if (!Number.isInteger(cantidad) || cantidad < 1 ||
        cantidadActual + cantidad > 10) {
        return false;
    }

    if (productoExistente) {
        productoExistente.cantidad += cantidad;
    } else {
        carrito.push({
            id: id,
            cantidad: cantidad
        });
    }

    guardarCarrito(carrito);

    return true;
};

// Modificar la cantidad de un producto
const modificarCantidad = (id, cantidad) => {
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 10) {
        return false;
    }

    const carrito = obtenerCarrito();

    const producto = carrito.find(item => item.id === id);

    if (!producto) {
        return false;
    }

    producto.cantidad = cantidad;

    guardarCarrito(carrito);

    return true;
};

// Eliminar un producto del carrito
const eliminarDelCarrito = (id) => {
    const carrito = obtenerCarrito();

    const carritoActualizado = carrito.filter(
        item => item.id !== id
    );

    guardarCarrito(carritoActualizado);
};

// Mostrar los productos guardados en el carrito
const renderizarCarrito = (contenedor, productos) => {
    const carrito = obtenerCarrito();

    let carritoHTML = "";
    let subtotal = 0;

    carrito.forEach(item => {
        const producto = productos.find(
            producto => producto.id === item.id
        );

        if (!producto) {
            return;
        }

        const importe = producto.precioFinal * item.cantidad;

        subtotal += importe;

        carritoHTML += `
            <article class="producto-carrito">
                <img src="${producto.imagen}"
                     alt="${producto.nombre}"
                     width="100">

                <div class="info-producto-carrito">
                    <h3>${producto.nombre}</h3>

                    <p>${producto.descripcion}</p>

                    <p>Precio unitario:
                        $${producto.precioFinal.toLocaleString("es-AR")}
                    </p>

                    <div class="cantidad-carrito">
                        <label for="cantidad-${item.id}">Cantidad:</label>

                        <input
                            type="number"
                            id="cantidad-${item.id}"
                            class="input-cantidad-carrito"
                            data-id="${item.id}"
                            min="1"
                            max="10"
                            value="${item.cantidad}"
                            required
                        >

                        <button
                            type="button"
                            class="boton-secundario boton-quitar"
                            data-id="${item.id}"
                        >
                            Quitar
                        </button>
                    </div>

                    <p><strong>
                        Subtotal: $${importe.toLocaleString("es-AR")}
                    </strong></p>
                </div>
            </article>
        `;
    });

    contenedor.innerHTML = carritoHTML ||
        "<p>Tu carrito está vacío.</p>";

    return subtotal;
};

// Calcular el costo de envío según provincia y subtotal
const calcularEnvio = (provincia, subtotal) => {
    if (subtotal <= 0) {
        return 0;
    }

    if (subtotal >= 150000) {
        return 0;
    }

    if (provincia === "cordoba") {
        return 3500;
    }

    if (provincia === "buenos-aires" || provincia === "caba") {
        return 5500;
    }

    return 7000;
};

// Validar el código postal
const validarCodigoPostal = (codigoPostal) => {
    const expresion = /^[0-9]{4}$/;

    return expresion.test(codigoPostal);
};

// Construir mensaje del pedido para WhatsApp
const construirMensajePedido = (
    productos,
    provincia,
    codigoPostal,
    subtotal,
    costoEnvio,
    nota
) => {
    const carrito = obtenerCarrito();

    let mensaje = "Hola, quiero hacer la siguiente compra.\n\n";

    mensaje += "PRODUCTOS\n\n";

    carrito.forEach(item => {
        const producto = productos.find(
            producto => producto.id === item.id
        );

        if (producto) {
            const importe = producto.precioFinal * item.cantidad;

            mensaje += `- ${producto.nombre}\n`;
            mensaje += `Cantidad: ${item.cantidad}\n`;
            mensaje += `Importe: $${importe.toLocaleString("es-AR")}\n\n`;
        }
    });

    mensaje += "DATOS DE ENVÍO\n";
    mensaje += `Provincia: ${provincia}\n`;
    mensaje += `Código postal: ${codigoPostal}\n\n`;

    mensaje += "RESUMEN DEL PEDIDO\n";
    mensaje += `Subtotal: $${subtotal.toLocaleString("es-AR")}\n`;

    mensaje += costoEnvio === 0
        ? "Envío: Gratis\n"
        : `Envío: $${costoEnvio.toLocaleString("es-AR")}\n`;

    const total = subtotal + costoEnvio;

    mensaje += `*Total: $${total.toLocaleString("es-AR")}*\n`;

    if (nota.trim() !== "") {
        mensaje += `\nNota del pedido: ${nota}\n`;
    }

    return mensaje;
};

export {
    obtenerCarrito,
    guardarCarrito,
    agregarAlCarrito,
    renderizarCarrito,
    modificarCantidad,
    eliminarDelCarrito,
    calcularEnvio,
    validarCodigoPostal,
    construirMensajePedido
};