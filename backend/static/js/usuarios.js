// ======================================
// VARIABLES
// ======================================

let usuarios = [];

const tabla = document.getElementById("tablaUsuarios");
const buscador = document.getElementById("buscarUsuario");
const cantidad = document.getElementById("cantidadUsuarios");
const cantidadMostrar = document.getElementById("cantidadMostrar");

let paginaActual = 1;
let registrosPorPagina = 10;


// ======================================
// CAMBIAR CANTIDAD A MOSTRAR
// ======================================

cantidadMostrar.addEventListener("change", function () {

    if (this.value === "todos") {
        registrosPorPagina = usuarios.length;
    } else {
        registrosPorPagina = parseInt(this.value);
    }

    paginaActual = 1;

    aplicarFiltro();

});


// ======================================
// CARGAR USUARIOS
// ======================================

async function cargarUsuarios() {

    const respuesta = await fetch("/usuarios/buscar");

    usuarios = await respuesta.json();

    if (cantidadMostrar.value === "todos") {
        registrosPorPagina = usuarios.length;
    }

    aplicarFiltro();

}


// ======================================
// MOSTRAR USUARIOS
// ======================================

function mostrarUsuarios(lista) {

    tabla.innerHTML = "";

    if (lista.length === 0) {

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

    const inicio = (paginaActual - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;

    const usuariosPagina = lista.slice(inicio, fin);

    usuariosPagina.forEach(usuario => {

        let claseRol = "rol-otro";

        if (usuario.rol === "Administrador") {
            claseRol = "rol-administrador";
        } else if (usuario.rol === "Empleado") {
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
        `Mostrando ${usuariosPagina.length} de ${lista.length} usuarios`;

}


// ======================================
// APLICAR FILTRO
// ======================================

function aplicarFiltro() {

    const texto = buscador.value.toLowerCase();

    const filtrados = usuarios.filter(usuario =>

        usuario.nombre.toLowerCase().includes(texto) ||
        usuario.apellido.toLowerCase().includes(texto) ||
        usuario.correo.toLowerCase().includes(texto)

    );

    mostrarUsuarios(filtrados);

}


// ======================================
// BUSCADOR
// ======================================

buscador.addEventListener("input", function () {

    paginaActual = 1;

    aplicarFiltro();

});


// ======================================
// EDITAR
// ======================================

function editarUsuario(id) {

    window.location.href = `/usuarios/editar/${id}`;

}


// ======================================
// INICIO
// ======================================

cargarUsuarios();