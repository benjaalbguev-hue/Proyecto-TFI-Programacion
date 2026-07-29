/// ======================================
// FORMULARIO CLIENTE
// ======================================

const formulario = document.getElementById("formCliente");
const clienteId = formulario.dataset.id;

// ======================================
// VALIDACIONES
// ======================================

// DNI: solo números
document.getElementById("dni").addEventListener("input", function () {

    this.value = this.value.replace(/\D/g, "");

});

// Teléfono: solo números
document.getElementById("telefono").addEventListener("input", function () {

    this.value = this.value.replace(/\D/g, "");

});

// Nombre: solo letras
document.getElementById("nombre").addEventListener("input", function () {

    this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");

});


// Apellido: solo letras
document.getElementById("apellido").addEventListener("input", function () {

    this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");

});

["apellido", "nombre", "direccion"].forEach(id => {

    document.getElementById(id).addEventListener("input", function () {

        this.value = this.value
            .toLowerCase()
            .replace(/\b\w/g, letra => letra.toUpperCase());

    });

});


formulario.addEventListener("submit", async function (e) {

    e.preventDefault();

    const cliente = {

        dni: document.getElementById("dni").value.trim(),
        apellido: document.getElementById("apellido").value.trim(),
        nombre: document.getElementById("nombre").value.trim(),
        telefono: document.getElementById("telefono").value.trim(),
        direccion: document.getElementById("direccion").value.trim(),
        email: document.getElementById("email").value.trim()

    };

    try {

        let url = "/clientes/guardar";
        let metodo = "POST";

        if (clienteId) {

            url = `/clientes/actualizar/${clienteId}`;
            metodo = "PUT";

        }

        const respuesta = await fetch(url, {

            method: metodo,

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(cliente)

        });

       const resultado = await respuesta.json();

if (respuesta.ok) {

    alert(resultado.mensaje);

    window.location.href = "/";

} else {

    alert(resultado.mensaje);

}

    } catch (error) {

        console.error(error);
        alert("No fue posible conectar con el servidor.");

    }

});