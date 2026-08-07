// ======================================
// FORMULARIO USUARIO
// ======================================

const formulario = document.getElementById("formUsuario");

const usuarioId = formulario.dataset.id;


// ======================================
// VALIDACIONES
// ======================================

document.getElementById("nombre").addEventListener("input", function(){

    this.value = this.value.replace(
        /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g,
        ""
    );

});

document.getElementById("apellido").addEventListener("input", function(){

    this.value = this.value.replace(
        /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g,
        ""
    );

});

["apellido", "nombre"].forEach(id => {

    document.getElementById(id).addEventListener("input", function () {

        this.value = this.value
            .toLowerCase()
            .replace(/\b\w/g, letra => letra.toUpperCase());

    });

});


// ======================================
// GUARDAR O ACTUALIZAR USUARIO
// ======================================

formulario.addEventListener("submit", async function(e){

    e.preventDefault();

    const usuario = {

        apellido: document
            .getElementById("apellido")
            .value
            .trim(),

        nombre: document
            .getElementById("nombre")
            .value
            .trim(),

        correo: document
            .getElementById("correo")
            .value
            .trim(),

        contrasena: document
            .getElementById("contrasena")
            .value,

        rolId: document
            .getElementById("rol")
            .value

    };

    try{

        let url = "/usuarios/guardar";
        let metodo = "POST";

        if(usuarioId){

            url = `/usuarios/actualizar/${usuarioId}`;
            metodo = "PUT";

        }

        const respuesta = await fetch(url, {

            method: metodo,

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(usuario)

        });

        const resultado = await respuesta.json();

        if(respuesta.ok){

            await Swal.fire({
                icon: "success",
                title: "Servicio Técnico",
                text: resultado.mensaje,
                confirmButtonText: "Aceptar"
            });

            window.location.href = "/usuarios";

        }
        else{

            Swal.fire({
                icon: "error",
                title: "Servicio Técnico",
                text: resultado.mensaje,
                confirmButtonText: "Aceptar"
            });

        }

    }
    catch(error){

        console.error(error);

        Swal.fire({
            icon: "error",
            title: "Servicio Técnico",
            text: "No fue posible conectar con el servidor.",
            confirmButtonText: "Aceptar"
        });

    }

});


// ======================================
// RESTABLECER CONTRASEÑA
// ======================================

const botonRestablecer =
    document.getElementById("btnRestablecerContrasena");

if (botonRestablecer) {

    botonRestablecer.addEventListener("click", async function () {

        const resultado = await Swal.fire({
            icon: "warning",
            title: "Servicio Técnico",
            text: "¿Está seguro de que desea restablecer la contraseña de este usuario?",
            showCancelButton: true,
            confirmButtonText: "Sí, restablecer",
            cancelButtonText: "Cancelar"
        });

        if (!resultado.isConfirmed) {
            return;
        }

        const campoContrasena =
            document.getElementById("contrasena");

        campoContrasena.value = "";

        campoContrasena.focus();

        Swal.fire({
            icon: "info",
            title: "Servicio Técnico",
            text: "Ingrese la nueva contraseña y luego presione Guardar.",
            confirmButtonText: "Aceptar"
        });

    });

}