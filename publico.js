import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let carrito = [];
let todosLosProductos = [];

// 1. CARGA FORZADA DE PRODUCTOS
async function mostrarTiendaPublica(categoria = "Todos") {
    const contenedor = document.getElementById("contenedorCatalogoPublico");
    if (!contenedor) return;

    // Buscamos siempre por el ID fijo "tienda-ejemplo" para eliminar errores de URL
    const idFijo = "tienda-ejemplo";

    if (todosLosProductos.length === 0) {
        try {
            console.log("Consultando Firebase para:", idFijo);
            const q = query(collection(db, "productos"), where("tiendaId", "==", idFijo));
            const snapshot = await getDocs(q);
            snapshot.forEach((doc) => {
                todosLosProductos.push(doc.data());
            });
            console.log("Productos encontrados en Firebase:", todosLosProductos.length);
        } catch (e) { 
            console.error("Error al conectar con Firebase:", e); 
        }
    }

    const filtrados = categoria === "Todos" 
        ? todosLosProductos 
        : todosLosProductos.filter(p => p.categoria && p.categoria.trim() === categoria.trim());

    contenedor.innerHTML = ""; 
    
    if (filtrados.length === 0) {
        contenedor.innerHTML = `<p>No hay productos en esta categoría (${categoria}).</p>`;
        return;
    }

    filtrados.forEach((data, index) => {
        const div = document.createElement("div");
        div.className = "tarjeta-producto";
        div.innerHTML = `
            <h3>${data.nombre}</h3>
            <p>Categoría: ${data.categoria}</p>
            <p>$${data.precio}</p>
            <button class="btn-verde" id="btn-comprar-${index}">Agregar al carrito</button>
        `;
        contenedor.appendChild(div);
        
        div.querySelector(`#btn-comprar-${index}`).addEventListener("click", () => {
            carrito.push({ nombre: data.nombre, precio: parseFloat(data.precio) });
            localStorage.setItem("carrito", JSON.stringify(carrito));
            alert("Agregado: " + data.nombre);
        });
    });
}

// 2. INICIALIZACIÓN
document.addEventListener("DOMContentLoaded", () => {
    // Carga inicial
    mostrarTiendaPublica("Todos");
    
    // Conexión de botones
    document.querySelectorAll('.btn-filtro').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const cat = e.target.innerText;
            mostrarTiendaPublica(cat);
        });
    });
});