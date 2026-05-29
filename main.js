import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let carrito = [];
let todosLosProductos = [];

async function mostrarTiendaPublica(idTienda, categoria = "Todos") {
    const contenedor = document.getElementById("contenedorCatalogoPublico");
    if (!contenedor) return;

    console.log("Cargando productos para:", idTienda, "Categoría:", categoria);

    if (todosLosProductos.length === 0) {
        try {
            const q = query(collection(db, "productos"), where("tiendaId", "==", idTienda));
            const snapshot = await getDocs(q);
            snapshot.forEach((doc) => todosLosProductos.push(doc.data()));
            console.log("Productos encontrados en Firebase:", todosLosProductos.length);
        } catch (e) { console.error("Error Firebase:", e); }
    }

    const filtrados = categoria === "Todos" 
        ? todosLosProductos 
        : todosLosProductos.filter(p => p.categoria && p.categoria.trim() === categoria.trim());

    contenedor.innerHTML = ""; 
    
    if (filtrados.length === 0) {
        contenedor.innerHTML = "<p>No hay productos en esta categoría (" + categoria + ").</p>";
        return;
    }

    filtrados.forEach((data, index) => {
        const div = document.createElement("div");
        div.className = "tarjeta-producto";
        div.innerHTML = `<h3>${data.nombre}</h3><p>$${data.precio}</p>`;
        contenedor.appendChild(div);
    });
}

window.filtrarProductos = (cat) => {
    const id = new URLSearchParams(window.location.search).get('id');
    mostrarTiendaPublica(id, cat);
};

document.addEventListener("DOMContentLoaded", () => {
    const id = new URLSearchParams(window.location.search).get('id');
    if (id) mostrarTiendaPublica(id, "Todos");
    
    // Conexión segura de botones
    document.querySelectorAll('.btn-filtro').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const cat = e.target.innerText;
            window.filtrarProductos(cat);
        });
    });
});