import React, { createContext, ReactNode, useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { User, Booking, AppSettings } from '../types';
import { INITIAL_ADMIN_CODE, INITIAL_ROLES, INITIAL_SECTORS } from '../constants';

// --- Helper for Mock Email Notifications ---
const sendNotificationEmail = (subject: string, body: string, users: User[]) => {
  console.log("==============================================");
  console.log("== SIMULACIÓN DE ENVÍO DE CORREO ELECTRÓNICO ==");
  console.log("==============================================");
  console.log(`ASUNTO: ${subject}`);
  console.log("CUERPO (HTML):");
  console.log(body.replace(/<br\s*\/?>/g, "\n")); // For better console readability
  console.log("\nDESTINATARIOS:");
  users.forEach(user => {
    const domainCheck = user.email.endsWith('@teco.com.ar') ? '✓' : ' ';
    console.log(`- [${domainCheck}] ${user.firstName} ${user.lastName} <${user.email}>`);
  });
  console.log("==============================================");
  // En una aplicación real, aquí se llamaría a un servicio de correo como SendGrid.
};
// --- End Helper ---

// --- Sound Helper ---
// Create a single AudioContext instance to be resumed on user interaction.
// Initialized as null and created on the first play.
let audioContext: AudioContext | null = null;
const playNotificationSound = () => {
    // Lazy initialization of AudioContext
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    // This is the crucial part for modern browsers. It resumes the AudioContext
    // if it was suspended due to the browser's autoplay policy.
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    if (!audioContext) return;

    // After ensuring the context is running, play the sound.
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.8, audioContext.currentTime); // VOLUME INCREASED SIGNIFICANTLY

    oscillator.start(audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.5);
    oscillator.stop(audioContext.currentTime + 0.5);
};
// --- End Sound Helper ---


interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  addUser: (user: User) => void;
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  updateBooking: (booking: Booking) => void;
  deleteBooking: (bookingId: string) => void;
  sectors: string[];
  addSector: (sector: string) => void;
  deleteSector: (sector: string) => void;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  roles: string[];
  addRole: (role: string) => void;
  deleteRole: (role: string) => void;
  isInitialized: boolean;
  playNotificationSound: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Define state hooks first to ensure setters are available for the initialization effect.
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  const [users, setUsers] = useLocalStorage<User[]>('users', []);
  const [bookings, setBookings] = useLocalStorage<Booking[]>('bookings', []);
  const [sectors, setSectors] = useLocalStorage<string[]>('sectors', []);
  const [roles, setRoles] = useLocalStorage<string[]>('roles', []);
  const [settings, setSettings] = useLocalStorage<AppSettings>('settings', {
    logo: null,
    backgroundImage: null,
    adminCode: INITIAL_ADMIN_CODE,
  });

  // This effect runs only once on startup. It now correctly uses the state setters
  // to ensure that React's state is updated along with localStorage.
  useEffect(() => {
    try {
        // --- SECTORS ---
        const storedSectors = localStorage.getItem('sectors');
        if (storedSectors === null) {
            setSectors(INITIAL_SECTORS);
        } else {
            const sectorsArr = JSON.parse(storedSectors);
            // Ensure the essential sector is always present
            if (!sectorsArr.includes('Facilities & Servicios')) {
                setSectors(['Facilities & Servicios', ...sectorsArr]);
            }
        }

        // --- ROLES ---
        const storedRoles = localStorage.getItem('roles');
        if (storedRoles === null) {
            setRoles(INITIAL_ROLES);
        } else {
            const rolesArr = JSON.parse(storedRoles);
            if (!rolesArr.includes('Administrador')) {
                setRoles([...rolesArr, 'Administrador']);
            }
        }

        // --- SETTINGS ---
        if (localStorage.getItem('settings') === null) {
            setSettings({
                logo: null,
                backgroundImage: null,
                adminCode: INITIAL_ADMIN_CODE,
            });
        }
    } catch (error) {
        console.error("Error initializing default data:", error);
    } finally {
        setIsInitialized(true);
    }
  // This effect should only run once on mount to initialize the application data.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addUser = (user: User) => {
    setUsers(prev => [...prev, user]);
  };

  const addBooking = (booking: Booking) => {
    setBookings(prev => [...prev, booking]);
    playNotificationSound();
    
    // Notification Logic
    const user = users.find(u => u.id === booking.userId);
    const bookingDate = new Date(booking.date);
    const endDate = new Date(bookingDate.getTime() + booking.duration * 60 * 60 * 1000);

    const subject = "Nueva Reserva en Sala de Reuniones";
    const body = `
      Estimados usuarios,<br/><br/>
      Se ha realizado una nueva reserva en la Sala de Reuniones. Los detalles de la reserva son los siguientes:<br/><br/>
      <b>Sector:</b> ${booking.sector}<br/>
      <b>Usuario:</b> ${user?.lastName}, ${user?.firstName}<br/>
      <b>Fecha:</b> ${bookingDate.toLocaleDateString('es-ES', {day: '2-digit', month: '2-digit', year: 'numeric'})}<br/>
      <b>Horario:</b> ${bookingDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}<br/>
      <b>Motivo:</b> ${booking.reason}<br/><br/>
      Para ver la agenda completa o realizar cambios en la reserva, por favor acceda a la aplicación.<br/><br/>
      Atentamente,<br/>
      El equipo de Reserva de Sala de TELECOM
    `;

    sendNotificationEmail(subject, body, users);
    alert(`Reserva creada con éxito. Se ha enviado una notificación por correo a todos los usuarios (ver consola para simulación).`);
  };

  const updateBooking = (updatedBooking: Booking) => {
    setBookings(prev => prev.map(b => b.id === updatedBooking.id ? updatedBooking : b));
    
    const user = users.find(u => u.id === updatedBooking.userId);
    const bookingDate = new Date(updatedBooking.date);
    const endDate = new Date(bookingDate.getTime() + updatedBooking.duration * 60 * 60 * 1000);

    const subject = "Reserva Modificada en Sala de Reuniones";
    const body = `
      Estimados usuarios,<br/><br/>
      Se ha modificado una reserva. Los nuevos detalles son:<br/><br/>
      <b>Sector:</b> ${updatedBooking.sector}<br/>
      <b>Usuario:</b> ${user?.lastName}, ${user?.firstName}<br/>
      <b>Fecha:</b> ${bookingDate.toLocaleDateString('es-ES', {day: '2-digit', month: '2-digit', year: 'numeric'})}<br/>
      <b>Horario:</b> ${bookingDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}<br/>
      <b>Motivo:</b> ${updatedBooking.reason}<br/><br/>
      Atentamente,<br/>
      El equipo de Reserva de Sala de TELECOM
    `;

    sendNotificationEmail(subject, body, users);
    alert(`Reserva modificada con éxito. Se ha enviado una notificación por correo a todos los usuarios (ver consola para simulación).`);
  };
  
  const deleteBooking = (bookingId: string) => {
    const bookingToDelete = bookings.find(b => b.id === bookingId);
    if (!bookingToDelete) return;

    setBookings(prev => prev.filter(b => b.id !== bookingId));
    
    const user = users.find(u => u.id === bookingToDelete.userId);
    const bookingDate = new Date(bookingToDelete.date);

    const subject = "Reserva Cancelada en Sala de Reuniones";
    const body = `
      Estimados usuarios,<br/><br/>
      Se ha cancelado la siguiente reserva:<br/><br/>
      <b>Sector:</b> ${bookingToDelete.sector}<br/>
      <b>Usuario:</b> ${user?.lastName}, ${user?.firstName}<br/>
      <b>Fecha:</b> ${bookingDate.toLocaleDateString('es-ES', {day: '2-digit', month: '2-digit', year: 'numeric'})}<br/>
      <b>Hora:</b> ${bookingDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}<br/>
      <b>Motivo:</b> ${bookingToDelete.reason}<br/><br/>
      El horario ahora se encuentra disponible.<br/><br/>
      Atentamente,<br/>
      El equipo de Reserva de Sala de TELECOM
    `;

    sendNotificationEmail(subject, body, users);
    alert(`Reserva eliminada con éxito. Se ha enviado una notificación por correo a todos los usuarios (ver consola para simulación).`);
  };

  const addSector = (sector: string) => {
    if (!sectors.includes(sector)) {
      setSectors(prev => [...prev, sector]);
    }
  };

  const deleteSector = (sectorToDelete: string) => {
    if (sectorToDelete === 'Facilities & Servicios') {
        alert('No se puede eliminar el sector por defecto "Facilities & Servicios".');
        return;
    }
    setSectors(prev => prev.filter(s => s !== sectorToDelete));
  };
  
  const addRole = (role: string) => {
    if (!roles.includes(role)) {
      setRoles(prev => [...prev, role]);
    }
  };

  const deleteRole = (roleToDelete: string) => {
    if (roleToDelete === 'Administrador') {
      alert('No se puede eliminar el rol de Administrador.');
      return;
    }
    setRoles(prev => prev.filter(r => r !== roleToDelete));
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const value = {
    currentUser,
    setCurrentUser,
    users,
    addUser,
    bookings,
    addBooking,
    updateBooking,
    deleteBooking,
    sectors,
    addSector,
    deleteSector,
    settings,
    updateSettings,
    roles,
    addRole,
    deleteRole,
    isInitialized,
    playNotificationSound,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};