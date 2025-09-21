
import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Booking } from '../types';
import { DAYS_OF_WEEK, HOURS } from '../constants';
import BookingModal from './BookingModal';

const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  const context = useContext(AppContext);
  if (!context) return <div>Cargando calendario...</div>;
  const { bookings, currentUser } = context;

  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - (currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1));

  const weekDates = Array.from({ length: 5 }).map((_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });

  const changeWeek = (offset: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + offset * 7);
      return newDate;
    });
  };
  
  const handleSlotClick = (date: Date, hour: string) => {
    const [h] = hour.split(':').map(Number);
    const slotDate = new Date(date);
    slotDate.setHours(h, 0, 0, 0);

    const now = new Date();
    if (slotDate < now) return;

    const slotTime = slotDate.getTime();
    const existingBooking = bookings.find(b => {
        const bookingStart = new Date(b.date).getTime();
        const durationInMs = (b.duration || 1) * 60 * 60 * 1000;
        const bookingEnd = bookingStart + durationInMs;
        return slotTime >= bookingStart && slotTime < bookingEnd;
    });
    
    if (existingBooking) {
      if(currentUser?.isAdmin || currentUser?.id === existingBooking.userId){
        setEditingBooking(existingBooking);
        setSelectedSlot(new Date(existingBooking.date));
      }
    } else {
        setEditingBooking(null);
        setSelectedSlot(slotDate);
    }
  };

  const renderCell = (date: Date, hour: string) => {
    const [h] = hour.split(':').map(Number);
    const slotDate = new Date(date);
    slotDate.setHours(h, 0, 0, 0);
    const slotTime = slotDate.getTime();

    const now = new Date();
    const isPast = slotDate < now;
    
    const booking = bookings.find(b => {
        const bookingStart = new Date(b.date).getTime();
        const durationInMs = (b.duration || 1) * 60 * 60 * 1000;
        const bookingEnd = bookingStart + durationInMs;
        return slotTime >= bookingStart && slotTime < bookingEnd;
    });
    
    let cellClass = 'border p-2 text-center text-xs h-20 transition-all duration-200';
    let content = <></>;
    
    if (booking) {
      cellClass += ' bg-red-600 text-white font-bold cursor-pointer';
      content = <>{booking.sector}<br/>{booking.userName}</>;
    } else if (isPast) {
      cellClass += ' bg-gray-300 text-gray-600';
      content = <>Agenda<br/>vencida</>;
    } else {
      cellClass += ' bg-green-500 text-white font-semibold cursor-pointer hover:bg-green-600';
      content = <>Libre</>;
    }
    
    return (
      <td key={hour} className={cellClass} onClick={() => handleSlotClick(date, hour)}>
        {content}
      </td>
    );
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => changeWeek(-1)} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">&lt; Anterior</button>
          <h2 className="text-xl font-bold text-gray-700">
            Semana del {weekDates[0].toLocaleDateString('es-ES', { day: '2-digit', month: 'long' })}
          </h2>
          <button onClick={() => changeWeek(1)} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Siguiente &gt;</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="bg-blue-700 text-white p-2 border">Hora</th>
                {DAYS_OF_WEEK.map((day, i) => (
                  <th key={day} className="bg-blue-700 text-white p-2 border w-1/5">
                    {day}<br/>{weekDates[i].toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map(hour => (
                <tr key={hour}>
                  <td className="bg-blue-700 text-white p-2 border text-center font-semibold">{hour}</td>
                  {weekDates.map(date => renderCell(date, hour))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {selectedSlot && (
        <BookingModal 
          isOpen={!!selectedSlot}
          onClose={() => { setSelectedSlot(null); setEditingBooking(null); }}
          slotDate={selectedSlot}
          booking={editingBooking}
        />
      )}
    </>
  );
};

export default CalendarView;
