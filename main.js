import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let carrito = [];
let todosLosProductos = [];

// 1. MOTOR DE INICIALIZACIÓN (Kernel SaaS)
async function inicializarTienda() {
    const urlParams = new URLSearchParams(window.location.search);
    const tiendaId = urlParams.get('id');

    if (!tiendaId) {
        document.body.innerHTML = "<h1>Error: Tienda no especificada.</h1>";
        return;
    }

    try {
        const configSnap = await getDoc(doc(db, "configuraciones", tiendaId));
        if (configSnap.exists()) {
            const config = configSnap.data();
            aplicarConfiguracion(config);
            mostrarTiendaPublica(tiendaId);
        } else {
            document.body.innerHTML = "<h1>Error: Tienda no encontrada.</h1>";
        }
    } catch (e) {
        console.error("Error al inicializar tienda:", e);
    }
}

// 2. MOTOR DE ESTILOS (Aplica colores desde Firestore)
function aplicarConfiguracion(config) {
    const root = document.documentElement;
    if (config.colores) {
        root.style.setProperty('--color-primario', config.colores.primario);
        root.style.setProperty('--color-secundario', config.colores.secundario);
    }
    document.title = config.nombreComercial || "Tienda Clic";
}

// 3. TU LÓGICA DE CATÁLOGO (Integrada)
async function mostrarTiendaPublica(idTienda, categoria = "Todos") {
    const contenedor = document.getElementById("contenedorCatalogoPublico");
    if (!contenedor) return;

    if (todosLosProductos.length === 0) {
        const q = query(collection(db, "productos"), where("tiendaId", "==", idTienda));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((docSnap) => todosLosProductos.push(docSnap.data()));
    }

    const productosFiltrados = categoria === "Todos" ? todosLosProductos : todosLosProductos.filter(p => p.categoria === categoria);

    contenedor.innerHTML = productosFiltrados.length === 0 
        ? "<p>No hay productos disponibles.</p>" 
        : "";

    productosFiltrados.forEach((data, index) => {
        const div = document.createElement("div");
        div.className = "tarjeta-producto";
        div.innerHTML = `
            <img src="${data.imagen || 'https://via.placeholder.com/200'}" style="width: 100%; height: 180px; object-fit: cover; border-radius: 8px;">
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

// 4. TU LÓGICA DE CARRITO (Se mantiene igual)
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
    if(totalDiv) totalDiv.innerText = `Total: $${total}`;
}

window.eliminarDelCarrito = (index) => {
    carrito.splice(index, 1);
    actualizarCarrito();
};

document.addEventListener("DOMContentLoaded", () => {
    const guardado = localStorage.getItem("carrito");
    if (guardado) {
        carrito = JSON.parse(guardado);
        actualizarCarrito();
    }
    inicializarTienda(); // Arranca el motor
});