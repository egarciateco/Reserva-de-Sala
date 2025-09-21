
import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { View } from '../types';
import Header from './Header';
import CalendarView from './CalendarView';
import AdminPanel from './AdminPanel';
import AllBookingsReport from './AllBookingsReport';

const MainApp: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>(View.CALENDAR);
    const context = useContext(AppContext);
    
    if (!context || !context.currentUser) return null;
    const { currentUser } = context;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header currentView={currentView} setCurrentView={setCurrentView} />
            <main className="p-4 sm:p-6 md:p-8">
                {currentView === View.CALENDAR && <CalendarView />}
                {currentView === View.ADMIN_PANEL && currentUser.isAdmin && <AdminPanel />}
                {currentView === View.ALL_BOOKINGS_REPORT && <AllBookingsReport />}
            </main>
        </div>
    );
};

export default MainApp;
