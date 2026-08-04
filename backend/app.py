from flask import Flask, jsonify, render_template, request, redirect, url_for, session
from database import get_connection

app = Flask(__name__, template_folder="templates")
app.secret_key = "servicio_tecnico_clave_secreta"

from functools import wraps


def login_required(func):

    @wraps(func)
    def wrapper(*args, **kwargs):

        if "usuario_id" not in session:

            return redirect("/login")

        return func(*args, **kwargs)

    return wrapper

def rol_required(rol):

    def decorator(func):

        @wraps(func)
        def wrapper(*args, **kwargs):

            if "usuario_id" not in session:

                return redirect("/login")


            if session.get("rol_id") != rol:

                return redirect("/clientes")


            return func(*args, **kwargs)


        return wrapper

    return decorator


@app.route("/")
def inicio():

    if "usuario_id" in session:

        return redirect(url_for("clientes"))

    return redirect(url_for("login"))

@app.route("/clientes/nuevo")
@login_required
def nuevo_cliente():
    return render_template("cliente_form.html")

@app.route("/servicios/nuevo")
@login_required
def nuevo_servicio():
    return render_template("servicio_form.html")

@app.route("/servicios")
@login_required
def listar_servicios():
    return render_template("servicios.html")

@app.route("/clientes")
@login_required
def clientes():

    print(session)

    return render_template("index.html")

@app.route("/login")
def login():
    return render_template("login.html")

@app.route("/logout")
def logout():

    session.clear()

    return redirect("/login")

@app.route("/login", methods=["POST"])
def validar_login():

    datos = request.get_json()

    correo = datos["correo"]
    contrasena = datos["contrasena"]

    conexion = get_connection()
    cursor = conexion.cursor()

    cursor.execute("""
        SELECT
            UsuarioId,
            Nombre,
            Apellido,
            RolId
        FROM USUARIO
        WHERE Correo = ?
        AND Contrasena = ?
    """, (correo, contrasena))

    usuario = cursor.fetchone()

    conexion.close()

    if usuario:

        session["usuario_id"] = usuario[0]
        session["nombre"] = usuario[1]
        session["apellido"] = usuario[2]
        session["rol_id"] = usuario[3]

        return jsonify({
            "ok": True
        })

    return jsonify({
        "ok": False,
        "mensaje": "Correo o contraseña incorrectos."
    })

    
@app.route("/usuarios")
@login_required
@rol_required(1)
def usuarios():

    return render_template("usuarios.html")


@app.route("/usuarios/buscar")
@login_required
@rol_required(1)
def buscar_usuarios():

    conexion = get_connection()
    cursor = conexion.cursor()

    cursor.execute("""
        SELECT
            u.UsuarioId,
            u.Apellido,
            u.Nombre,
            u.Correo,
            r.Descripcion
        FROM USUARIO u
        INNER JOIN ROL r
            ON u.RolId = r.RolId
        ORDER BY u.Apellido, u.Nombre
    """)

    usuarios = []

    for fila in cursor.fetchall():

        usuarios.append({
            "usuarioId": fila[0],
            "apellido": fila[1],
            "nombre": fila[2],
            "correo": fila[3],
            "rol": fila[4]
        })

    conexion.close()

    return jsonify(usuarios)


@app.route("/usuarios/nuevo")
@login_required
@rol_required(1)
def nuevo_usuario():

    return render_template("usuario_form.html")

@app.route("/usuarios/guardar", methods=["POST"])
@login_required
@rol_required(1)
def guardar_usuario():

    try:

        data = request.get_json()

        conexion = get_connection()
        cursor = conexion.cursor()

        cursor.execute("""
            INSERT INTO USUARIO
            (
                Correo,
                Apellido,
                Nombre,
                Contrasena,
                RolId
            )
            VALUES (?,?,?,?,?)
        """,
        (
            data["correo"],
            data["apellido"],
            data["nombre"],
            data["contrasena"],
            data["rolId"]
        ))

        conexion.commit()
        conexion.close()

        return jsonify({
            "mensaje": "Usuario guardado correctamente."
        })

    except Exception as e:

        print(e)

        return jsonify({
            "mensaje": str(e)
        }), 500


