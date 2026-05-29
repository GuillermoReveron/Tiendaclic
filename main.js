import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let carrito = [];
let todosLosProductos = [];

// 1. MOTOR DE INICIALIZACIÓN
async function inicializarTienda() {
    const urlParams = new URLSearchParams(window.location.search);
    const tiendaId = urlParams.get('id');
    if (!tiendaId) return;

    try {
        const configSnap = await getDoc(doc(db, "configuraciones", tiendaId));
        if (configSnap.exists()) {
            aplicarConfiguracion(configSnap.data());
            // Cargar productos una sola vez
            const q = query(collection(db, "productos"), where("tiendaId", "==", tiendaId));
            const querySnapshot = await getDocs(q);
            todosLosProductos = []; // Limpiar antes de llenar
            querySnapshot.forEach((docSnap) => todosLosProductos.push(docSnap.data()));
            
            mostrarTiendaPublica("Todos");
        }
    } catch (e) { console.error("Error al inicializar:", e); }
}

function aplicarConfiguracion(config) {
    const root = document.documentElement;
    if (config.colores) {
        root.style.setProperty('--color-primario', config.colores.primario);
        root.style.setProperty('--color-secundario', config.colores.secundario);
    }
    document.title = config.nombreComercial || "Tienda Clic";
}

// 2. LÓGICA DE VISUALIZACIÓN (CORREGIDA)
function mostrarTiendaPublica(categoria = "Todos") {
    const contenedor = document.getElementById("contenedorCatalogoPublico");
    if (!contenedor) return;

    // Filtramos usando comparación robusta
    const productosFiltrados = categoria === "Todos" 
        ? todosLosProductos 
        : todosLosProductos.filter(p => p.categoria.toLowerCase() === categoria.toLowerCase());

    contenedor.innerHTML = ""; // LIMPIEZA TOTAL antes de renderizar
    
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

// 3. CARRITO Y EXPOSICIÓN
function actualizarCarrito() {
    const contenedorCarrito = document.getElementById("contenedorCarrito");
    const totalDiv = document.getElementById("totalCarrito");
    localStorage.setItem("carrito", JSON.stringify(carrito));
    
    contenedorCarrito.innerHTML = carrito.length > 0 
        ? carrito.map((p, index) => `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding: 8px; border-bottom: 1px solid #eee;">
                <span>${p.nombre} - <strong>$${p.precio}</strong></span>
                <button onclick="eliminarDelCarrito(${index})" style="background: #ff4d4d; color: white; border: none; padding: 5px 12px; border-radius: 4px; cursor: pointer;">X</button>
            </div>`).join("") 
        : "<p>Tu carrito está vacío.</p>";
    
    if(totalDiv) totalDiv.innerText = `Total: $${carrito.reduce((sum, p) => sum + p.precio, 0)}`;
}

window.eliminarDelCarrito = (index) => {
    carrito.splice(index, 1);
    actualizarCarrito();
};

window.filtrarProductos = (cat) => {
    mostrarTiendaPublica(cat);
};

document.addEventListener("DOMContentLoaded", () => {
    const guardado = localStorage.getItem("carrito");
    if (guardado) {
        carrito = JSON.parse(guardado);
        actualizarCarrito();
    }
    inicializarTienda();
    
    // Conectar botones manualmente para asegurar que no fallen
    ['Todos', 'Logos', 'Redes', 'Web'].forEach(cat => {
        document.getElementById('btn' + cat)?.addEventListener('click', () => window.filtrarProductos(cat));
    });
});