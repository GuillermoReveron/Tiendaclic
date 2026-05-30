import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let todosLosProductos = [];

// FUNCIÓN DE SEGUIMIENTO (Google Analytics)
function trackEvent(eventName, eventParams) {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventParams);
    }
}

// 1. CARGA DINÁMICA DE PRODUCTOS POR ID DE TIENDA
async function mostrarTienda(idTienda, categoria = "Todos") {
    const contenedor = document.getElementById("contenedorCatalogoPublico");
    if (!contenedor) return;

    if (todosLosProductos.length === 0) {
        try {
            const q = query(collection(db, "productos"), where("tiendaId", "==", idTienda));
            const snapshot = await getDocs(q);
            snapshot.forEach((doc) => todosLosProductos.push(doc.data()));
        } catch (e) { console.error("Error cargando productos:", e); return; }
    }

    const filtrados = categoria === "Todos" 
        ? todosLosProductos 
        : todosLosProductos.filter(p => p.categoria && p.categoria.trim() === categoria.trim());

    contenedor.innerHTML = ""; 
    
    filtrados.forEach((data, index) => {
        const stock = parseInt(data.stock) || 0;
        const hayStock = stock > 0;
        
        const div = document.createElement("div");
        div.className = "tarjeta-producto";
        div.innerHTML = `
            <img src="${data.imagen || 'https://via.placeholder.com/250'}" alt="${data.nombre}">
            <h3>${data.nombre}</h3>
            <p>$${data.precio}</p>
            <button class="${hayStock ? 'btn-verde' : 'btn-desactivado'}" id="btn-${index}" ${hayStock ? "" : "disabled"}>
                ${hayStock ? "Agregar al carrito" : "Sin Stock"}
            </button>
        `;
        contenedor.appendChild(div);
        
        if (hayStock) {
            div.querySelector(`#btn-${index}`).addEventListener("click", () => {
                carrito.push({ nombre: data.nombre, precio: parseFloat(data.precio) });
                actualizarCarrito();
                // REGISTRO EN ANALYTICS
                trackEvent('add_to_cart', { item_name: data.nombre, shop_id: idTienda });
            });
        }
    });
}

// 2. CARRITO Y WHATSAPP
function actualizarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
    const contenedorCarrito = document.getElementById("contenedorCarrito");
    const totalDiv = document.getElementById("totalCarrito");
    
    if (contenedorCarrito) {
        contenedorCarrito.innerHTML = carrito.length === 0 ? "<p>Tu carrito está vacío.</p>" : "";
        carrito.forEach((p, index) => {
            const item = document.createElement("div");
            item.innerHTML = `<span>${p.nombre} - $${p.precio}</span> <button onclick="eliminar(${index})">X</button>`;
            contenedorCarrito.appendChild(item);
        });
    }
    if (totalDiv) totalDiv.innerText = `Total: $${carrito.reduce((sum, p) => sum + p.precio, 0)}`;
}

window.eliminar = (i) => { carrito.splice(i, 1); actualizarCarrito(); };

// 3. INICIALIZACIÓN
document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        console.error("ID de tienda faltante en la URL.");
        return;
    }

    actualizarCarrito();
    mostrarTienda(id);
    trackEvent('page_view', { page_title: 'Tienda Pública', shop_id: id });
});