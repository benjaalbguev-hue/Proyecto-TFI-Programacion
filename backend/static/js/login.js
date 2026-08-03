// ======================================
// ELEMENTOS
// ======================================

const formulario = document.getElementById("formLogin");


// ======================================
// LOGIN
// ======================================

formulario.addEventListener("submit", async function (e) {

    e.preventDefault();

    const correo = document.getElementById("correo").value.trim();
    const contrasena = document.getElementById("contrasena").value;

    const respuesta = await fetch("/login", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            correo,
            contrasena

        })

    });

    const resultado = await respuesta.json();

    if (resultado.ok) {

        window.location.href = "/clientes";

    } else {

        alert(resultado.mensaje);

    }

});