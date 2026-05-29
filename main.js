import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let carrito = [];
let todosLosProductos = [];

// 1. LÓGICA DE VISUALIZACIÓN
async function mostrarTiendaPublica(idTienda, categoria = "Todos") {
    const contenedor = document.getElementById("contenedorCatalogoPublico");
    if (!contenedor) return;

    if (todosLosProductos.length === 0) {
        try {
            const q = query(collection(db, "productos"), where("tiendaId", "==", idTienda));
            const snapshot = await getDocs(q);
            snapshot.forEach((doc) => todosLosProductos.push(doc.data()));
            console.log("Productos cargados:", todosLosProductos.length);
        } catch (e) { console.error("Error Firebase:", e); return; }
    }

    // Filtrado inteligente: ignora mayúsculas y espacios extra
    const filtrados = categoria === "Todos" 
        ? todosLosProductos 
        : todosLosProductos.filter(p => p.categoria && p.categoria.trim().toLowerCase() === categoria.trim().toLowerCase());

    contenedor.innerHTML = ""; 
    
    if (filtrados.length === 0) {
        contenedor.innerHTML = `<p>No hay productos en esta categoría (${categoria}).</p>`;
        return;
    }

    filtrados.forEach((data, index) => {
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

// 2. CARRITO
function actualizarCarrito() {
    const cont = document.getElementById("contenedorCarrito");
    const totalDiv = document.getElementById("totalCarrito");
    localStorage.setItem("carrito", JSON.stringify(carrito));
    if (cont) {
        cont.innerHTML = carrito.length > 0 ? carrito.map((p, i) => `<div>${p.nombre} - $${p.precio} <button onclick="window.eliminarDelCarrito(${i})">X</button></div>`).join("") : "Tu carrito está vacío.";
    }
    if (totalDiv) totalDiv.innerText = `Total: $${carrito.reduce((sum, p) => sum + p.precio, 0)}`;
}

window.eliminarDelCarrito = (index) => { carrito.splice(index, 1); actualizarCarrito(); };

// 3. INICIALIZACIÓN SEGURA
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        console.error("ID de tienda faltante en la URL.");
        return;
    }

    // Cargar carrito previo
    const guardado = localStorage.getItem("carrito");
    if (guardado) { carrito = JSON.parse(guardado); actualizarCarrito(); }

    mostrarTiendaPublica(id, "Todos");

    // Conexión de botones (Mapeo manual para evitar errores de texto)
    const mapaBotones = { 'btnTodos': 'Todos', 'btnLogos': 'Logos', 'btnRedes': 'Redes', 'btnWeb': 'Web' };
    Object.keys(mapaBotones).forEach(btnId => {
        document.getElementById(btnId)?.addEventListener('click', () => {
            mostrarTiendaPublica(id, mapaBotones[btnId]);
        });
    });
});