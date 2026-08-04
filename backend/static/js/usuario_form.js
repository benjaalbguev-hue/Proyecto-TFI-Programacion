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

            alert(resultado.mensaje);

            window.location.href = "/usuarios";

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
// ======================================
// GUARDAR USUARIO
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

        const respuesta = await fetch("/usuarios/guardar", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(usuario)

        });

        const resultado = await respuesta.json();

        if(respuesta.ok){

            alert(resultado.mensaje);

            window.location.href = "/usuarios";

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