import pyodbc


def get_connection():
    connection = pyodbc.connect(
        "DRIVER={ODBC Driver 17 for SQL Server};"
        "SERVER=.\\SQLEXPRESS;"
        "DATABASE=TFIPROGRAMACION;"
        "Trusted_Connection=yes;"
    )

    return connection