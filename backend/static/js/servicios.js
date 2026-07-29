// ======================================
// VARIABLES
// ======================================

let servicios = [];


// ======================================
// CARGAR SERVICIOS
// ======================================

async function cargarServicios(){

    try{

        const respuesta = await fetch("/servicios/buscar");

        servicios = await respuesta.json();

        mostrarServicios(servicios);

    }
    catch(error){

        console.error("Error al cargar los servicios:", error);

    }

}


// ======================================
// MOSTRAR SERVICIOS
// ======================================

function mostrarServicios(lista){

    const tabla = document.getElementById("tablaServicios");

    tabla.innerHTML = "";

    lista.forEach(servicio => {

        let claseEstado = "";

        if(servicio.estado === "Finalizado"){

            claseEstado = "estado-finalizado";

        }
        else if(servicio.estado === "En proceso"){

            claseEstado = "estado-proceso";

        }
        else if(servicio.estado === "En reparación"){

            claseEstado = "estado-reparacion";

        }


        tabla.innerHTML += `

            <tr>

                <td>
                    ${servicio.servicioId}
                </td>

                <td>
                    ${servicio.cliente}
                </td>

                <td>
                    ${servicio.equipo}
                </td>

                <td>

                    <span class="estado ${claseEstado}">

                        ${servicio.estado}

                    </span>

                </td>

                <td>
                    ${servicio.fechaIngreso}
                </td>

                <td>
                    $${Number(servicio.total).toLocaleString("es-US")}
                </td>

                <td>

                    <div class="actions">

                        <button
                            class="btn-view"
                            onclick="verServicio(${servicio.servicioId})"
                            title="Ver servicio">

                            <i class="fa-solid fa-eye"></i>

                        </button>


                        <button
                            class="btn-edit-service"
                            onclick="editarServicio(${servicio.servicioId})"
                            title="Editar servicio">

                            <i class="fa-solid fa-pen"></i>

                        </button>

                    </div>

                </td>

            </tr>

        `;

    });


    actualizarCantidad(lista.length);

}


// ======================================
// ACTUALIZAR CANTIDAD
// ======================================

function actualizarCantidad(cantidad){

    const texto = document.getElementById("cantidadServicios");

    if(cantidad === 1){

        texto.textContent = "Mostrando 1 servicio";

    }
    else{

        texto.textContent = `Mostrando ${cantidad} servicios`;

    }

}

// ======================================
// CONVERTIR FECHA
// ======================================

function convertirFecha(fecha){

    if(!fecha){
        return "";
    }

    // Si ya viene en formato YYYY-MM-DD
    if(fecha.includes("-")){

        return fecha.substring(0,10);

    }

    // Si viene en formato DD/MM/YYYY
    if(fecha.includes("/")){

        const partes = fecha.split("/");

        return `${partes[2]}-${partes[1].padStart(2,"0")}-${partes[0].padStart(2,"0")}`;

    }

    return fecha;

}


// ======================================
// FILTRAR SERVICIOS
// ======================================

function aplicarFiltros(){

    const texto = document
        .getElementById("buscarServicio")
        .value
        .toLowerCase()
        .trim();

    const estadoSeleccionado = document
        .getElementById("filtroEstado")
        .value;

    const fechaDesde = document
        .getElementById("fechaDesde")
        .value;

    const fechaHasta = document
        .getElementById("fechaHasta")
        .value;


    const resultados = servicios.filter(servicio => {


        // ==============================
        // BUSCADOR
        // ==============================

        const coincideBusqueda =

            servicio.cliente
                .toLowerCase()
                .includes(texto)

            ||

            servicio.equipo
                .toLowerCase()
                .includes(texto)

            ||

            servicio.estado
                .toLowerCase()
                .includes(texto)

            ||

            servicio.servicioId
                .toString()
                .includes(texto);


        // ==============================
        // ESTADO
        // ==============================

        const coincideEstado =

            estadoSeleccionado === "" ||

            servicio.estado === estadoSeleccionado;


        // ==============================
        // FECHA DESDE
        // ==============================

       const fechaServicio = convertirFecha(servicio.fechaIngreso);

const coincideFechaDesde =

    fechaDesde === "" ||

    fechaServicio >= fechaDesde;
        // ==============================
        // FECHA HASTA
        // ==============================

       const coincideFechaHasta =

    fechaHasta === "" ||

    fechaServicio <= fechaHasta;

        // ==============================
        // TODOS LOS FILTROS
        // ==============================

        return (

            coincideBusqueda &&

            coincideEstado &&

            coincideFechaDesde &&

            coincideFechaHasta

        );

    });


    mostrarServicios(resultados);

}


