// ======================================
// VARIABLES
// ======================================

let usuarios = [];

const tabla = document.getElementById("tablaUsuarios");

const buscador = document.getElementById("buscarUsuario");

const cantidad = document.getElementById("cantidadUsuarios");


// ======================================
// CARGAR USUARIOS
// ======================================

async function cargarUsuarios(){

    const respuesta = await fetch("/usuarios/buscar");

    usuarios = await respuesta.json();

    mostrarUsuarios(usuarios);

}


// ======================================
// MOSTRAR USUARIOS
// ======================================

function mostrarUsuarios(lista){

    tabla.innerHTML = "";

    if(lista.length === 0){

        tabla.innerHTML = `
            <tr>
                <td colspan="6" class="sin-usuarios">

                    <i class="fa-solid fa-user-slash"></i>

                    No se encontraron usuarios.

                </td>
            </tr>
        `;

        cantidad.textContent = "Mostrando 0 usuarios";

        return;

    }

    lista.forEach(usuario=>{

        let claseRol = "rol-otro";

        if(usuario.rol === "Administrador"){

            claseRol = "rol-administrador";

        }

        else if(usuario.rol === "Empleado"){

            claseRol = "rol-empleado";

        }

        tabla.innerHTML += `

            <tr>

                <td>${usuario.usuarioId}</td>

                <td>${usuario.apellido}</td>

                <td>${usuario.nombre}</td>

                <td>${usuario.correo}</td>

                <td>

                    <span class="usuario-rol ${claseRol}">

                        ${usuario.rol}

                    </span>

                </td>

                <td>

                    <button
                        class="btn-edit-user"
                        onclick="editarUsuario(${usuario.usuarioId})">

                        <i class="fa-solid fa-pen"></i>

                    </button>

                </td>

            </tr>

        `;

    });

    cantidad.textContent =
        `Mostrando ${lista.length} usuarios`;

}


// ======================================
// BUSCADOR
// ======================================

buscador.addEventListener("input", function(){

    const texto = this.value.toLowerCase();

    const filtrados = usuarios.filter(usuario=>{

        return(

            usuario.nombre.toLowerCase().includes(texto)

            ||

            usuario.apellido.toLowerCase().includes(texto)

            ||

            usuario.correo.toLowerCase().includes(texto)

        );

    });

    mostrarUsuarios(filtrados);

});


// ======================================
// EDITAR
// ======================================

function editarUsuario(id){

    window.location.href =
        `/usuarios/editar/${id}`;

}


// ======================================
// INICIO
// ======================================

cargarUsuarios();