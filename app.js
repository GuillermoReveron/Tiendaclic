import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("Panel Admin cargado con éxito");
// ... aquí sigue toda tu lógica existente de carga de productos (btnCargarProducto, etc.) ...
let idEnEdicion = null; // Variable para saber si estamos editando

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
            div.style = "border: 2px solid #28a745; background-color: #e8f5e9; padding: 15px; margin: 15px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); position: relative;";
            
            div.innerHTML = `
                <h3 style="color: #2e7d32; margin-top: 0;">${data.nombre}</h3>
                <p style="font-size: 1.1em; font-weight: bold; color: #333;">Precio: $${data.precio}</p>
                <p style="color: #444;">Stock: ${data.stock || '0'}</p>
                <p style="color: #666; font-style: italic;">${data.descripcion || ''}</p>
                <button class="btn-editar" data-id="${docSnap.id}" data-nombre="${data.nombre}" data-precio="${data.precio}" data-stock="${data.stock}" data-desc="${data.descripcion}" style="background-color: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; margin-right: 5px;">Editar</button>
                <button class="btn-eliminar" data-id="${docSnap.id}" style="background-color: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">Eliminar</button>
            `;
            contenedor.appendChild(div);
        });

        // Eventos de Eliminar
        document.querySelectorAll(".btn-eliminar").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = e.target.getAttribute("data-id");
                if (confirm("¿Seguro que quieres eliminar este producto?")) {
                    await deleteDoc(doc(db, "productos", id));
                    cargarCatalogo();
                }
            });
        });

        // Eventos de Editar
        document.querySelectorAll(".btn-editar").forEach(btn => {
            btn.addEventListener("click", (e) => {
                idEnEdicion = e.target.getAttribute("data-id");
                document.getElementById("txtProdNombre").value = e.target.getAttribute("data-nombre");
                document.getElementById("txtProdPrecio").value = e.target.getAttribute("data-precio");
                document.getElementById("txtProdStock").value = e.target.getAttribute("data-stock");
                document.getElementById("txtProdDesc").value = e.target.getAttribute("data-desc");
                document.getElementById("btnCargarProducto").innerText = "Actualizar Producto";
            });
        });

    } catch (e) { console.error(e); }
}

document.getElementById("btnCargarProducto")?.addEventListener("click", async () => {
    const nombre = document.getElementById("txtProdNombre")?.value;
    const precio = document.getElementById("txtProdPrecio")?.value;
    const stock = document.getElementById("txtProdStock")?.value;
    const desc = document.getElementById("txtProdDesc")?.value;
    
    if (!nombre || !precio) return alert("Completa nombre y precio");

    try {
        if (idEnEdicion) {
            // Actualizar
            await updateDoc(doc(db, "productos", idEnEdicion), { nombre, precio, stock, descripcion: desc });
            alert("Producto actualizado");
            idEnEdicion = null;
            document.getElementById("btnCargarProducto").innerText = "Subir Producto a la Tienda";
        } else {
            // Crear
            await addDoc(collection(db, "productos"), { nombre, precio, stock, descripcion: desc, tiendaId: "tienda-ejemplo" });
            alert("¡Guardado exitosamente!");
        }

        document.getElementById("txtProdNombre").value = "";
        document.getElementById("txtProdPrecio").value = "";
        document.getElementById("txtProdStock").value = "";
        document.getElementById("txtProdDesc").value = "";
        cargarCatalogo();
    } catch (e) { alert("Error: " + e.message); }
});

cargarCatalogo();