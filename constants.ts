
export const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
export const HOURS = Array.from({ length: 11 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`); // 08:00 to 18:00
export const INITIAL_ADMIN_CODE = 'TECO2025';
export const INITIAL_ROLES = ['Empleado', 'Supervisor', 'Coordinador', 'Jefe', 'Gerente', 'Administrador'];
export const INITIAL_SECTORS = [
    'Facilities & Servicios',
    'Operación Costa del Paraná',
    'Depósito',
    'Higiene & Seguridad',
    'Eventos French I',
    'Eventos French II',
    'Red French I',
    'Red French II',
    'Servicios Especiales',
    'Red Garay',
    'Eventos Garay',
    'Comercial & Marketing',
    'Capital Humano'
];
