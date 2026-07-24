// ======================================
// VARIABLES
// ======================================

let clientes = [];
let equipos = [];


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

    new TomSelect("#cliente",{

        valueField:"clienteId",

        labelField:"nombre",

        searchField:["nombre","apellido","dni"],

        options:clientes,

        render:{

            option:function(item,escape){

                return `
                    <div>
                        <strong>${escape(item.apellido)}, ${escape(item.nombre)}</strong><br>
                        DNI: ${escape(item.dni)}
                    </div>
                `;

            },

            item:function(item,escape){

                return `${escape(item.apellido)}, ${escape(item.nombre)}`;

            }

        }

    });

}


// ======================================
// CARGAR EQUIPOS
// ======================================

async function cargarEquipos(){

    const respuesta = await fetch("/equipos/buscar");

    equipos = await respuesta.json();

    new TomSelect("#equipo",{

        valueField:"equipoId",

        labelField:"modelo",

        searchField:["marca","modelo","numeroSerie"],

        options:equipos,

        render:{

            option:function(item,escape){

                return `
                    <div>
                        <strong>${escape(item.marca)} ${escape(item.modelo)}</strong><br>
                        Serie: ${escape(item.numeroSerie)}
                    </div>
                `;

            },

            item:function(item,escape){

                return `${escape(item.marca)} ${escape(item.modelo)}`;

            }

        },

        onChange:function(value){

            const equipo = equipos.find(e => e.equipoId == value);

            if(!equipo) return;

            document.getElementById("tipoEquipo").value = equipo.tipoEquipo;
            document.getElementById("marca").value = equipo.marca;
            document.getElementById("modelo").value = equipo.modelo;
            document.getElementById("numeroSerie").value = equipo.numeroSerie;

        }

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


// ======================================
// INICIO
// ======================================

cargarClientes();

cargarEquipos();

cargarEstados();