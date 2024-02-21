import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import headerImage from './header.png';
import footerImage from './footer.png';

function App() {
  // Estado para las hojas deseadas
  const hojasDeseadas = ["Coloquios", "Curso de verano", "Trabajo profesional", "Cursada"];

  const codigoToNombre = {
    'ALIMENTAC': 'Industrias de la alimentación',
    'ARQ IND/EDI': 'Edificios industriales',
    'AUT IND/ Y R.': 'Automatización industrial y robótica',
    'AUTOMOTR': 'Industria automotriz',
    'DIS PRODUCT': 'Diseño de productos',
    'EQ Y SIST': 'Equipos y Sistemas para Automatización Industrial',
    'I. P. CONF.--': 'Introducción a procesos de conformación',
    'I.D. ENV EMB-': 'Ingeniería y desarrollo de envases y embalajes',
    'IND 3 / INST': 'Industrias III / Instalaciones industriales',
    'IND CELUL': 'Industrias de celulosa y papel',
    'IND PETROLIF': 'Industrias petrolíferas',
    'IND PLASTI': 'Industrias plásticas',
    'IND TEXTIL': 'Industrias textiles',
    'IND.1- CURSO 1': 'Industrias I - Curso 1',
    'IND.1- CURSO 2': 'Industrias I - Curso 2',
    'INDUST DIG': 'Industrias Digitales',
    'INDUSTRI 2-': 'Industrias II',
    'INTRO ING IN': 'Introducción a la Ingeniería Industrial',
    'MATERIALE-1': 'Materiales industriales I',
    'MATERIALE-2': 'Materiales industriales II',
    'PPIOS ING IND': 'Principios de Ingeniería Industrial',
    'PROC MA 1-': 'Procesos de manufactura I',
    'PROC MA 2-': 'Procesos de manufactura II',
    'PROY INDUS': 'Proyecto Industrial',
    'SEMINARI 1-': 'Seminario de Ingeniería Industrial I',
    'SEMINARI 2-': 'Seminario de Ingeniería Industrial II',
    'SEMINARI 3-': 'Seminario de Ingeniería Industrial III',
    'SEMINARI 4-': 'Seminario de Ingeniería Industrial IV',
    'TRANS ENER': 'Transformación de la Energía',
    'TRANSF MAT': 'Transformación de la Materia',
    'MATERIALES 1': 'Materiales industriales I',
  };

  const nombreToCodigo = Object.entries(codigoToNombre).reduce((acc, [codigo, nombre]) => {
    acc[nombre] = codigo;
    return acc;
  }, {});

  // Estados principales
  const [hojas, setHojas] = useState(hojasDeseadas);
  const [hojaSeleccionada, setHojaSeleccionada] = useState('');
  const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState('');
  const [mensajes, setMensajes] = useState([]);
  const [hojaConsulta, setHojaConsulta] = useState('');
  const [mostrarInputAsignatura, setMostrarInputAsignatura] = useState(false);
  const [mostrarBienvenida, setMostrarBienvenida] = useState(true);
  const [preguntarOtraAsignatura, setPreguntarOtraAsignatura] = useState(false);
  const [mostrarChat, setMostrarChat] = useState(false);


  useEffect(() => {
    if (mostrarBienvenida) {
      const mensajeBienvenida = 'Hola, ¿en qué te puedo ayudar?';
      const mensajeHojas = (
        <div >
          <p >Elegí una opción:</p>
          <ul>
            {hojas.map((hoja, index) => (
              <li key={index}>{hoja}</li>
            ))}
          </ul>
        </div>
      );
      setMensajes([
        { tipo: 'chatbot', texto: mensajeBienvenida },
        { tipo: 'chatbot', componente: mensajeHojas },
      ]);
      setMostrarBienvenida(false);
    }
  }, [mostrarBienvenida, hojas]);
 

  const resetChat = () => {
    setMensajes([]);
    setMostrarBienvenida(true);
    setHojaConsulta('');
    setMostrarInputAsignatura(false);
    setPreguntarOtraAsignatura(false);
    setHojaSeleccionada('');
    setAsignaturaSeleccionada('');
    setMostrarChat(false);
  };

  useEffect(() => {
    if (hojaConsulta) {
      responderAlUsuario();
    }
  }, [hojaConsulta]);

  // Función para manejar cambios en el input de la hoja
  const handleChange = (event) => {
    setHojaSeleccionada(event.target.value);
  };

  // Función para manejar la tecla Enter en el input de la hoja
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      enviarHojaSeleccionada();
    }
  };

  // Función para enviar la hoja seleccionada
  const enviarHojaSeleccionada = () => {
    // Buscar la hoja que contiene la palabra ingresada por el usuario (sin importar mayúsculas o minúsculas)
    const hojaEncontrada = hojas.find(hoja => hoja.toLowerCase().includes(hojaSeleccionada.toLowerCase()));
    if (!hojaEncontrada) {
      console.error('No se encontró ninguna hoja que coincida con la entrada del usuario.');
      return;
    }
  
    const mensajeUsuario = `Seleccionaste la hoja ${hojaEncontrada}`;
    setMensajes([...mensajes, { tipo: 'usuario', texto: mensajeUsuario }]);
    setHojaConsulta(hojaEncontrada); // Guardar la hoja seleccionada para las consultas de asignaturas
    setHojaSeleccionada('');
    setMostrarInputAsignatura(true); // Mostrar el input de la asignatura
  };
  
  

  // Función para obtener y procesar datos de la hoja seleccionada
  const responderAlUsuario = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/tabla_hoja/${hojaConsulta}`);
      if (response.data.TablaHoja) {
        try {
          // Procesar datos y manejar errores
          const contenidoTabla = response.data.TablaHoja.map(fila => ({
            ...fila,
            "DATOS ACTUALIZADOS AL": fila["DATOS ACTUALIZADOS AL"]
              ? new Date(fila["DATOS ACTUALIZADOS AL"]).toDateString()
              : null,
            "FECHA": fila["FECHA"] ? new Date(fila["FECHA"]).toDateString() : null,
          }));

          const asignaturasUnicas = response.data.AsignaturasUnicas || [];
          
          const nombresAsignaturas = asignaturasUnicas.map(codigo => codigoToNombre[codigo]);

          const mensaje = (
            <div style={{marginTop:'20px'}}>
              <p>Asignaturas Únicas:</p>
              <ul>
                {nombresAsignaturas.map((asignatura, index) => (
                  <li key={index}>{asignatura}</li>
                ))}
              </ul>
            </div>
          );

          setMensajes((prevMensajes) => [...prevMensajes, { tipo: 'chatbot', componente: mensaje }]);
        } catch (error) {
          console.error('Error al procesar datos de la tabla:', error);
        }
      } else {
        console.error('La propiedad "TablaHoja" no está presente en la respuesta del servidor o es undefined.');
      }
    } catch (error) {
      console.error('Error al obtener contenido de la hoja:', error);
      const mensajeError = 'Ocurrió un error al obtener el contenido de la hoja. Por favor, inténtalo nuevamente.';
      setMensajes((prevMensajes) => [...prevMensajes, { tipo: 'chatbot', texto: mensajeError }]);
    }
  };

  // Función para manejar cambios en el input de la asignatura
  const handleAsignaturaChange = (event) => {
    setAsignaturaSeleccionada(event.target.value);
  };

  // Función para manejar la tecla Enter en el input de la asignatura
  const handleAsignaturaKeyDown = (event) => {
    if (event.key === 'Enter') {
      enviarAsignaturaSeleccionada();
    }
  };

  // Función para enviar la asignatura seleccionada
  const enviarAsignaturaSeleccionada = () => {
    const mensajeUsuario = `Seleccionaste la asignatura ${asignaturaSeleccionada}`;
    setMensajes([...mensajes, { tipo: 'usuario', texto: mensajeUsuario }]);
    setAsignaturaSeleccionada('');
    responderAlUsuarioAsignatura();
  };

  // Función para obtener y procesar datos de la asignatura seleccionada
  const responderAlUsuarioAsignatura = async () => {
    try {
      // Obtener el código de la asignatura a partir del nombre
      const codigoAsignatura = nombreToCodigo[asignaturaSeleccionada];
      const response = await axios.get(`http://localhost:5000/tabla_asignatura/${hojaConsulta}/${codigoAsignatura}`);
      if (response.data.TablaAsignatura) {
        try {
          // Procesar datos y manejar errores
          const contenidoTabla = response.data.TablaAsignatura.map(fila => ({
            ...fila,
            "DATOS ACTUALIZADOS AL": fila["DATOS ACTUALIZADOS AL"]
              ? new Date(fila["DATOS ACTUALIZADOS AL"]).toDateString()
              : null,
            "FECHA": fila["FECHA"] ? new Date(fila["FECHA"]).toDateString() : null,
          }));

          const mensaje = (
            <div style={{marginTop:'20px'}}>
              {formatoTabla(contenidoTabla)}
            </div>
          );

          setMensajes((prevMensajes) => [...prevMensajes, { tipo: 'chatbot', componente: mensaje }]);
        } catch (error) {
          console.error('Error al procesar datos de la tabla:', error);
        }
      } else {
        console.error('La propiedad "TablaAsignatura" no está presente en la respuesta del servidor o es undefined.');
      }
    } catch (error) {
      console.error('Error al obtener contenido de la asignatura:', error);
      const mensajeError = 'Ocurrió un error al obtener el contenido de la asignatura. Por favor, inténtalo nuevamente.';
      setMensajes((prevMensajes) => [...prevMensajes, { tipo: 'chatbot', texto: mensajeError }]);
    }

    // Agrega la pregunta de si el usuario quiere ver otra asignatura
    setMensajes((prevMensajes) => [...prevMensajes, { tipo: 'chatbot' }]);
    setPreguntarOtraAsignatura(true);
    setMostrarInputAsignatura(false); // Oculta el input de asignatura
  };

  // Agrega una función para manejar la respuesta del usuario a la pregunta de si quiere ver otra asignatura
  const handleOtraAsignaturaRespuesta = (event) => {
    if (event.key === 'Enter') {
      if (event.target.value.toLowerCase() === 'si' || event.target.value.toLowerCase() === 'ok' || event.target.value.toLowerCase() === 'dale') {
        setMostrarInputAsignatura(true);
        setPreguntarOtraAsignatura(false);
        responderAlUsuario();
      } else if (event.target.value.toLowerCase().includes('no')) {
        const mensaje = 'Si queeres puedes seguir consultando otras hojas:';
        const mensajeHojas = (
          <div>
            <p>Elegí una opción:</p>
            <ul>
              {hojas.map((hoja, index) => (
                <li key={index}>{hoja}</li>
              ))}
            </ul>
          </div>
        );
        setMensajes((prevMensajes) => [...prevMensajes, { tipo: 'chatbot', texto: mensaje }, { tipo: 'chatbot', componente: mensajeHojas }]);
        setMostrarInputAsignatura(false);
        setPreguntarOtraAsignatura(false);
      }
    }
  };


    // Función para dar formato a la tabla
    // Función para dar formato a la tabla
    const formatoTabla = (tabla) => {
      if (tabla.length === 0) {
        return <p>No hay datos en la tabla.</p>;
      }
    
      const encabezados = Object.keys(tabla[0]).filter(encabezado => encabezado !== 'DATOS ACTUALIZADOS AL'); // Excluir la columna 'DATOS ACTUALIZADOS AL'
      const dias = { 'LUNES': 'Lunes', 'MARTES': 'Martes', 'MIÉRCO': 'Miércoles', 'JUEVES': 'Jueves', 'VIERNES': 'Viernes' };
      const filasFormateadas = tabla.map(fila => {
        // Reemplazar el código de la asignatura por el nombre limpio
        const filaFormateada = { ...fila };
        filaFormateada.ASIGNATURA = codigoToNombre[fila.ASIGNATURA];
        filaFormateada.DIA = dias[fila.DIA]; // Reemplazar el día abreviado por el nombre completo
        filaFormateada.CONDICION = fila.CONDICION.charAt(0) + fila.CONDICION.slice(1).toLowerCase(); // Capitalizar la primera letra
        filaFormateada.MODALIDAD = fila.MODALIDAD.charAt(0) + fila.MODALIDAD.slice(1).toLowerCase(); // Capitalizar la primera letra
        return filaFormateada;
      });
    
      return (
        <table style={{ border: '1px solid black', borderCollapse: 'collapse' }}>
          <thead className='table-head'>
            <tr>{encabezados.map((encabezado, index) => <th key={index} style={{ border: '1px solid black', padding: '10px' }}>{encabezado}</th>)}</tr>
          </thead>
          <tbody className='table-body'>
            {filasFormateadas.map((fila, index) => (
              <tr key={index}>{encabezados.map((encabezado, index) => <td key={index} style={{ border: '1px solid black', padding: '10px' }}>{fila[encabezado]}</td>)}</tr>
            ))}
          </tbody>
        </table>
      );
    };
  
    return (
      <div className='container'>
        <img src={headerImage} alt="Descripción de la imagen" className="header-image" />
        {!mostrarChat ? (
          <div className='bienvenida'>
            <h1 style={{fontSize:'38px', paddingBottom:'15px'}}>¡Bienvenidos al asistente académico de la Facultad de Ingeniería de la UBA!</h1>
            <p className='mensaje'>En el contexto de la materia Seminario de Ing. Industrial II. Taller de Investigación con Modelización Matemática y Datos, nos alegra presentar una herramienta diseñada para facilitar la gestión de información.</p>
            <p className='mensaje'>El propósito de esta herramienta es brindar a los estudiantes de Ingeniería una solución eficaz y accesible para obtener información rápida sobre horarios, aulas y eventos académicos. Buscamos enriquecer la experiencia educativa, promover la participación activa y simplificar la gestión de la información en el entorno académico.</p>
            <button className='abrir'onClick={() => setMostrarChat(true)}>ABRIR CHAT</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            {/* Panel de mensajes y selección de hoja */}
            <div className='panel-hojas'>
              <div style={{ display: 'flex', flexDirection: 'column', height: '350px', overflowY: 'auto' }}>
                {/* Renderizado de mensajes */}
                {mensajes.map((mensaje, index) => (
                  <div key={index} style={{ textAlign: mensaje.tipo === 'usuario' ? 'right' : 'left' }}>
                    {mensaje.componente ? mensaje.componente : mensaje.texto}
                  </div>
                ))}
              </div>
  
              {!mostrarInputAsignatura && !preguntarOtraAsignatura && (
                <div >
                  {/* Panel de entrada de hoja */}
                  <label htmlFor="hojaInput">Ingrese el nombre de la hoja:</label>
                  <input
                    type="text"
                    id="hojaInput"
                    value={hojaSeleccionada}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                  />
                  <button className='boton' onClick={enviarHojaSeleccionada}>ENVIAR</button>
                </div>
              )}
              {mostrarInputAsignatura && !preguntarOtraAsignatura && (
                <div>
                  {/* Panel de entrada de asignatura */}
                  <label htmlFor="asignaturaInput">Ingrese el nombre de la asignatura:</label>
                  <input
                    type="text"
                    id="asignaturaInput"
                    value={asignaturaSeleccionada}
                    onChange={handleAsignaturaChange}
                    onKeyDown={handleAsignaturaKeyDown}
                  />
                  <button className='boton' onClick={enviarAsignaturaSeleccionada}>ENVIAR</button>
                </div>
              )}
              {preguntarOtraAsignatura && (
                <div>
                  {/* Panel de entrada de respuesta a la pregunta de si quiere ver otra asignatura */}
                  <label htmlFor="otraAsignaturaInput">¿Deseas ver otra asignatura dentro de la hoja {hojaConsulta}?:</label>
                  <input
                    type="text"
                    id="otraAsignaturaInput"
                    onKeyDown={handleOtraAsignaturaRespuesta}
                  />
              
                </div>
              )}
              <button className='boton' onClick={resetChat}>CERRAR CHAT</button>
            </div>
          </div>
        )}
        <footer className="footer">
        <div className="footer-content">
          <img src={footerImage} alt="Descripción de la imagen" className="footer-image" />
        </div>
      </footer>
      </div>
    );
  }

  export default App;