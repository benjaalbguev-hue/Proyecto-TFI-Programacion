// ======================================
// VARIABLE GLOBAL
// ======================================

let clientes = [];


// ======================================
// ELEMENTOS HTML
// ======================================

const tabla = document.getElementById("tablaClientes");
const buscador = document.getElementById("buscar");
const cantidad = document.getElementById("cantidadClientes");
const selectorCantidad = document.getElementById("cantidadMostrar");


// ======================================
// OBTENER CLIENTES DESDE FLASK
// ======================================

async function cargarClientes() {

    try {

        const respuesta = await fetch("/api/clientes");

        clientes = await respuesta.json();

        aplicarFiltros();

    } catch (error) {

        console.error("Error cargando clientes:", error);

        Swal.fire({
            icon: "error",
            title: "Servicio Técnico",
            text: "No fue posible cargar los clientes.",
            confirmButtonText: "Aceptar"
        });

    }

}


// ======================================
// APLICAR BUSCADOR + FILTRO
// ======================================

function aplicarFiltros() {

    const texto = buscador.value.toLowerCase();

    let resultado = clientes.filter(cliente =>

        cliente.dni.includes(texto) ||

        cliente.nombre.toLowerCase().includes(texto) ||

        cliente.apellido.toLowerCase().includes(texto) ||

        (cliente.telefono || "").includes(texto) ||

        (cliente.direccion || "").toLowerCase().includes(texto) ||

        (cliente.email || "").toLowerCase().includes(texto)

    );

    const limite = selectorCantidad.value;

    if (limite !== "todos") {

        resultado = resultado.slice(0, Number(limite));

    }

    mostrarClientes(resultado);

}


// ======================================
// MOSTRAR CLIENTES
// ======================================

function mostrarClientes(lista) {

    tabla.innerHTML = "";

    lista.forEach(cliente => {

        tabla.innerHTML += `

            <tr>

                <td>${cliente.dni}</td>

                <td>${cliente.apellido}</td>

                <td>${cliente.nombre}</td>

                <td>${cliente.telefono ?? ""}</td>

                <td>${cliente.direccion ?? ""}</td>

                <td>${cliente.email ?? ""}</td>

                <td>

                    <div class="actions">

                        <button
                            class="btn-edit"
                            onclick="window.location.href='/clientes/editar/${cliente.clienteid}'">

                            <i class="fa-solid fa-pen"></i>

                        </button>

                        <button
                            class="btn-history"
                            onclick="verHistorial(${cliente.clienteid})">

                            <i class="fa-solid fa-clock-rotate-left"></i>

                        </button>

                    </div>

                </td>

            </tr>

        `;

    });

    cantidad.textContent = `Mostrando ${lista.length} clientes`;

}


// ======================================
// BUSCADOR
// ======================================

buscador.addEventListener("keyup", aplicarFiltros);


// ======================================
// FILTRO DE CANTIDAD
// ======================================

selectorCantidad.addEventListener("change", aplicarFiltros);


// ======================================
// CARGA INICIAL
// ======================================

cargarClientes();


// ======================================
// MODAL HISTORIAL DE SERVICIOS
// ======================================

const modal = document.getElementById("modalHistorial");
const tablaHistorial = document.getElementById("tablaHistorial");
const cerrarModal = document.getElementById("cerrarModal");


cerrarModal.addEventListener("click", () => {

    modal.style.display = "none";

});


window.addEventListener("click", (e) => {

    if (e.target === modal) {

        modal.style.display = "none";

    }

});


async function verHistorial(clienteId) {

    console.log(modal);

    if (modal == null) {

        Swal.fire({
            icon: "error",
            title: "Servicio Técnico",
            text: "No fue posible abrir el historial de servicios.",
            confirmButtonText: "Aceptar"
        });

        return;

    }

    modal.style.display = "flex";

}