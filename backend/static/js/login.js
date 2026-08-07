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

            await Swal.fire({

                icon: "success",

                title: "Servicio Técnico",

                text: "Inicio de sesión correcto.",

                confirmButtonText: "Ingresar"

            });

            window.location.href = "/clientes";

        }
        else{

            Swal.fire({

                icon: "error",

                title: "Servicio Técnico",

                text:
                    resultado.mensaje ||
                    "No se pudo iniciar sesión.",

                confirmButtonText: "Aceptar"

            });

        }

    }
    catch(error){

        console.error(
            "Error al iniciar sesión:",
            error
        );

        Swal.fire({

            icon: "error",

            title: "Servicio Técnico",

            text:
                "Ocurrió un error al conectar con el servidor.",

            confirmButtonText: "Aceptar"

        });

    }

});


// ======================================
// RECUPERACIÓN DE CONTRASEÑA
// ======================================

document
    .getElementById("olvideContrasena")
    .addEventListener("click", function(e){

        e.preventDefault();

        Swal.fire({

            icon: "info",

            title: "Servicio Técnico",

            text:
                "Solicite al administrador del sistema el restablecimiento de su contraseña.",

            confirmButtonText: "Aceptar"

        });

    });