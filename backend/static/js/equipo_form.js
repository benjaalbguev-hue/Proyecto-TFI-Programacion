// ======================================
// FORMULARIO EQUIPOS
// ======================================

const formulario = document.getElementById("formEquipo");


// ======================================
// NÚMERO DE SERIE EN MAYÚSCULAS
// ======================================

document.getElementById("numeroSerie").addEventListener("input", function () {

    this.value = this.value.toUpperCase();

});


// ======================================
// GUARDAR EQUIPO
// ======================================

formulario.addEventListener("submit", async function (e) {

    e.preventDefault();

    const equipo = {

        tipoEquipo: document.getElementById("tipoEquipo").value.trim(),

        marca: document.getElementById("marca").value.trim(),

        modelo: document.getElementById("modelo").value.trim(),

        numeroSerie: document.getElementById("numeroSerie").value.trim().toUpperCase()

    };

    try {

        const respuesta = await fetch("/equipos/guardar", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(equipo)

        });

        const resultado = await respuesta.json();

        if (respuesta.ok) {

            await Swal.fire({
                icon: "success",
                title: "Servicio Técnico",
                text: resultado.mensaje,
                confirmButtonText: "Aceptar"
            });

            window.location.href = "/equipos";

        }

        else {

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