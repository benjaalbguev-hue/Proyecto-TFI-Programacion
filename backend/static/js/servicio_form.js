// ======================================
// VARIABLES
// ======================================

let clientes = [];
let equipos = [];

const servicioId = document.getElementById("servicioId").value;


// ======================================
// FECHA ACTUAL
// ======================================

const fechaIngreso = document.getElementById("fechaIngreso");

const hoy = new Date();

fechaIngreso.value = hoy.toISOString().split("T")[0];



// ======================================
// CARGAR CLIENTES
// ======================================

async function cargarClientes(){

    const respuesta = await fetch("/clientes/buscar");

    clientes = await respuesta.json();

    const combo = document.getElementById("cliente");

   combo.innerHTML = `
    <option value="" disabled selected>Seleccione un cliente</option>
`;

    clientes.forEach(cliente => {

        combo.innerHTML += `
            <option value="${cliente.clienteId}">
                ${cliente.apellido}, ${cliente.nombre} - DNI: ${cliente.dni}
            </option>
        `;

    });

}


// ======================================
// CARGAR EQUIPOS
// ======================================

async function cargarEquipos(){

    const respuesta = await fetch("/equipos/buscar");

    equipos = await respuesta.json();

    const combo = document.getElementById("equipo");

  combo.innerHTML = `
    <option value="" disabled selected>Seleccione un equipo</option>
`;

    equipos.forEach(equipo => {

        combo.innerHTML += `
            <option value="${equipo.equipoId}">
                ${equipo.marca} ${equipo.modelo} - Serie: ${equipo.numeroSerie}
            </option>
        `;

    });

    combo.addEventListener("change", function(){

        const equipo = equipos.find(
            e => e.equipoId == this.value
        );

        if(!equipo) return;

        document.getElementById("tipoEquipo").value = equipo.tipoEquipo;

        document.getElementById("marca").value = equipo.marca;

        document.getElementById("modelo").value = equipo.modelo;

        document.getElementById("numeroSerie").value = equipo.numeroSerie;

    });

}

// ======================================
// CARGAR ESTADOS
// ======================================

async function cargarEstados(){

    const respuesta = await fetch("/estados");

    const estados = await respuesta.json();

    const combo = document.getElementById("estado");

    estados.forEach(estado=>{

        combo.innerHTML +=
        `
            <option value="${estado.estadoId}">
                ${estado.descripcion}
            </option>
        `;

    });

}

function convertirFechaParaInput(fecha){

    if(!fecha || fecha === "-"){
        return "";
    }

    if(fecha.includes("-")){
        return fecha.substring(0,10);
    }

    const partes = fecha.split("/");

    return `${partes[2]}-${partes[1]}-${partes[0]}`;
}

async function cargarServicio(){

    if(!servicioId){
        return;
    }

    try{

        const respuesta = await fetch(`/servicios/detalle/${servicioId}`);

        if(!respuesta.ok){
            throw new Error("No se pudo cargar el servicio");
        }

        const servicio = await respuesta.json();

        document.getElementById("cliente").value = servicio.clienteId;
        document.getElementById("equipo").value = servicio.equipoId;
        document.getElementById("estado").value = servicio.estadoId;

        document.getElementById("fechaIngreso").value =
            convertirFechaParaInput(servicio.fechaIngreso);

        document.getElementById("problema").value =
            servicio.problemaReportado || "";

        document.getElementById("diagnostico").value =
            servicio.diagnostico === "-" ? "" : servicio.diagnostico;

        document.getElementById("solucion").value =
            servicio.solucion === "-" ? "" : servicio.solucion;

        document.getElementById("total").value =
            servicio.total ?? 0;

        document.getElementById("fechaEntrega").value =
            servicio.fechaEntrega === "-"
                ? ""
                : convertirFechaParaInput(servicio.fechaEntrega);

        const equipoSeleccionado = equipos.find(
            equipo => equipo.equipoId == servicio.equipoId
        );

        if(equipoSeleccionado){

            document.getElementById("tipoEquipo").value =
                equipoSeleccionado.tipoEquipo || "";

            document.getElementById("marca").value =
                equipoSeleccionado.marca || "";

            document.getElementById("modelo").value =
                equipoSeleccionado.modelo || "";

            document.getElementById("numeroSerie").value =
                equipoSeleccionado.numeroSerie || "";
        }

    }catch(error){

        console.error(error);
        alert("Ocurrió un error al cargar el servicio.");

    }

}


// ======================================
// INICIO
// ======================================

async function iniciarFormulario(){

    await cargarClientes();

    await cargarEquipos();

    await cargarEstados();

    await cargarServicio();

}

iniciarFormulario();

// ======================================
// GUARDAR SERVICIO
// ======================================

const formulario = document.getElementById("formServicio");

formulario.addEventListener("submit", async function(e){

    e.preventDefault();

    const servicio = {

        clienteId: document.querySelector("#cliente").value,

        equipoId: document.querySelector("#equipo").value,

        estadoId: document.getElementById("estado").value,

        fechaIngreso: document.getElementById("fechaIngreso").value,

        problema: document.getElementById("problema").value.trim(),

        diagnostico: document.getElementById("diagnostico").value.trim(),

        solucion: document.getElementById("solucion").value.trim(),

        total: document.getElementById("total").value,

        fechaEntrega: document.getElementById("fechaEntrega").value || null
        

    };
    
    const url = servicioId
    ? `/servicios/actualizar/${servicioId}`
    : "/servicios/guardar"; 



    try{

        const respuesta = await fetch(url, {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(servicio)

        });


        const resultado = await respuesta.json();


        if(respuesta.ok){

            alert(resultado.mensaje);

            window.location.href = "/";

        }

        else{

            alert(resultado.mensaje);

        }

    }

    catch(error){

        console.error(error);

        alert("No fue posible conectar con el servidor.");

    }

}); 