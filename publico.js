import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let carrito = [];
let todosLosProductos = []; 

// 1. LÓGICA DE MOSTRAR PRODUCTOS
async function mostrarTiendaPublica(idTienda, categoria = "Todos") {
    const contenedor = document.getElementById("contenedorCatalogoPublico");
    if (!contenedor) return;

    if (todosLosProductos.length === 0) {
        try {
            const q = query(collection(db, "productos"), where("tiendaId", "==", idTienda));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((docSnap) => {
                todosLosProductos.push(docSnap.data());
            });
        } catch (e) {
            console.error("Error al cargar productos:", e);
            return;
        }
    }

    const productosFiltrados = categoria === "Todos" 
        ? todosLosProductos 
        : todosLosProductos.filter(p => p.categoria === categoria);

    contenedor.innerHTML = "";
    if (productosFiltrados.length === 0) {
        contenedor.innerHTML = "<p>No hay productos en esta categoría.</p>";
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

// 2. CARRITO Y FUNCIONES GLOBALES
function actualizarCarrito() {
    const contenedorCarrito = document.getElementById("contenedorCarrito");
    const totalDiv = document.getElementById("totalCarrito");
    
    localStorage.setItem("carrito", JSON.stringify(carrito));
    
    contenedorCarrito.innerHTML = carrito.length > 0 
        ? carrito.map((p, index) => `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding: 8px; border-bottom: 1px solid #eee;">
                <span>${p.nombre} - <strong>$${p.precio}</strong></span>
                <button onclick="eliminarDelCarrito(${index})" style="background: #ff4d4d; color: white; border: none; padding: 5px 12px; border-radius: 4px; cursor: pointer;">Eliminar</button>
            </div>`).join("") 
        : "<p>Tu carrito está vacío.</p>";
    
    const total = carrito.reduce((sum, p) => sum + p.precio, 0);
    if (totalDiv) totalDiv.innerText = `Total: $${total}`;
}

window.eliminarDelCarrito = (index) => {
    carrito.splice(index, 1);
    actualizarCarrito();
};

window.filtrarProductos = (cat) => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || "tienda-ejemplo";
    mostrarTiendaPublica(id, cat);
};

// 3. INICIALIZACIÓN
document.addEventListener("DOMContentLoaded", () => {
    const guardado = localStorage.getItem("carrito");
    if (guardado) {
        carrito = JSON.parse(guardado);
        actualizarCarrito();
    }

    // Configurar botones de filtro
    document.getElementById('btnTodos')?.addEventListener('click', () => window.filtrarProductos('Todos'));
    document.getElementById('btnLogos')?.addEventListener('click', () => window.filtrarProductos('Logos'));
    document.getElementById('btnRedes')?.addEventListener('click', () => window.filtrarProductos('Redes'));
    document.getElementById('btnWeb')?.addEventListener('click', () => window.filtrarProductos('Web'));

    // Iniciar con la tienda de la URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || "tienda-ejemplo";
    mostrarTiendaPublica(id);
});

document.getElementById("btnFinalizar")?.addEventListener("click", () => {
    if (carrito.length === 0) return alert("El carrito está vacío");
    let mensaje = "Hola, quiero realizar el siguiente pedido:%0A%0A";
    carrito.forEach(p => mensaje += `- ${p.nombre}: $${p.precio}%0A`);
    const total = carrito.reduce((sum, p) => sum + p.precio, 0);
    mensaje += `%0A*Total: $${total}*`;
    window.open(`https://wa.me/+5492281310771?text=${mensaje}`, "_blank");
});