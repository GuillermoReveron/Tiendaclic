// publico.js - Versión Completa
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { firebaseConfig } from "./config.js";

// Inicialización
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Función principal de carga
async function mostrarTiendaPublica(idTienda) {
    const contenedor = document.getElementById("contenedorCatalogoPublico");
    
    // Verificación de seguridad: si no existe el contenedor, no ejecutamos nada
    if (!contenedor) {
        console.warn("El contenedor 'contenedorCatalogoPublico' no existe en este HTML.");
        return;
    }

    try {
        // Consulta filtrada por tiendaId
        const q = query(collection(db, "productos"), where("tiendaId", "==", idTienda));
        const querySnapshot = await getDocs(q);
        
        contenedor.innerHTML = ""; // Limpiamos antes de cargar
        
        // Verificación de existencia de datos
        if (querySnapshot.empty) {
            contenedor.innerHTML = "<p>No hay productos disponibles en esta tienda.</p>";
            return;
        }
        
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            // Inyectamos el HTML usando las clases de tu CSS
            contenedor.innerHTML += `
                <div class="tarjeta-producto">
                    <h3>${data.nombre}</h3>
                    <p class="precio">$${data.precio}</p>
                    <p class="desc">${data.descripcion || ''}</p>
                    <button class="btn-verde">Comprar</button>
                </div>`;
        });
    } catch (e) {
        console.error("Error crítico al cargar la vidriera:", e);
    }
}

// Ejecución
mostrarTiendaPublica("tienda-ejemplo");