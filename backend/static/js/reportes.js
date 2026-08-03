// ======================================
// VARIABLES
// ======================================

let serviciosReporte = [];

let graficoEstados = null;
let graficoFacturacion = null;


// ======================================
// CARGAR DATOS
// ======================================

async function cargarReportes(){

    try{

        const respuesta = await fetch("/reportes/datos");

        if(!respuesta.ok){

            throw new Error("No se pudieron cargar los reportes");

        }

        serviciosReporte = await respuesta.json();

        cargarFiltroEstados();

        aplicarFiltros();

    }
    catch(error){

        console.error("Error al cargar reportes:", error);

    }

}


// ======================================
// CARGAR ESTADOS EN EL FILTRO
// ======================================

async function cargarFiltroEstados(){

    try{

        const respuesta = await fetch("/estados");

        const estados = await respuesta.json();

        const combo = document.getElementById("reporteEstado");

        combo.innerHTML = `
            <option value="">Todos</option>
        `;

        estados.forEach(estado => {

            combo.innerHTML += `
                <option value="${estado.descripcion}">
                    ${estado.descripcion}
                </option>
            `;

        });

    }
    catch(error){

        console.error("Error al cargar estados:", error);

    }

}


// ======================================
// CONVERTIR FECHA
// ======================================

function convertirFecha(fecha){

    if(!fecha){

        return "";

    }

    if(fecha.includes("-")){

        return fecha.substring(0,10);

    }

    if(fecha.includes("/")){

        const partes = fecha.split("/");

        return `${partes[2]}-${partes[1]}-${partes[0]}`;

    }

    return fecha;

}

