export type Prioridad = "normal" | "urgente";

export interface Turno {
  id: string;
  nombre: string;
  motivo: string;
  prioridad: Prioridad;
  hora: string;
}
