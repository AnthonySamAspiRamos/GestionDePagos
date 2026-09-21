export interface ServicioAdicional {
    nombre: string;
    tipo: string;
    precio: number;
}

export const SERVICIOS_ADICIONALES: ServicioAdicional[] = [
    { nombre: 'Balón deportivo', tipo: 'utilidad', precio: 20 },
    { nombre: 'Arbitraje profesional', tipo: 'servicio', precio: 50 },
    { nombre: 'Iluminación de cancha', tipo: 'servicio', precio: 30 }
];
