// Asegúrate de que esta variable esté fuera de la función, como ya la tienes
let todosLosProductos = []; 

async function mostrarTiendaPublica(idTienda, categoria = "Todos") {
    const contenedor = document.getElementById("contenedorCatalogoPublico");
    if (!contenedor) return;

    // Si la lista maestra está vacía, la llenamos de Firebase
    if (todosLosProductos.length === 0) {
        try {
            const q = query(collection(db, "productos"), where("tiendaId", "==", idTienda));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((docSnap) => {
                todosLosProductos.push(docSnap.data());
            });
            console.log("Productos cargados en memoria:", todosLosProductos.length);
        } catch (e) {
            console.error("Error al cargar productos:", e);
            return;
        }
    }

    // Filtrado: comparamos quitando espacios y en minúsculas para que no falle por un detalle
    const productosFiltrados = categoria === "Todos" 
        ? todosLosProductos 
        : todosLosProductos.filter(p => 
            p.categoria && p.categoria.trim().toLowerCase() === categoria.trim().toLowerCase()
          );

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