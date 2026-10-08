import type { Prioridad, Turno } from "../types/turno";

export const MENSAJE_CAMPOS_REQUERIDOS =
  "Por favor completa el nombre y el motivo.";

export interface DatosTurno {
  nombre: string;
  motivo: string;
  prioridad: Prioridad;
}

export function camposTurnoCompletos(nombre: string, motivo: string): boolean {
  return Boolean(nombre.trim() && motivo.trim());
}

export function crearTurno(datos: DatosTurno): Turno {
  return {
    id: `t-${Date.now()}`,
    nombre: datos.nombre,
    motivo: datos.motivo,
    prioridad: datos.prioridad,
    hora: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

export function insertarEnFila(fila: Turno[], turno: Turno): Turno[] {
  if (turno.prioridad !== "urgente") {
    return [...fila, turno];
  }

  const ultimoUrgente = fila.findLastIndex(
    (turnoEnFila) => turnoEnFila.prioridad === "urgente"
  );

  if (ultimoUrgente === -1) {
    return [turno, ...fila];
  }

  const nuevaFila = [...fila];

  nuevaFila.splice(ultimoUrgente + 1, 0, turno);

  return nuevaFila;
}

export function atenderPrimero(fila: Turno[]): {
  atendido: Turno | null;
  filaRestante: Turno[];
} {
  if (fila.length === 0) {
    return { atendido: null, filaRestante: fila };
  }

  return { atendido: fila[0], filaRestante: fila.slice(1) };
}

export function devolverALaFila(
  fila: Turno[],
  historial: Turno[]
): { fila: Turno[]; historial: Turno[] } {
  if (historial.length === 0) {
    return { fila, historial };
  }

  const [ultimoAtendido, ...resto] = historial;

  return { fila: [ultimoAtendido, ...fila], historial: resto };
}
