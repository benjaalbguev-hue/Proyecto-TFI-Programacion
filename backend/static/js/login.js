// ======================================
// ELEMENTOS
// ======================================

const formulario = document.getElementById("formLogin");


// ======================================
// LOGIN
// ======================================

formulario.addEventListener("submit", async function(e){

    e.preventDefault();

    const correo =
        document.getElementById("correo").value.trim();

    const contrasena =
        document.getElementById("contrasena").value;

    try{

        const respuesta = await fetch("/login", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                correo: correo,

                contrasena: contrasena

            })

        });

        const resultado = await respuesta.json();

        console.log("Respuesta del login:", resultado);

        if(respuesta.ok && resultado.ok){

            window.location.href = "/clientes";

        }
        else{

            alert(resultado.mensaje || "No se pudo iniciar sesión.");

        }

    }
    catch(error){

        console.error("Error al iniciar sesión:", error);

        alert("Ocurrió un error al conectar con el servidor.");

    }

});