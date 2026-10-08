import { useState, type FormEvent } from "react";
import { turnosIniciales } from "./data/turnosIniciales";
import {
  atenderPrimero,
  camposTurnoCompletos,
  crearTurno,
  devolverALaFila,
  insertarEnFila,
  MENSAJE_CAMPOS_REQUERIDOS,
} from "./logic/fila";
import type { Prioridad, Turno } from "./types/turno";
import "./App.css";

function App() {
  const [turnos, setTurnos] = useState<Turno[]>(turnosIniciales);
  const [historial, setHistorial] = useState<Turno[]>([]);

  const [nombre, setNombre] = useState("");
  const [motivo, setMotivo] = useState("");
  const [prioridad, setPrioridad] = useState<Prioridad>("normal");

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [mostrarReflexion, setMostrarReflexion] = useState(false);

  const mostrarMensaje = (texto: string) => {
    setMensaje(texto);

    setTimeout(() => {
      setMensaje("");
    }, 3000);
  };

  const agregarTurno = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nombreLimpio = nombre.trim();
    const motivoLimpio = motivo.trim();

    if (!camposTurnoCompletos(nombreLimpio, motivoLimpio)) {
      setError(MENSAJE_CAMPOS_REQUERIDOS);
      return;
    }

    const nuevoTurno = crearTurno({
      nombre: nombreLimpio,
      motivo: motivoLimpio,
      prioridad,
    });

    setTurnos((filaActual) => insertarEnFila(filaActual, nuevoTurno));

    if (prioridad === "urgente") {
      mostrarMensaje(`Turno urgente agregado para ${nombreLimpio}`);
    } else {
      mostrarMensaje(`Turno de ${nombreLimpio} agregado a la fila`);
    }

    setNombre("");
    setMotivo("");
    setPrioridad("normal");
    setError("");
  };

  const atenderSiguiente = () => {
    const { atendido, filaRestante } = atenderPrimero(turnos);

    if (!atendido) {
      return;
    }

    setHistorial((historialAnterior) => [
      atendido,
      ...historialAnterior,
    ]);

    setTurnos(filaRestante);

    mostrarMensaje(`Atendiendo a ${atendido.nombre}`);
  };

  const restaurarUltimo = () => {
    if (historial.length === 0) {
      return;
    }

    const ultimoAtendido = historial[0];

    const { fila, historial: historialRestante } = devolverALaFila(
      turnos,
      historial
    );

    setTurnos(fila);

    setHistorial(historialRestante);

    mostrarMensaje(
      `Turno de ${ultimoAtendido.nombre} devuelto a la fila`
    );
  };

  const siguienteTurno = turnos[0];

  return (
    <div className="app">
      {/* HEADER */}
      <header className="header">
        <div className="brand">
          <div className="brand-icon">✦</div>

          <div>
            <h1>Fila Creativa</h1>

            <p>
              Sistema inteligente de gestión de turnos FIFO &
              prioridades
            </p>
          </div>
        </div>

        <button
          className="reflection-button"
          onClick={() => setMostrarReflexion(true)}
        >
          ◈ Reflexión Técnica
        </button>
      </header>

      {/* NOTIFICACIÓN */}
      {mensaje && <div className="toast">● {mensaje}</div>}

      {/* CONTENIDO PRINCIPAL */}
      <main className="main-grid">
        {/* COLUMNA IZQUIERDA */}
        <section className="left-column">
          {/* FORMULARIO */}
          <div className="card form-card">
            <h2>♙ Solicitar Turno</h2>

            <p className="description">
              Ingresa tus datos para registrarte en la lista de
              espera.
            </p>

            <form onSubmit={agregarTurno}>
              <label>Nombre completo *</label>

              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Lina Pérez"
              />

              <label>Motivo de consulta *</label>

              <input
                type="text"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ej. Duda sobre React y Hooks"
              />

              <label>Nivel de prioridad</label>

              <div className="priority-buttons">
                <button
                  type="button"
                  className={
                    prioridad === "normal"
                      ? "priority active"
                      : "priority"
                  }
                  onClick={() => setPrioridad("normal")}
                >
                  ◷ Normal
                </button>

                <button
                  type="button"
                  className={
                    prioridad === "urgente"
                      ? "priority urgent-active"
                      : "priority"
                  }
                  onClick={() => setPrioridad("urgente")}
                >
                  ⚠ Urgente
                </button>
              </div>

              {error && <p className="error">{error}</p>}

              <button type="submit" className="add-button">
                ＋ Agregar a la Fila
              </button>
            </form>
          </div>

          {/* HISTORIAL */}
          <div className="card history-card">
            <div className="section-header">
              <h3>◴ Historial Atendido</h3>

              {historial.length > 0 && (
                <button
                  className="undo-button"
                  onClick={restaurarUltimo}
                >
                  ↶ Deshacer
                </button>
              )}
            </div>

            <p className="small-description">
              Últimos turnos atendidos (LIFO)
            </p>

            {historial.length === 0 ? (
              <p className="empty-history">
                No se ha atendido a nadie todavía.
              </p>
            ) : (
              <div className="history-list">
                {historial.map((turno, index) => (
                  <div className="history-item" key={turno.id}>
                    <div>
                      <strong>{turno.nombre}</strong>

                      <span>{turno.motivo}</span>
                    </div>

                    <small>
                      {index === 0
                        ? "Último atendido"
                        : "Atendido"}
                    </small>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* COLUMNA DERECHA */}
        <section className="right-column">
          {/* TURNO ACTUAL */}
          <div className="card current-card">
            <div className="status-row">
              <span className="status">
                ● ATENCIÓN EN CURSO
              </span>

              <span className="index-info">
                Primer elemento · Índice 0
              </span>
            </div>

            {siguienteTurno ? (
              <div className="current-content">
                <div>
                  <div className="name-row">
                    <h2>{siguienteTurno.nombre}</h2>

                    {siguienteTurno.prioridad ===
                      "urgente" && (
                      <span className="urgent-tag">
                        URGENTE
                      </span>
                    )}
                  </div>

                  <p className="reason">
                    <span>Motivo:</span>{" "}
                    {siguienteTurno.motivo}
                  </p>

                  <p className="time">
                    ◷ Registrado a las{" "}
                    {siguienteTurno.hora}
                  </p>
                </div>

                <button
                  className="attend-button"
                  onClick={atenderSiguiente}
                >
                  ✓ Atender siguiente
                </button>
              </div>
            ) : (
              <div className="empty-current">
                <div className="empty-icon">♙</div>

                <h3>No hay personas en espera</h3>

                <p>
                  Registra nuevos turnos desde el formulario
                  para comenzar la atención.
                </p>
              </div>
            )}
          </div>

          {/* FILA */}
          <div className="card queue-card">
            <div className="queue-header">
              <div>
                <h2>☷ Personas en Espera</h2>

                <p>
                  Estructura FIFO · First In, First Out
                </p>
              </div>

              <span className="counter">
                {turnos.length}{" "}
                {turnos.length === 1
                  ? "persona"
                  : "personas"}
              </span>
            </div>

            {turnos.length === 0 ? (
              <div className="empty-queue">
                Fila despejada
              </div>
            ) : (
              <ol className="queue-list">
                {turnos.map((turno, index) => {
                  const esPrimero = index === 0;

                  return (
                    <li
                      key={turno.id}
                      className={
                        esPrimero
                          ? "queue-item first"
                          : "queue-item"
                      }
                    >
                      <div className="queue-person">
                        <span className="number">
                          {index + 1}
                        </span>

                        <div>
                          <div className="queue-name">
                            <strong>{turno.nombre}</strong>

                            {turno.prioridad ===
                              "urgente" && (
                              <span className="priority-tag">
                                Prioridad
                              </span>
                            )}

                            {esPrimero && (
                              <span className="next-tag">
                                Siguiente
                              </span>
                            )}
                          </div>

                          <p>{turno.motivo}</p>
                        </div>
                      </div>

                      <span className="queue-time">
                        {turno.hora}
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </section>
      </main>

      {/* MODAL REFLEXIÓN TÉCNICA */}
      {mostrarReflexion && (
        <div
          className="modal-overlay"
          onClick={() => setMostrarReflexion(false)}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setMostrarReflexion(false)}
            >
              ×
            </button>

            <div className="modal-title">
              <div className="modal-icon">✦</div>

              <div>
                <h2>Reflexión Técnica</h2>

                <p>
                  Modelo de datos y reglas FIFO
                </p>
              </div>
            </div>

            <div className="reflection-content">
              <div className="reflection-item">
                <h3>1. ¿Qué representa un Turno?</h3>

                <p>
                  Un turno representa una persona que está
                  esperando ser atendida. Contiene un
                  identificador único, nombre, motivo de
                  consulta, prioridad y hora de registro.
                </p>
              </div>

              <div className="reflection-item">
                <h3>
                  2. ¿Por qué la fila es un arreglo?
                </h3>

                <p>
                  Un arreglo permite conservar el orden de
                  llegada de las personas. De esta manera
                  podemos representar fácilmente una
                  estructura FIFO.
                </p>
              </div>

              <div className="reflection-item">
                <h3>
                  3. ¿Por qué utilizamos slice(1)?
                </h3>

                <p>
                  slice(1) crea un nuevo arreglo sin modificar
                  el arreglo original. Esto respeta el
                  principio de inmutabilidad utilizado por
                  React.
                </p>
              </div>

              <div className="reflection-item">
                <h3>4. ¿Qué significa FIFO?</h3>

                <p>
                  FIFO significa First In, First Out: la
                  primera persona que entra a la fila es la
                  primera persona que debe ser atendida.
                </p>
              </div>

              <div className="reflection-item">
                <h3>
                  5. ¿Qué cambia cuando agregamos prioridad?
                </h3>

                <p>
                  Los turnos urgentes pueden colocarse antes
                  de los turnos normales. Esto convierte la
                  estructura en una cola con prioridad.
                </p>
              </div>
            </div>

            <button
              className="modal-confirm"
              onClick={() => setMostrarReflexion(false)}
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer>
        <span>
          Fila Creativa — Demostración interactiva de React
          con inmutabilidad FIFO
        </span>

        <span>
          Construido con React + TypeScript + Vite
        </span>
      </footer>
    </div>
  );
}

export default App;