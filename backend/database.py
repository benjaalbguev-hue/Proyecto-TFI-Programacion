import pyodbc


def get_connection():
    connection = pyodbc.connect(
        "DRIVER={ODBC Driver 17 for SQL Server};"
        "SERVER=DESKTOP-0PUM2AN;"
        "DATABASE=TFIPROGRAMACION;"
        "Trusted_Connection=yes;"
    )

    return connection