import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("Vidriera pública cargada con éxito");
// ... aquí sigue toda tu lógica para mostrar el catálogo (contenedorCatalogoPublico, etc.) ...

// Esta función carga productos solo de la tienda que le digas
async function mostrarTiendaPublica(idTienda) {
    const contenedor = document.getElementById("contenedorCatalogoPublico");
    if (!contenedor) return;

    try {
        const q = query(collection(db, "productos"), where("tiendaId", "==", idTienda));
        const querySnapshot = await getDocs(q);
        
        contenedor.innerHTML = "";
        
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            contenedor.innerHTML += `
                <div style="border: 1px solid #ccc; padding: 20px; margin: 10px; border-radius: 10px; text-align: center; font-family: sans-serif;">
                    <h3>${data.nombre}</h3>
                    <p style="font-size: 1.2em; color: #28a745; font-weight: bold;">$${data.precio}</p>
                    <p style="color: #666;">${data.descripcion || ''}</p>
                    <button style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Comprar</button>
                </div>`;
        });
    } catch (e) {
        console.error("Error al cargar la vidriera:", e);
    }
}

// Para usarla en tu HTML, solo llamas a: mostrarTiendaPublica("tienda-ejemplo");
// Puedes poner esto al final de tu archivo o llamarlo desde el HTML
mostrarTiendaPublica("tienda-ejemplo");