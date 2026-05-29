import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let todosLosProductos = [];

// 1. FUNCIÓN PARA ACTUALIZAR LA VISTA DEL CARRITO (CORREGIDA)
function actualizarCarrito() {
    const contenedorCarrito = document.getElementById("contenedorCarrito");
    const totalDiv = document.getElementById("totalCarrito");
    
    localStorage.setItem("carrito", JSON.stringify(carrito));
    
    if (contenedorCarrito) {
        contenedorCarrito.innerHTML = ""; // Limpiamos el contenedor
        
        if (carrito.length === 0) {
            contenedorCarrito.innerHTML = "<p>Tu carrito está vacío.</p>";
        } else {
            carrito.forEach((p, index) => {
                const itemDiv = document.createElement("div");
                itemDiv.style = "display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #ccc;";
                
                itemDiv.innerHTML = `<span>${p.nombre} - $${p.precio}</span>`;
                
                // Botón "X" visible y preciso
                const btnEliminar = document.createElement("button");
                btnEliminar.innerText = "✕";
                btnEliminar.style = "background: #dc3545; color: white; border: none; border-radius: 4px; padding: 5px 10px; cursor: pointer; font-weight: bold;";
                
                // Evento directo sin usar onclick global
                btnEliminar.addEventListener("click", () => {
                    carrito.splice(index, 1);
                    actualizarCarrito();
                });
                
                itemDiv.appendChild(btnEliminar);
                contenedorCarrito.appendChild(itemDiv);
            });
        }
    }
    
    const total = carrito.reduce((sum, p) => sum + p.precio, 0);
    if (totalDiv) totalDiv.innerText = `Total: $${total}`;
}

// 2. CARGA DE PRODUCTOS
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
        const div = document.createElement("div");
        div.className = "tarjeta-producto";
        div.innerHTML = `
            <h3>${data.nombre}</h3>
            <p>$${data.precio}</p>
            <button class="btn-verde" id="btn-${index}">Agregar al carrito</button>
        `;
        contenedor.appendChild(div);
        
        div.querySelector(`#btn-${index}`).addEventListener("click", () => {
            carrito.push({ nombre: data.nombre, precio: parseFloat(data.precio) });
            actualizarCarrito();
            alert("Agregado: " + data.nombre);
        });
    });
}

// 3. INICIALIZACIÓN
document.addEventListener("DOMContentLoaded", () => {
    actualizarCarrito();
    mostrarTiendaPublica("Todos");
    
    document.querySelectorAll('.btn-filtro').forEach(btn => {
        btn.addEventListener('click', (e) => mostrarTiendaPublica(e.target.innerText));
    });
});