// ======================================
// BUSCADOR
// ======================================

const buscador = document.getElementById("buscarServicio");

if(buscador){

    buscador.addEventListener(

        "input",

        aplicarFiltros

    );

}


// ======================================
// FILTRO ESTADO
// ======================================

const filtroEstado = document.getElementById("filtroEstado");

if(filtroEstado){

    filtroEstado.addEventListener(

        "change",

        aplicarFiltros

    );

}


// ======================================
// FILTRO FECHA DESDE
// ======================================

const fechaDesdeInput = document.getElementById("fechaDesde");

if(fechaDesdeInput){

    fechaDesdeInput.addEventListener(

        "change",

        aplicarFiltros

    );

}


// ======================================
// FILTRO FECHA HASTA
// ======================================

const fechaHastaInput = document.getElementById("fechaHasta");

if(fechaHastaInput){

    fechaHastaInput.addEventListener(

        "change",

        aplicarFiltros

    );

}

// ======================================
// VER SERVICIO
// ======================================

 async function verServicio(id){

    try{

        const respuesta = await fetch(`/servicios/detalle/${id}`);

        if(!respuesta.ok){
            throw new Error("No se pudo obtener el servicio");
        }

        const servicio = await respuesta.json();

        document.getElementById("detalleCliente").textContent =
            `${servicio.cliente} - DNI: ${servicio.dni}`;

        document.getElementById("detalleEquipo").textContent =
            `${servicio.tipoEquipo} - ${servicio.marca} ${servicio.modelo} - Serie: ${servicio.numeroSerie}`;

        document.getElementById("detalleEstado").textContent =
            servicio.estado;

        document.getElementById("detalleIngreso").textContent =
            servicio.fechaIngreso;

        document.getElementById("detalleProblema").textContent =
            servicio.problemaReportado;

        document.getElementById("detalleDiagnostico").textContent =
            servicio.diagnostico;

        document.getElementById("detalleSolucion").textContent =
            servicio.solucion;

        document.getElementById("detalleTotal").textContent =
            `$${servicio.total.toLocaleString("es-AR")}`;

        document.getElementById("detalleEntrega").textContent =
            servicio.fechaEntrega;

        document.getElementById("modalServicio").style.display = "flex";

    }catch(error){

        console.error(error);
        alert("Ocurrió un error al cargar el detalle del servicio.");

    }

}


// ======================================
// EDITAR SERVICIO
// ======================================

function editarServicio(id){

    window.location.href = `/servicios/editar/${id}`;

}


// ======================================
// CARGAR ESTADOS
// ======================================

async function cargarEstados(){

    try{

        const respuesta = await fetch("/estados");

        const estados = await respuesta.json();

        const filtro = document.getElementById("filtroEstado");

        estados.forEach(estado => {

            filtro.innerHTML += `
                <option value="${estado.descripcion}">
                    ${estado.descripcion}
                </option>
            `;

        });

    }
    catch(error){

        console.error("Error al cargar los estados:", error);

    }

}


// ======================================
// INICIO
// ======================================

cargarEstados();

cargarServicios();

const modalServicio = document.getElementById("modalServicio");
const cerrarModal = document.getElementById("cerrarModal");

cerrarModal.addEventListener("click", function(){

    modalServicio.style.display = "none";

});

modalServicio.addEventListener("click", function(event){

    if(event.target === modalServicio){

        modalServicio.style.display = "none";

    }

});