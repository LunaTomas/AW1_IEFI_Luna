// Función para obtener los productos desde el JSON
const obtenerProductos = async () => {
    const respuesta = await fetch(
        new URL("../datos/productos.json", import.meta.url)
    );

    if (!respuesta.ok) {
        throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    const datos = await respuesta.json();

    if (!Array.isArray(datos)) {
        throw new Error("El JSON no contiene un arreglo de productos.");
    }

    return datos.map(producto => ({
        ...producto,
        precioFinal: producto.precio - (producto.precio * producto.descuento)
    }));
};

// Arreglo de productos
let productos = [];

// Estado de la carga
let errorProductos = null;

// Cargar los productos y gestionar errores
try {
    productos = await obtenerProductos();

    console.log("Productos cargados correctamente:", productos);

} catch (error) {
    errorProductos = error;

    console.error("Error al cargar los productos:", error);
}

export { productos, obtenerProductos, errorProductos };