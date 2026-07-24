from conexion import obtener_conexion

def obtener_clientes():

    conexion = obtener_conexion()

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
        FROM Cliente
        ORDER BY Apellido
    """)

    clientes = []

    for fila in cursor.fetchall():

        clientes.append({

            "ClienteId": fila.ClienteId,
            "DNI": fila.DNI,
            "Apellido": fila.Apellido,
            "Nombre": fila.Nombre,
            "Telefono": fila.Telefono,
            "Direccion": fila.Direccion,
            "Email": fila.Email

        })

    conexion.close()

    return clientes