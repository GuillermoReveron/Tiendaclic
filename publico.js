// Asegúrate de que esta variable esté fuera de la función, como ya la tienes
let todosLosProductos = []; 

async function mostrarTiendaPublica(idTienda, categoria = "Todos") {
    const contenedor = document.getElementById("contenedorCatalogoPublico");
    if (!contenedor) return;

    if (todosLosProductos.length === 0) {
        const q = query(collection(db, "productos"), where("tiendaId", "==", idTienda));
        const snap = await getDocs(q);
        snap.forEach(d => todosLosProductos.push(d.data()));
    }

    // --- DEPURACIÓN: MUESTRA QUÉ CATEGORÍAS EXISTEN REALMENTE ---
    const categoriasExistentes = [...new Set(todosLosProductos.map(p => p.categoria))];
    console.log("Categorías encontradas en base de datos:", categoriasExistentes);
    // -----------------------------------------------------------

    const productosFiltrados = categoria === "Todos" 
        ? todosLosProductos 
        : todosLosProductos.filter(p => String(p.categoria).trim() === categoria.trim());

    // ... resto del código igual ...
};

    contenedor.innerHTML = "";
    
    if (productosFiltrados.length === 0) {
        contenedor.innerHTML = `<p>No hay productos en la categoría: ${categoria}</p>`;
        return;
    }

    productosFiltrados.forEach((data, index) => {
        const div = document.createElement("div");
        div.className = "tarjeta-producto";
        div.innerHTML = `
            <img src="${data.imagen || 'https://placehold.co/200'}" style="width: 100%; height: 180px; object-fit: cover; border-radius: 8px;">
            <h3>${data.nombre}</h3>
            <p class="precio">$${data.precio}</p>
            <button class="btn-verde" id="btn-comprar-${index}">Agregar al carrito</button>
        `;
        contenedor.appendChild(div);

        div.querySelector(`#btn-comprar-${index}`).addEventListener("click", () => {
            carrito.push({ nombre: data.nombre, precio: parseFloat(data.precio) });
            actualizarCarrito();
        });
    });
}