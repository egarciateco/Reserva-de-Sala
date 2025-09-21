import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Booking } from '../types';

const AllBookingsReport: React.FC = () => {
  const context = useContext(AppContext);
  const [expandedSectors, setExpandedSectors] = useState<Record<string, boolean>>({});

  if (!context) return null;

  const { bookings, users, sectors } = context;

  const capitalize = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getBookingsBySector = () => {
    const allSectors = [...new Set([...sectors, ...bookings.map(b => b.sector)])];
    const groupedBookings: { [key: string]: Booking[] } = {};

    allSectors.forEach(sector => {
        const sectorBookings = bookings
            .filter(b => b.sector === sector)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        if (sectorBookings.length > 0) {
            groupedBookings[sector] = sectorBookings;
        }
    });

    return groupedBookings;
  };

  const toggleSector = (sector: string) => {
    setExpandedSectors(prev => ({ ...prev, [sector]: !prev[sector] }));
  };

  const groupedBookings = getBookingsBySector();

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl mt-4">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">Reporte de Todas las Reservas</h2>
      <div className="space-y-8">
        {Object.keys(groupedBookings).length > 0 ? (
          Object.entries(groupedBookings).map(([sector, sectorBookings]) => (
            <div key={sector} className="bg-black text-white p-4 rounded-lg shadow-lg">
              <h3 
                onClick={() => toggleSector(sector)} 
                className="flex justify-between items-center text-xl font-semibold border-b border-gray-600 pb-2 text-yellow-400 cursor-pointer transition-colors duration-300 hover:text-yellow-300"
              >
                <span>{capitalize(sector)}</span>
                <span className="text-2xl font-sans">{expandedSectors[sector] ? '−' : '+'}</span>
              </h3>
              {expandedSectors[sector] && (
                <div className="space-y-2 text-xs font-mono mt-3">
                  {sectorBookings.map(booking => {
                    const user = users.find(u => u.id === booking.userId);
                    const bookingDate = new Date(booking.date);
                    const endDate = new Date(bookingDate.getTime() + booking.duration * 60 * 60 * 1000);
                    const formatTime = (date: Date) => date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div key={booking.id} className="p-2 border-b border-gray-800 last:border-b-0 hover:bg-gray-900 transition-colors duration-200">
                        <div className="flex flex-col md:flex-row md:items-start md:gap-x-4 space-y-1 md:space-y-0 w-full">
                          <span className="md:w-[15%]"><strong>Fecha:</strong> {formatDate(booking.date)}</span>
                          <span className="md:w-[30%]"><strong>Horario:</strong> Desde: {formatTime(bookingDate)} - Hasta: {formatTime(endDate)}</span>
                          <span className="md:w-[25%] truncate" title={`${capitalize(user?.lastName)}, ${capitalize(user?.firstName)}`}><strong>Usuario:</strong> {capitalize(user?.lastName)}, {capitalize(user?.firstName)}</span>
                          <span className="md:w-[30%] truncate" title={capitalize(booking.reason)}><strong>Motivo:</strong> {capitalize(booking.reason)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">No hay reservas para mostrar.</p>
        )}
      </div>
    </div>
  );
};

export default AllBookingsReport;