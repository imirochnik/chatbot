from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd


app = Flask(__name__)
CORS(app)  # Configura CORS para permitir solicitudes desde cualquier origen


id = '1ZohOZMzMf1Z_aTYZ66agy3wWPGVHjFiP'

df_coloquio = pd.read_excel(f"https://docs.google.com/spreadsheets/d/{id}/export?format=xlsx", sheet_name='COLOQ X MATERIA', header=2)
df_verano = pd.read_excel(f"https://docs.google.com/spreadsheets/d/{id}/export?format=xlsx", sheet_name='CUR VERANO', header= 1)
df_tp = pd.read_excel(f"https://docs.google.com/spreadsheets/d/{id}/export?format=xlsx", sheet_name='T.P.FEBR.2024', header= 1)
df_cursada= pd.read_excel(f"https://docs.google.com/spreadsheets/d/{id}/export?format=xlsx", sheet_name='HOY SE CURSA', header= 1)

mapeo_hojas_df = {
    "Coloquios": df_coloquio,
    "Curso de verano": df_verano,
    "Trabajo profesional": df_tp,
    "Cursada": df_cursada,
}

hojas_deseadas = ["Coloquios", "Curso de verano", "Trabajo profesional", "Cursada"]


@app.route('/hojas')
def hojas():
    try:
        # Devuelve los nombres personalizados de las hojas
        return jsonify({"Hojas": list(mapeo_hojas_df.keys())})
    except Exception as e:
        return jsonify({"error": str(e)})

@app.route('/tabla_hoja/<nombre_hoja>')
def tabla_hoja(nombre_hoja):
    try:
        # Obtener el DataFrame correspondiente al nombre de la hoja
        df = mapeo_hojas_df.get(nombre_hoja)

        if df is None:
            return jsonify({"error": "Nombre de hoja no válido"})

        # Obtener las primeras 10 filas de la tabla
        primeras_10_filas = df.head(10).to_dict(orient='records')

        # Obtener la lista de valores únicos de la columna "ASIGNATURA"
        asignaturas_unicas = df['ASIGNATURA'].drop_duplicates().tolist()

        return jsonify({"TablaHoja": primeras_10_filas, "AsignaturasUnicas": asignaturas_unicas})
    except Exception as e:
        return jsonify({"error": str(e)})

@app.route('/tabla_asignatura/<nombre_hoja>/<asignatura>')
def tabla_asignatura(nombre_hoja, asignatura):
    try:
        # Obtener el DataFrame correspondiente al nombre de la hoja
        df = mapeo_hojas_df.get(nombre_hoja)

        if df is None:
            return jsonify({"error": "Nombre de hoja no válido"})

        # Filtrar el DataFrame por la asignatura seleccionada
        df_asignatura = df[df['ASIGNATURA'].str.upper() == asignatura.upper()]

        # Obtener las primeras 10 filas de la tabla de la asignatura
        primeras_10_filas_asignatura = df_asignatura.head(10).to_dict(orient='records')

        return jsonify({"TablaAsignatura": primeras_10_filas_asignatura})
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == "__main__":
    app.run(debug=True)