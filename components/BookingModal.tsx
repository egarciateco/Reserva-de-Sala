
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { Booking } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  slotDate: Date;
  booking: Booking | null;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, slotDate, booking }) => {
  const context = useContext(AppContext);
  const [duration, setDuration] = useState(booking?.duration || 1);
  const [reason, setReason] = useState(booking?.reason || '');
  
  useEffect(() => {
    setDuration(booking?.duration || 1);
    setReason(booking?.reason || '');
  }, [booking]);

  if (!context || !isOpen) return null;
  const { currentUser, addBooking, deleteBooking, bookings } = context;

  const handleConfirm = () => {
    if (!currentUser) return;

    if (!reason.trim()) {
      alert('Por favor, ingrese un motivo para la reserva.');
      return;
    }

    for (let i = 0; i < duration; i++) {
        const checkDate = new Date(slotDate);
        checkDate.setHours(checkDate.getHours() + i);
        const checkTime = checkDate.getTime();

        const conflict = bookings.find(b => {
            const bookingStart = new Date(b.date).getTime();
            const durationInMs = (b.duration || 1) * 60 * 60 * 1000;
            const bookingEnd = bookingStart + durationInMs;
            return checkTime >= bookingStart && checkTime < bookingEnd;
        });

        if (conflict) {
            alert('Conflicto de reserva detectado. Por favor, elija otro horario o duración.');
            return;
        }
    }

    const newBooking: Booking = {
      id: crypto.randomUUID(),
      userId: currentUser.id,
      date: slotDate.toISOString(),
      sector: currentUser.sector || 'Admin',
      userName: currentUser.lastName,
      duration: duration,
      reason: reason.trim(),
    };
    addBooking(newBooking);
    onClose();
  };
  
  const handleDelete = () => {
    if (booking) {
        deleteBooking(booking.id);
        onClose();
    }
  }

  const dateString = slotDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeString = slotDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 max-w-sm w-full shadow-2xl">
        <h2 className="text-2xl font-bold mb-4">
            {booking ? 'Detalle de Reserva' : 'Confirmar Reserva'}
        </h2>
        <div className="text-lg space-y-4 mb-6">
            <p><span className="font-semibold">Fecha:</span> {dateString}</p>
            <p><span className="font-semibold">Hora:</span> {timeString}</p>
             {!booking && (
                <>
                  <div className='flex items-center'>
                      <label htmlFor="duration" className="font-semibold text-base">Duración:</label>
                      <input 
                          type="number"
                          id="duration"
                          name="duration"
                          min="1"
                          max="10"
                          value={duration}
                          onChange={(e) => setDuration(parseInt(e.target.value, 10) || 1)}
                          className="ml-2 w-20 p-1 border rounded"
                      />
                       <span className="ml-2 text-base">hora(s)</span>
                  </div>
                  <div>
                    <label htmlFor="reason" className="font-semibold text-base">Motivo:</label>
                     <textarea 
                          id="reason"
                          name="reason"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          className="mt-1 w-full p-2 border rounded text-base"
                          rows={3}
                          placeholder="Ej: Reunión de equipo"
                          required
                      />
                  </div>
                </>
            )}
            {booking && (
                <>
                    <p><span className="font-semibold">Duración:</span> {booking.duration || 1} hora(s)</p>
                    <p><span className="font-semibold">Reservado por:</span> {booking.userName}</p>
                    <p><span className="font-semibold">Sector:</span> {booking.sector}</p>
                    <p><span className="font-semibold">Motivo:</span> {booking.reason}</p>
                </>
            )}
        </div>
        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">
            Cancelar
          </button>
          {!booking && (
            <button onClick={handleConfirm} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Confirmar
            </button>
          )}
          {booking && (currentUser?.isAdmin || currentUser?.id === booking.userId) && (
             <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                Eliminar Reserva
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;