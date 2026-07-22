from flask import Flask, jsonify, render_template, request, redirect, url_for
from database import get_connection

app = Flask(__name__, template_folder="templates")


@app.route("/")
def inicio():
    return render_template("index.html")

@app.route("/clientes/nuevo")
def nuevo_cliente():
    return render_template("cliente_form.html")

@app.route("/clientes/editar/<int:id>")
def editar_cliente(id):

    conexion = get_connection()
    cursor = conexion.cursor()

    cursor.execute("""
        SELECT
            ClienteId,
            DNI,
            Apellido,
            Nombre,
            Telefono,
            Direccion,
            Email
        FROM CLIENTE
        WHERE ClienteId = ?
    """, (id,))

    fila = cursor.fetchone()

    conexion.close()

    if fila is None:
        return "Cliente no encontrado", 404

    cliente = {
        "clienteid": fila[0],
        "dni": fila[1],
        "apellido": fila[2],
        "nombre": fila[3],
        "telefono": fila[4],
        "direccion": fila[5],
        "email": fila[6]
    }

    return render_template(
        "cliente_form.html",
        cliente=cliente
    )

@app.route("/clientes/guardar", methods=["POST"])
def guardar_cliente():

    try:

        data = request.get_json()

        conexion = get_connection()
        cursor = conexion.cursor()

        # Verificar si ya existe un cliente con ese DNI
        cursor.execute("""
            SELECT COUNT(*)
            FROM CLIENTE
            WHERE DNI = ?
        """, (data["dni"],))

        existe = cursor.fetchone()[0]

        if existe > 0:

            conexion.close()

            return jsonify({
                "mensaje": "Ya existe un cliente registrado con ese DNI."
            }), 400

        cursor.execute("""
            INSERT INTO CLIENTE
            (
                DNI,
                Apellido,
                Nombre,
                Telefono,
                Direccion,
                Email
            )
            VALUES (?,?,?,?,?,?)
        """,
        (
            data["dni"],
            data["apellido"],
            data["nombre"],
            data["telefono"],
            data["direccion"],
            data["email"]
        ))

        conexion.commit()
        conexion.close()

        return jsonify({
            "mensaje": "Cliente guardado correctamente."
        })

    except Exception as e:

        print(e)

        return jsonify({
            "mensaje": str(e)
        }), 500

@app.route("/clientes/actualizar/<int:id>", methods=["PUT"])
def actualizar_cliente(id):

    try:

        data = request.get_json()

        conexion = get_connection()
        cursor = conexion.cursor()


        cursor.execute("""
            UPDATE CLIENTE
            SET
                DNI = ?,
                Apellido = ?,
                Nombre = ?,
                Telefono = ?,
                Direccion = ?,
                Email = ?
            WHERE ClienteId = ?
        """,
        (
            data["dni"],
            data["apellido"],
            data["nombre"],
            data["telefono"],
            data["direccion"],
            data["email"],
            id
        ))

        conexion.commit()
        conexion.close()

        return jsonify({
            "mensaje": "Cliente actualizado correctamente"
        })

    except Exception as e:

        print(e)

        return jsonify({
            "error": str(e)
        }), 500

@app.route("/clientes")
def clientes():

    conexion = get_connection()
    cursor = conexion.cursor()

    cursor.execute("""
        SELECT 
            clienteid,
            dni,
            apellido,
            nombre,
            telefono,
            direccion,
            email
        FROM CLIENTE
    """)

    clientes = []

    for fila in cursor.fetchall():
        cliente = {
            "clienteid": fila[0],
            "dni": fila[1],
            "apellido": fila[2],
            "nombre": fila[3],
            "telefono": fila[4],
            "direccion": fila[5],
            "email": fila[6]
        }

        clientes.append(cliente)

    conexion.close()

    return jsonify(clientes)


if __name__ == "__main__":
    app.run(debug=True)