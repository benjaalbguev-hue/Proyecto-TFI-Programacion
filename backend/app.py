from flask import Flask, jsonify, render_template, request, redirect, url_for
from database import get_connection

app = Flask(__name__, template_folder="templates")


@app.route("/")
def inicio():
    return render_template("index.html")

@app.route("/clientes/nuevo")
def nuevo_cliente():
    return render_template("cliente_form.html")

@app.route("/servicios/nuevo")
def nuevo_servicio():
    return render_template("servicio_form.html")

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

@app.route("/equipos/nuevo")
def nuevo_equipo():

    return render_template("equipo_form.html")

@app.route("/equipos")
def equipos():

    return redirect(url_for("nuevo_equipo"))

@app.route("/equipos/guardar", methods=["POST"])
def guardar_equipo():

    try:

        data = request.get_json()

        conexion = get_connection()
        cursor = conexion.cursor()

        # Verificar si ya existe el número de serie
        cursor.execute("""
            SELECT COUNT(*)
            FROM EQUIPO
            WHERE NumeroSerie = ?
        """,
        (data["numeroSerie"],))

        existe = cursor.fetchone()[0]

        if existe > 0:

            conexion.close()

            return jsonify({
                "mensaje": "Ya existe un equipo registrado con ese número de serie."
            }), 400

        cursor.execute("""
            INSERT INTO EQUIPO
            (
                TipoEquipo,
                Marca,
                Modelo,
                NumeroSerie
            )
            VALUES (?,?,?,?)
        """,
        (
            data["tipoEquipo"],
            data["marca"],
            data["modelo"],
            data["numeroSerie"]
        ))

        conexion.commit()
        conexion.close()

        return jsonify({
            "mensaje": "Equipo guardado correctamente."
        })

    except Exception as e:

        print(e)

        return jsonify({
            "mensaje": str(e)
        }), 500

@app.route("/clientes/buscar")
def buscar_clientes():

    conexion = get_connection()
    cursor = conexion.cursor()

    cursor.execute("""
        SELECT
            ClienteId,
            Apellido,
            Nombre,
            DNI
        FROM CLIENTE
        ORDER BY Apellido, Nombre
    """)

    clientes = []

    for fila in cursor.fetchall():

        clientes.append({

            "clienteId": fila[0],
            "apellido": fila[1],
            "nombre": fila[2],
            "dni": fila[3]

        })

    conexion.close()

    return jsonify(clientes)

@app.route("/equipos/buscar")
def buscar_equipos():

    conexion = get_connection()
    cursor = conexion.cursor()

    cursor.execute("""
        SELECT
            EquipoId,
            TipoEquipo,
            Marca,
            Modelo,
            NumeroSerie
        FROM EQUIPO
        ORDER BY Marca, Modelo
    """)

    equipos = []

    for fila in cursor.fetchall():

        equipos.append({

            "equipoId": fila[0],
            "tipoEquipo": fila[1],
            "marca": fila[2],
            "modelo": fila[3],
            "numeroSerie": fila[4]

        })

    conexion.close()

    return jsonify(equipos)


@app.route("/estados")
def obtener_estados():

    conexion = get_connection()
    cursor = conexion.cursor()

    cursor.execute("""
        SELECT
            EstadoId,
            Descripcion
        FROM ESTADO
        ORDER BY EstadoId
    """)

    estados = []

    for fila in cursor.fetchall():

        estados.append({

            "estadoId": fila[0],
            "descripcion": fila[1]

        })

    conexion.close()

    return jsonify(estados)



if __name__ == "__main__":
    app.run(debug=True)