import pyodbc

def obtener_conexion():

    conexion = pyodbc.connect(

        "DRIVER={ODBC Driver 17 for SQL Server};"
        "SERVER=localhost;"
        "DATABASE=TFIPROGRAMACION;"
        "Trusted_Connection=yes;"

    )

    return conexion