@app.route("/usuarios/editar/<int:id>") 
@login_required
@rol_required(1)
def editar_usuario(id):

    conexion = get_connection()
    cursor = conexion.cursor()

    cursor.execute("""
        SELECT
            UsuarioId,
            Correo,
            Apellido,
            Nombre,
            Contrasena,
            RolId
        FROM USUARIO
        WHERE UsuarioId = ?
    """, (id,))

    fila = cursor.fetchone()

    conexion.close()

    if fila is None:

        return "Usuario no encontrado", 404

    usuario = {

        "usuarioId": fila[0],
        "correo": fila[1],
        "apellido": fila[2],
        "nombre": fila[3],
        "contrasena": fila[4],
        "rolId": fila[5]

    }

    return render_template(

        "usuario_form.html",

        usuario=usuario

    )

@app.route("/usuarios/actualizar/<int:id>", methods=["PUT"])
@login_required
@rol_required(1)
def actualizar_usuario(id):

    try:

        data = request.get_json()

        conexion = get_connection()
        cursor = conexion.cursor()

        cursor.execute("""
            UPDATE USUARIO
            SET
                Correo = ?,
                Apellido = ?,
                Nombre = ?,
                Contrasena = ?,
                RolId = ?
            WHERE UsuarioId = ?
        """,
        (
            data["correo"],
            data["apellido"],
            data["nombre"],
            data["contrasena"],
            data["rolId"],
            id
        ))

        conexion.commit()
        conexion.close()

        return jsonify({
            "mensaje": "Usuario actualizado correctamente."
        })

    except Exception as e:

        print(e)

        return jsonify({
            "mensaje": str(e)
        }), 500


@app.route("/reportes")
@login_required
@rol_required(1)
def reportes():

    return render_template("reportes.html")


@app.route("/reportes/datos")
@login_required
@rol_required(1)
def datos_reportes():

    conexion = get_connection()

    cursor = conexion.cursor()

    cursor.execute("""
        SELECT

            s.ServicioId,

            c.Apellido + ' ' + c.Nombre,

            e.Marca + ' ' + e.Modelo,

            es.Descripcion,

            s.FechaIngreso,

            s.Total

        FROM SERVICIO s

        INNER JOIN CLIENTE c
            ON s.ClienteId = c.ClienteId

        INNER JOIN EQUIPO e
            ON s.EquipoId = e.EquipoId

        INNER JOIN ESTADO es
            ON s.EstadoId = es.EstadoId

        ORDER BY s.FechaIngreso DESC
    """)

    reportes = []

    for fila in cursor.fetchall():

        reportes.append({

            "servicioId": fila[0],

            "cliente": fila[1],

            "equipo": fila[2],

            "estado": fila[3],

            "fechaIngreso": fila[4].strftime("%d/%m/%Y"),

            "total": float(fila[5] or 0)

        })

    conexion.close()

    return jsonify(reportes)

@app.route("/servicios/buscar")
def buscar_servicios():

    conexion = get_connection()
    cursor = conexion.cursor()

    cursor.execute("""
        SELECT
            s.ServicioId,
            c.Apellido,
            c.Nombre,
            e.Marca,
            e.Modelo,
            est.Descripcion,
            s.FechaIngreso,
            s.Total
        FROM SERVICIO s
        INNER JOIN CLIENTE c
            ON s.ClienteId = c.ClienteId
        INNER JOIN EQUIPO e
            ON s.EquipoId = e.EquipoId
        INNER JOIN ESTADO est
            ON s.EstadoId = est.EstadoId
        ORDER BY s.ServicioId DESC
    """)

    servicios = []

    for fila in cursor.fetchall():

        servicios.append({

            "servicioId": fila[0],

            "cliente":
                f"{fila[1]} {fila[2]}",

            "equipo":
                f"{fila[3]} {fila[4]}",

            "estado":
                fila[5],

            "fechaIngreso":
                fila[6].strftime("%d/%m/%Y")
                if fila[6] else "",

            "total":
                float(fila[7])
                if fila[7] is not None else 0

        })

    conexion.close()

    return jsonify(servicios)

