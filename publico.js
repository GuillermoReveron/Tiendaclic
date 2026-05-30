import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let todosLosProductos = [];

// FUNCIÓN: Generar botones de filtro dinámicamente
function generarFiltros() {
    const contenedorFiltros = document.getElementById("contFiltros");
    if (!contenedorFiltros) return;

    const categorias = ["Todos", ...new Set(todosLosProductos.map(p => p.categoria || "Sin categoría"))];
    contenedorFiltros.innerHTML = ""; 

    categorias.forEach(cat => {
        const btn = document.createElement("button");
        btn.innerText = cat;
        btn.className = "btn-filtro";
        btn.addEventListener('click', () => mostrarTiendaPublica(cat));
        contenedorFiltros.appendChild(btn);
    });
}

// FUNCIÓN: Generar y abrir WhatsApp
function enviarPorWhatsApp() {
    let mensaje = "¡Hola! Quiero hacer el siguiente pedido:%0A%0A";
    let total = 0;

    carrito.forEach(p => {
        mensaje += `• ${p.nombre}: $${p.precio}%0A`;
        total += p.precio;
    });

    mensaje += `%0A*Total: $${total}*`;
    
    const numeroWhatsApp = "5492281310771"; 
    const url = `https://wa.me/${numeroWhatsApp}?text=${mensaje}`;
    
    window.open(url, '_blank');
}

// FUNCIÓN: Actualizar carrito y persistencia
function actualizarCarrito() {
    const contenedorCarrito = document.getElementById("contenedorCarrito");
    const totalDiv = document.getElementById("totalCarrito");
    
    localStorage.setItem("carrito", JSON.stringify(carrito));
    
    if (contenedorCarrito) {
        contenedorCarrito.innerHTML = ""; 
        
        if (carrito.length === 0) {
            contenedorCarrito.innerHTML = "<p>Tu carrito está vacío.</p>";
        } else {
            carrito.forEach((p, index) => {
                const itemDiv = document.createElement("div");
                itemDiv.style = "display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #ccc;";
                
                itemDiv.innerHTML = `<span>${p.nombre} - $${p.precio}</span>`;
                
                const btnEliminar = document.createElement("button");
                btnEliminar.innerText = "✕";
                btnEliminar.style = "background: #dc3545; color: white; border: none; border-radius: 4px; padding: 5px 10px; cursor: pointer; font-weight: bold;";
                
                btnEliminar.addEventListener("click", () => {
                    carrito.splice(index, 1);
                    actualizarCarrito();
                });
                
                itemDiv.appendChild(btnEliminar);
                contenedorCarrito.appendChild(itemDiv);
            });

            const btnWpp = document.createElement("button");
            btnWpp.innerText = "Enviar pedido por WhatsApp 🛒";
            btnWpp.style = "margin-top: 15px; background: #25d366; color: white; border: none; padding: 10px; cursor: pointer; border-radius: 5px; width: 100%; font-weight: bold;";
            btnWpp.addEventListener("click", enviarPorWhatsApp);
            contenedorCarrito.appendChild(btnWpp);
        }
    }
    
    const total = carrito.reduce((sum, p) => sum + p.precio, 0);
    if (totalDiv) totalDiv.innerText = `Total: $${total}`;
}

// FUNCIÓN: Carga de productos con validación de stock
async function mostrarTiendaPublica(categoria = "Todos") {
    const contenedor = document.getElementById("contenedorCatalogoPublico");
    if (!contenedor) return;

    const idFijo = "tienda-ejemplo";

    if (todosLosProductos.length === 0) {
        try {
            const q = query(collection(db, "productos"), where("tiendaId", "==", idFijo));
            const snapshot = await getDocs(q);
            snapshot.forEach((doc) => todosLosProductos.push(doc.data()));
        } catch (e) { console.error("Error Firebase:", e); }
    }

    const filtrados = categoria === "Todos" 
        ? todosLosProductos 
        : todosLosProductos.filter(p => p.categoria && p.categoria.trim() === categoria.trim());

    contenedor.innerHTML = ""; 
    
    filtrados.forEach((data, index) => {
        // Lógica de stock
        const stock = parseInt(data.stock) || 0;
        const hayStock = stock > 0;
        const botonTexto = hayStock ? "Agregar al carrito" : "Sin Stock";
        const claseBoton = hayStock ? "btn-verde" : "btn-desactivado";

        const div = document.createElement("div");
        div.className = "tarjeta-producto";
        div.innerHTML = `
            <img src="${data.imagen || 'https://via.placeholder.com/250'}" alt="${data.nombre}">
            <h3>${data.nombre}</h3>
            <p>$${data.precio}</p>
            <button class="${claseBoton}" id="btn-${index}" ${hayStock ? "" : "disabled"}>
                ${botonTexto}
            </button>
        `;
        contenedor.appendChild(div);
        
        if (hayStock) {
            div.querySelector(`#btn-${index}`).addEventListener("click", () => {
                carrito.push({ nombre: data.nombre, precio: parseFloat(data.precio) });
                actualizarCarrito();
                alert("Agregado: " + data.nombre);
            });
        }
    });
}

// INICIALIZACIÓN
document.addEventListener("DOMContentLoaded", async () => {
    actualizarCarrito(); 
    await mostrarTiendaPublica("Todos");
    generarFiltros();
});