function formatearFechaTexto(fecha){

    if(!fecha){
        return "";
    }

    const partes = fecha.split("-");

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function formatearFechaInput(fecha){

    const anio = fecha.getFullYear();

    const mes = String(fecha.getMonth() + 1).padStart(2, "0");

    const dia = String(fecha.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;

}


function actualizarTextoPeriodo(desde, hasta, estado){

    const texto = document.getElementById("textoPeriodo");

    if(!texto){

        return;

    }

    let descripcion = "Todos los servicios registrados";

    if(desde && hasta){

        descripcion =
            `Desde ${formatearFechaTexto(desde)} hasta ${formatearFechaTexto(hasta)}`;

    }
    else if(desde){

        descripcion =
            `Desde ${formatearFechaTexto(desde)}`;

    }
    else if(hasta){

        descripcion =
            `Hasta ${formatearFechaTexto(hasta)}`;

    }

    if(estado){

        descripcion += ` · Estado: ${estado}`;

    }

    texto.textContent = descripcion;

}

// ======================================
// APLICAR FILTROS
// ======================================

function aplicarFiltros(){

    const desde = document.getElementById("reporteDesde").value;

    const hasta = document.getElementById("reporteHasta").value;

    const estado = document.getElementById("reporteEstado").value;


    const resultados = serviciosReporte.filter(servicio => {

        const fechaServicio = convertirFecha(servicio.fechaIngreso);

        const coincideDesde =
            desde === "" ||
            fechaServicio >= desde;

        const coincideHasta =
            hasta === "" ||
            fechaServicio <= hasta;

        const coincideEstado =
            estado === "" ||
            servicio.estado === estado;

        return (
            coincideDesde &&
            coincideHasta &&
            coincideEstado
        );

    });

    actualizarTextoPeriodo(desde, hasta, estado);


    actualizarTarjetas(resultados);

    mostrarTabla(resultados);

    dibujarGraficoEstados(resultados);

    dibujarGraficoFacturacion(resultados);

}


// ======================================
// ACTUALIZAR TARJETAS
// ======================================

function actualizarTarjetas(lista){

    const totalServicios = lista.length;

    const ingresados = lista.filter(servicio =>
        servicio.estado.toLowerCase() === "ingresado"
    ).length;

    const reparacion = lista.filter(servicio =>
        servicio.estado.toLowerCase() === "en reparación"
    ).length;

    const finalizados = lista.filter(servicio =>
        servicio.estado.toLowerCase() === "finalizado"
    ).length;

    const totalFacturado = lista.reduce(
        (acumulador, servicio) =>
            acumulador + Number(servicio.total || 0),
        0
    );


    document.getElementById("totalServicios").textContent =
        totalServicios;

    document.getElementById("serviciosIngresados").textContent =
        ingresados;

    document.getElementById("serviciosReparacion").textContent =
        reparacion;

    document.getElementById("serviciosFinalizados").textContent =
        finalizados;

    document.getElementById("totalFacturado").textContent =
        `$${totalFacturado.toLocaleString("es-AR")}`;

}

function obtenerClaseEstado(estado){

    const estadoNormalizado = estado
        .toLowerCase()
        .trim();

    if(estadoNormalizado === "ingresado"){

        return "estado-ingresado";

    }

    if(estadoNormalizado === "en diagnóstico"){

        return "estado-diagnostico";

    }

    if(estadoNormalizado === "en reparación"){

        return "estado-reparacion";

    }

    if(estadoNormalizado === "finalizado"){

        return "estado-finalizado";

    }

    return "estado-otro";

}


// ======================================
// MOSTRAR TABLA
// ======================================

function mostrarTabla(lista){

    const tabla = document.getElementById("tablaReportes");

    tabla.innerHTML = "";

    if(lista.length === 0){

    tabla.innerHTML = `

        <tr>

            <td colspan="6" class="sin-resultados">

                <i class="fa-solid fa-magnifying-glass"></i>

                No se encontraron servicios con los filtros seleccionados.

            </td>

        </tr>

    `;

    document.getElementById("cantidadReportes").textContent =
        "Mostrando 0 servicios";

    return;

}

    lista.forEach(servicio => {

        tabla.innerHTML += `

            <tr>

                <td>${servicio.servicioId}</td>

                <td>${servicio.fechaIngreso}</td>

                <td>${servicio.cliente}</td>

                <td>${servicio.equipo}</td>

                <td>

                    <span class="reporte-estado ${obtenerClaseEstado(servicio.estado)}">

                        ${servicio.estado}

                    </span>
                </td>

                <td>
                    $${Number(servicio.total).toLocaleString("es-AR")}
                </td>

            </tr>

        `;

    });


    document.getElementById("cantidadReportes").textContent =

        lista.length === 1

            ? "Mostrando 1 servicio"

            : `Mostrando ${lista.length} servicios`;

}


// ======================================
// GRÁFICO POR ESTADO
// ======================================

function dibujarGraficoEstados(lista){

    const cantidades = {};

    lista.forEach(servicio => {

        cantidades[servicio.estado] =
            (cantidades[servicio.estado] || 0) + 1;

    });


    const etiquetas = Object.keys(cantidades);

    const valores = Object.values(cantidades);


    if(graficoEstados){

        graficoEstados.destroy();

    }


    graficoEstados = new Chart(

        document.getElementById("graficoEstados"),

        {

            type:"doughnut",

            data:{

                labels:etiquetas,

                datasets:[{

                    data:valores

                }]

            },

            options:{

                responsive:true,

                maintainAspectRatio:false

            }

        }

    );

}


// ======================================
// GRÁFICO FACTURACIÓN POR MES
// ======================================

function dibujarGraficoFacturacion(lista){

    const totalesPorMes = {};

    lista.forEach(servicio => {

        const fecha = convertirFecha(servicio.fechaIngreso);

        if(!fecha){

            return;

        }

        const mes = fecha.substring(0,7);

        totalesPorMes[mes] =
            (totalesPorMes[mes] || 0) +
            Number(servicio.total || 0);

    });


    const meses = Object.keys(totalesPorMes).sort();

    const nombresMeses = meses.map(mes => {

    const [anio, numeroMes] = mes.split("-");

    const fecha = new Date(
        Number(anio),
        Number(numeroMes) - 1,
        1
    );

    const nombreMes = fecha.toLocaleDateString(
        "es-AR",
        {
            month:"long",
            year:"numeric"
        }
    );

    return nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);

    });

    const valores = meses.map(
        mes => totalesPorMes[mes]
    );


    if(graficoFacturacion){

        graficoFacturacion.destroy();

    }


    graficoFacturacion = new Chart(

        document.getElementById("graficoFacturacion"),

        {

            type:"bar",

            data:{

                labels:nombresMeses,

                datasets:[{

                    label:"Facturación",

                    data:valores

                }]

            },

            options:{

                responsive:true,

                maintainAspectRatio:false

            }

        }

    );

}

// ======================================
// FILTRO RÁPIDO POR PERÍODO
// ======================================

function aplicarPeriodo(){

    const periodo = document.getElementById("reportePeriodo").value;

    const inputDesde = document.getElementById("reporteDesde");

    const inputHasta = document.getElementById("reporteHasta");

    const hoy = new Date();

    let desde = "";
    let hasta = "";


    if(periodo === "hoy"){

        desde = formatearFechaInput(hoy);

        hasta = formatearFechaInput(hoy);

    }


    else if(periodo === "semana"){

        const inicioSemana = new Date(hoy);

        const diaSemana = hoy.getDay();

        const diferenciaLunes =
            diaSemana === 0 ? -6 : 1 - diaSemana;

        inicioSemana.setDate(
            hoy.getDate() + diferenciaLunes
        );


        const finSemana = new Date(inicioSemana);

        finSemana.setDate(
            inicioSemana.getDate() + 6
        );


        desde = formatearFechaInput(inicioSemana);

        hasta = formatearFechaInput(finSemana);

    }


    else if(periodo === "mes"){

        const inicioMes = new Date(
            hoy.getFullYear(),
            hoy.getMonth(),
            1
        );

        const finMes = new Date(
            hoy.getFullYear(),
            hoy.getMonth() + 1,
            0
        );


        desde = formatearFechaInput(inicioMes);

        hasta = formatearFechaInput(finMes);

    }


    else if(periodo === "anio"){

        const inicioAnio = new Date(
            hoy.getFullYear(),
            0,
            1
        );

        const finAnio = new Date(
            hoy.getFullYear(),
            11,
            31
        );


        desde = formatearFechaInput(inicioAnio);

        hasta = formatearFechaInput(finAnio);

    }


    else if(periodo === "todos"){

        desde = "";

        hasta = "";

    }


    if(periodo !== "personalizado"){

        inputDesde.value = desde;

        inputHasta.value = hasta;

        aplicarFiltros();

    }

}

// ======================================
// FILTRO POR PERÍODO
// ======================================

function aplicarPeriodo(){

    const periodo = document.getElementById("reportePeriodo").value;

    const inputDesde = document.getElementById("reporteDesde");

    const inputHasta = document.getElementById("reporteHasta");

    const hoy = new Date();

    let desde = "";

    let hasta = "";


    if(periodo === "hoy"){

        desde = formatearFechaInput(hoy);

        hasta = formatearFechaInput(hoy);

    }

    else if(periodo === "semana"){

        const inicioSemana = new Date(hoy);

        const dia = hoy.getDay();

        const diferencia = dia === 0 ? -6 : 1 - dia;

        inicioSemana.setDate(hoy.getDate() + diferencia);

        const finSemana = new Date(inicioSemana);

        finSemana.setDate(inicioSemana.getDate() + 6);

        desde = formatearFechaInput(inicioSemana);

        hasta = formatearFechaInput(finSemana);

    }

    else if(periodo === "mes"){

        const inicioMes = new Date(
            hoy.getFullYear(),
            hoy.getMonth(),
            1
        );

        const finMes = new Date(
            hoy.getFullYear(),
            hoy.getMonth() + 1,
            0
        );

        desde = formatearFechaInput(inicioMes);

        hasta = formatearFechaInput(finMes);

    }

    else if(periodo === "anio"){

        const inicioAnio = new Date(
            hoy.getFullYear(),
            0,
            1
        );

        const finAnio = new Date(
            hoy.getFullYear(),
            11,
            31
        );

        desde = formatearFechaInput(inicioAnio);

        hasta = formatearFechaInput(finAnio);

    }

    else if(periodo === "todos"){

        desde = "";

        hasta = "";

    }

    if(periodo !== "personalizado"){

        inputDesde.value = desde;

        inputHasta.value = hasta;

        aplicarFiltros();

    }

}


// ======================================
// EVENTOS
// ======================================

document
    .getElementById("reportePeriodo")
    .addEventListener("change", aplicarPeriodo);

document
    .getElementById("reporteDesde")
    .addEventListener("change", aplicarFiltros);

document
    .getElementById("reporteHasta")
    .addEventListener("change", aplicarFiltros);

document
    .getElementById("reporteEstado")
    .addEventListener("change", aplicarFiltros);

document
    .getElementById("limpiarFiltros")
    .addEventListener("click", function(){

        document.getElementById("reportePeriodo").value = "todos";

        document.getElementById("reporteDesde").value = "";

        document.getElementById("reporteHasta").value = "";

        document.getElementById("reporteEstado").value = "";

        aplicarFiltros();

    });


    // ======================================
// EXPORTAR REPORTE
// ======================================

const botonExportar = document.getElementById("exportarPdf");

if(botonExportar){

    botonExportar.addEventListener("click", function(){

        window.print();

    });

}


// ======================================
// INICIO
// ======================================

cargarReportes();