@app.route("/servicios/detalle/<int:servicio_id>")
def buscar_servicio(servicio_id):

    conexion = get_connection()
    cursor = conexion.cursor()

    consulta = """
        SELECT
            s.ServicioId,
            s.ClienteId,
            s.EquipoId,
            s.EstadoId,

            c.Apellido + ', ' + c.Nombre AS Cliente,
            c.DNI,

            e.TipoEquipo,
            e.Marca,
            e.Modelo,
            e.NumeroSerie,

            es.Descripcion AS Estado,

            s.FechaIngreso,
            s.ProblemaReportado,
            s.Diagnostico,
            s.Solucion,
            s.Total,
            s.FechaEntrega

        FROM SERVICIO s

        INNER JOIN CLIENTE c
            ON s.ClienteId = c.ClienteId

        INNER JOIN EQUIPO e
            ON s.EquipoId = e.EquipoId

        INNER JOIN ESTADO es
            ON s.EstadoId = es.EstadoId

        WHERE s.ServicioId = ?
    """

    cursor.execute(consulta, (servicio_id,))

    fila = cursor.fetchone()

    cursor.close()
    conexion.close()

    if fila is None:
        return jsonify({
            "error": "Servicio no encontrado"
        }), 404

    servicio = {
        "servicioId": fila[0],
        "clienteId": fila[1],
        "equipoId": fila[2],
        "estadoId": fila[3],

        "cliente": fila[4],
        "dni": fila[5],

        "tipoEquipo": fila[6],
        "marca": fila[7],
        "modelo": fila[8],
        "numeroSerie": fila[9],

        "estado": fila[10],

        "fechaIngreso": (
            fila[11].strftime("%d/%m/%Y")
            if fila[11]
            else "-"
        ),

        "problemaReportado": fila[12] or "-",
        "diagnostico": fila[13] or "-",
        "solucion": fila[14] or "-",

        "total": float(fila[15]) if fila[15] is not None else 0,

        "fechaEntrega": (
            fila[16].strftime("%d/%m/%Y")
            if fila[16]
            else "-"
        )
    }

    return jsonify(servicio)
@app.route("/servicios/editar/<int:servicio_id>")
def editar_servicio(servicio_id):

    return render_template(
        "servicio_form.html",
        servicio_id=servicio_id
    )

@app.route("/servicios/actualizar/<int:servicio_id>", methods=["POST"])
def actualizar_servicio(servicio_id):

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "mensaje": "No se recibieron datos."
            }), 400

        conexion = get_connection()
        cursor = conexion.cursor()

        cursor.execute("""
            SELECT COUNT(*)
            FROM SERVICIO
            WHERE ServicioId = ?
        """, (servicio_id,))

        existe = cursor.fetchone()[0]

        if existe == 0:

            cursor.close()
            conexion.close()

            return jsonify({
                "mensaje": "El servicio no existe."
            }), 404

        cursor.execute("""
            UPDATE SERVICIO
            SET
                ClienteId = ?,
                EquipoId = ?,
                EstadoId = ?,
                FechaIngreso = ?,
                ProblemaReportado = ?,
                Diagnostico = ?,
                Solucion = ?,
                Total = ?,
                FechaEntrega = ?
            WHERE ServicioId = ?
        """,
        (
            data["clienteId"],
            data["equipoId"],
            data["estadoId"],
            data["fechaIngreso"],
            data["problema"],
            data["diagnostico"] or None,
            data["solucion"] or None,
            data["total"] or 0,
            data["fechaEntrega"],
            servicio_id
        ))

        conexion.commit()

        cursor.close()
        conexion.close()

        return jsonify({
            "mensaje": "Servicio actualizado correctamente."
        })

    except Exception as e:

        print("Error al actualizar servicio:", e)

        return jsonify({
            "mensaje": "Ocurrió un error al actualizar el servicio."
        }), 500

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

@app.route("/api/clientes")
def obtener_clientes():

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
@login_required
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

@app.route("/servicios/guardar", methods=["POST"])
def guardar_servicio():

    try:

        data = request.get_json()

        conexion = get_connection()
        cursor = conexion.cursor()

        cursor.execute("""
    INSERT INTO SERVICIO
    (
        ClienteId,
        EquipoId,
        UsuarioId,
        EstadoId,
        FechaIngreso,
        ProblemaReportado,
        Diagnostico,
        Solucion,
        Total,
        FechaEntrega
    )
    VALUES (?,?,?,?,?,?,?,?,?,?)
""",
(
    data["clienteId"],
    data["equipoId"],
    2,
    data["estadoId"],
    data["fechaIngreso"],
    data["problema"],
    data["diagnostico"],
    data["solucion"],
    data["total"],
    data["fechaEntrega"]
))
        conexion.commit()
        conexion.close()

        return jsonify({
            "mensaje": "Servicio guardado correctamente."
        })

    except Exception as e:

        print(e)

        return jsonify({
            "mensaje": str(e)
        }), 500



if __name__ == "__main__":
    app.run(debug=True)