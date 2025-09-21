
import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { View } from '../types';

interface HeaderProps {
    currentView: View;
    setCurrentView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { currentUser, setCurrentUser, settings } = context;

    const navButtonClass = (view: View) => 
        `px-4 py-2 rounded-md font-semibold text-white transition-all duration-300 transform hover:scale-105 ${
            currentView === view 
            ? 'bg-yellow-500 shadow-lg' 
            : 'bg-blue-500 hover:bg-blue-600 shadow-md'
        }`;
        
    return (
        <header className="bg-white shadow-md p-4 flex flex-wrap items-center justify-between">
            <div className="flex items-center space-x-4">
                {settings.logo && <img src={settings.logo} alt="TELECOM" className="h-12 w-auto" />}
                <h1 className="text-2xl font-bold text-gray-800 hidden md:block">Reserva de Sala</h1>
            </div>

            <nav className="flex items-center space-x-2 my-2 sm:my-0">
                <button onClick={() => setCurrentView(View.CALENDAR)} className={navButtonClass(View.CALENDAR)}>Calendario</button>
                 <button onClick={() => setCurrentView(View.ALL_BOOKINGS_REPORT)} className="px-4 py-2 rounded-md font-semibold text-white transition-all duration-300 transform hover:scale-105 bg-purple-500 hover:bg-purple-600 shadow-md">
                    Ver Reservas
                </button>
                {currentUser?.isAdmin && (
                    <button onClick={() => setCurrentView(View.ADMIN_PANEL)} className={navButtonClass(View.ADMIN_PANEL)}>Panel de Administración</button>
                )}
            </nav>

            <div className="flex items-center space-x-4">
                <div className="text-right">
                    <p className="font-semibold text-gray-700">{currentUser?.firstName} {currentUser?.lastName}</p>
                    <p className="text-sm text-gray-500">{currentUser?.role}</p>
                </div>
                <button
                    onClick={() => setCurrentUser(null)}
                    className="px-4 py-2 bg-red-500 text-white rounded-md font-semibold hover:bg-red-600 transition-colors"
                >
                    Salir
                </button>
            </div>
        </header>
    );
};

export default Header;
