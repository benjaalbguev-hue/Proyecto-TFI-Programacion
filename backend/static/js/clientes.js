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



// ======================================
// OBTENER CLIENTES DESDE FLASK
// ======================================

async function cargarClientes() {

    try {

        const respuesta = await fetch("/clientes");

        clientes = await respuesta.json();


        mostrarClientes(clientes);


    } catch (error) {

        console.error("Error cargando clientes:", error);

    }

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

                <td>${cliente.telefono}</td>

                <td>${cliente.direccion}</td>

                <td>${cliente.email}</td>


                <td>

                    <div class="actions">


                        <button
    class="btn-edit"
    onclick="window.location.href='/clientes/editar/${cliente.clienteid}'">

    <i class="fa-solid fa-pen"></i>

</button>


                        <button
    class="btn-history"
    onclick="window.location.href='/clientes/${cliente.clienteid}/historial'">

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

buscador.addEventListener("keyup", () => {


    const texto = buscador.value.toLowerCase();



    const resultado = clientes.filter(cliente =>


        cliente.dni.includes(texto) ||


        cliente.nombre.toLowerCase().includes(texto) ||


        cliente.apellido.toLowerCase().includes(texto) ||


        cliente.telefono.includes(texto) ||


        cliente.direccion.toLowerCase().includes(texto) ||


        cliente.email.toLowerCase().includes(texto)


    );



    mostrarClientes(resultado);



});




// ======================================
// CARGA INICIAL
// ======================================

cargarClientes();