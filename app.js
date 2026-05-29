import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, updateDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let idEnEdicion = null;

// --- FUNCIÓN PARA CARGAR EL CATÁLOGO ---
async function cargarCatalogo() {
    const contenedor = document.getElementById("contenedorCatalogo");
    if (!contenedor) return;

    try {
        const productosRef = collection(db, "productos");
        const q = query(productosRef, where("tiendaId", "==", "tienda-ejemplo"));
        const querySnapshot = await getDocs(q);
        
        contenedor.innerHTML = "";
        
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const div = document.createElement("div");
            div.style = "border: 2px solid #28a745; background-color: #e8f5e9; padding: 15px; margin: 15px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);";
            
            div.innerHTML = `
                <h3 style="color: #2e7d32; margin-top: 0;">${data.nombre}</h3>
                <img src="${data.imagen || ''}" style="max-width: 100px; display: block; margin-bottom: 10px;">
                <p style="font-size: 1.1em; font-weight: bold; color: #333;">Precio: $${data.precio}</p>
                <p style="color: #444;">Stock: ${data.stock || '0'}</p>
                <p style="color: #666; font-style: italic;">${data.descripcion || ''}</p>
                <button class="btn-editar" style="background-color: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; margin-right: 5px;">Editar</button>
                <button class="btn-eliminar" style="background-color: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">Eliminar</button>
            `;
            
            // Lógica de ELIMINAR
            div.querySelector(".btn-eliminar").addEventListener("click", async () => {
                if (confirm("¿Eliminar este producto?")) {
                    await deleteDoc(doc(db, "productos", docSnap.id));
                    cargarCatalogo();
                }
            });

            // Lógica de PREPARAR EDICIÓN
            div.querySelector(".btn-editar").addEventListener("click", () => {
                idEnEdicion = docSnap.id;
                document.getElementById("txtProdNombre").value = data.nombre;
                document.getElementById("txtProdImagen").value = data.imagen || "";
                document.getElementById("txtProdPrecio").value = data.precio;
                document.getElementById("txtProdStock").value = data.stock;
                document.getElementById("txtProdDesc").value = data.descripcion;
                document.getElementById("btnCargarProducto").innerText = "Actualizar Producto";
            });

            contenedor.appendChild(div);
        });
    } catch (e) { console.error("Error al cargar:", e); }
}

// --- FUNCIÓN PARA GUARDAR O ACTUALIZAR ---
document.getElementById("btnCargarProducto")?.addEventListener("click", async () => {
    const nombre = document.getElementById("txtProdNombre")?.value;
    const imagen = document.getElementById("txtProdImagen")?.value; // Nuevo campo capturado
    const precio = document.getElementById("txtProdPrecio")?.value;
    const stock = document.getElementById("txtProdStock")?.value;
    const desc = document.getElementById("txtProdDesc")?.value;
    
    if (!nombre || !precio) return alert("Completa nombre y precio");

    try {
        if (idEnEdicion) {
            // Actualizar
            await updateDoc(doc(db, "productos", idEnEdicion), { 
                nombre, imagen, precio, stock, descripcion: desc 
            });
            alert("Producto actualizado");
            idEnEdicion = null;
            document.getElementById("btnCargarProducto").innerText = "Subir Producto a la Tienda";
        } else {
            // Crear
            await addDoc(collection(db, "productos"), { 
                nombre, imagen, precio, stock, descripcion: desc, tiendaId: "tienda-ejemplo" 
            });
            alert("¡Guardado exitosamente!");
        }

        // Limpiar formulario
        document.getElementById("txtProdNombre").value = "";
        document.getElementById("txtProdImagen").value = "";
        document.getElementById("txtProdPrecio").value = "";
        document.getElementById("txtProdStock").value = "";
        document.getElementById("txtProdDesc").value = "";
        cargarCatalogo();
    } catch (e) { alert("Error: " + e.message); }
});

// Inicializar
cargarCatalogo();