import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, updateDoc, doc, query, where, getDoc } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let idEnEdicion = null;
const params = new URLSearchParams(window.location.search);
const idTiendaActiva = params.get('id');

// --- 1. PROTECCIÓN DE ACCESO ---
window.verificarAcceso = async () => {
    if (!idTiendaActiva) return alert("Error: ID de tienda no definido.");
    
    const passIngresada = document.getElementById("inputPass").value;
    const snap = await getDoc(doc(db, "configuraciones", idTiendaActiva));

    if (snap.exists() && snap.data().password === passIngresada) {
        document.getElementById("panelAdmin").style.display = "block";
        document.getElementById("loginAdmin").style.display = "none";
        cargarCatalogo();
    } else {
        alert("Contraseña incorrecta");
    }
};

// --- 2. INTEGRACIÓN DE IA (GEMINI) ---
async function generarDescripcionIA() {
    const nombre = document.getElementById("txtProdNombre")?.value;
    const precio = document.getElementById("txtProdPrecio")?.value;
    
    if (!nombre) return alert("Primero escribe el nombre del producto para generar la descripción.");

    const btn = document.getElementById("btnGenerarIA");
    const originalText = btn.innerText;
    btn.innerText = "IA trabajando...";
    btn.disabled = true;

    try {
        // Aquí conectaremos con la API de Gemini próximamente.
        // Simulamos la respuesta profesional de la IA:
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simula tiempo de red
        const respuestaIA = `✨ Presentamos ${nombre}. La solución definitiva que combina calidad y precio ($${precio}). Perfecto para quienes buscan destacar. ¡No te quedes sin el tuyo!`;
        
        document.getElementById("txtProdDesc").value = respuestaIA;
    } catch (e) {
        alert("Error al contactar con la IA");
        console.error(e);
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}
document.getElementById("btnGenerarIA")?.addEventListener("click", generarDescripcionIA);

// --- 3. CARGA DE CATÁLOGO ---
async function cargarCatalogo() {
    const contenedor = document.getElementById("contenedorCatalogo");
    if (!contenedor) return;

    try {
        const q = query(collection(db, "productos"), where("tiendaId", "==", idTiendaActiva));
        const querySnapshot = await getDocs(q);
        
        contenedor.innerHTML = "";
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const div = document.createElement("div");
            div.className = "tarjeta-producto";
            div.innerHTML = `
                <h3>${data.nombre}</h3>
                <img src="${data.imagen || ''}" style="max-width: 100px;">
                <p><strong>Stock:</strong> ${data.stock || '0'}</p>
                <p><strong>Precio:</strong> $${data.precio}</p>
                <button class="btn-editar">Editar</button>
                <button class="btn-eliminar">Eliminar</button>
            `;
            
            div.querySelector(".btn-eliminar").addEventListener("click", async () => {
                if (confirm("¿Eliminar este producto?")) {
                    await deleteDoc(doc(db, "productos", docSnap.id));
                    cargarCatalogo();
                }
            });

            div.querySelector(".btn-editar").addEventListener("click", () => {
                idEnEdicion = docSnap.id;
                document.getElementById("txtProdNombre").value = data.nombre;
                document.getElementById("txtProdImagen").value = data.imagen || "";
                document.getElementById("txtProdPrecio").value = data.precio;
                document.getElementById("txtProdStock").value = data.stock;
                document.getElementById("txtProdDesc").value = data.descripcion || "";
                document.getElementById("txtProdCat").value = data.categoria || "General";
                document.getElementById("btnCargarProducto").innerText = "Actualizar Producto";
            });
            contenedor.appendChild(div);
        });
    } catch (e) { console.error("Error al cargar:", e); }
}

// --- 4. GUARDAR O ACTUALIZAR ---
document.getElementById("btnCargarProducto")?.addEventListener("click", async () => {
    const productoData = {
        nombre: document.getElementById("txtProdNombre")?.value,
        imagen: document.getElementById("txtProdImagen")?.value,
        precio: parseFloat(document.getElementById("txtProdPrecio")?.value),
        stock: document.getElementById("txtProdStock")?.value || 0,
        descripcion: document.getElementById("txtProdDesc")?.value,
        categoria: document.getElementById("txtProdCat")?.value,
        tiendaId: idTiendaActiva
    };
    
    if (!productoData.nombre || !productoData.precio) return alert("Completa nombre y precio");

    try {
        if (idEnEdicion) {
            await updateDoc(doc(db, "productos", idEnEdicion), productoData);
            alert("Producto actualizado");
            idEnEdicion = null;
            document.getElementById("btnCargarProducto").innerText = "Subir Producto";
        } else {
            await addDoc(collection(db, "productos"), productoData);
            alert("¡Guardado exitosamente!");