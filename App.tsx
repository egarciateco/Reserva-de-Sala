
import React, { useState, useEffect, useContext } from 'react';
import AuthScreen from './components/AuthScreen';
import MainApp from './components/MainApp';
import { AppContext } from './context/AppContext';

// --- SplashScreen Component ---
interface SplashScreenProps {
  onEnter: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onEnter }) => {
  const [dateTime, setDateTime] = useState(new Date());
  const [isButtonPressed, setIsButtonPressed] = useState(false);
  const context = useContext(AppContext);

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!context) return null;

  const { settings } = context;

  const handleEnterClick = () => {
    setIsButtonPressed(true);
    setTimeout(() => {
      onEnter();
    }, 300);
  };
  
  const formattedDate = dateTime.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const formattedTime = dateTime.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="relative flex flex-col items-center justify-center h-screen w-screen text-white p-4 overflow-hidden">
      {/* Logo */}
      {settings.logo && <img src={settings.logo} alt="TELECOM Logo" className="absolute top-4 right-4 h-20 w-auto" />}

      {/* Main Title */}
      <div className="text-center">
        <h1 className="text-6xl md:text-8xl font-bold text-yellow-400" style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.8)' }}>
          Reserva de Sala
        </h1>
      </div>
      
      {/* Enter Button */}
      <div className="absolute bottom-1/4">
        <button
          onClick={handleEnterClick}
          className={`px-12 py-4 text-xl md:text-2xl font-bold rounded-lg shadow-2xl transition-all duration-300 transform hover:scale-105 ${isButtonPressed ? 'bg-green-500' : 'bg-blue-600'} text-white`}
        >
          Ingresar
        </button>
      </div>
      
      {/* Date and Time */}
      <div className="absolute bottom-4 right-4 text-white text-2xl" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
        <span>{formattedDate} {formattedTime}</span>
      </div>
    </div>
  );
};
// --- End SplashScreen Component ---


const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const context = useContext(AppContext);

  if (!context || !context.isInitialized) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Inicializando aplicación...</span>
        </div>
    );
  }
  
  const { currentUser, settings } = context;

  const backgroundStyle: React.CSSProperties = settings.backgroundImage
    ? { backgroundImage: `url(${settings.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }
    : { backgroundColor: '#111827' }; // Dark gray background if no image

  const handleEnter = () => {
    setShowSplash(false);
  };

  return (
    <div style={backgroundStyle} className="min-h-screen font-sans">
      {showSplash ? (
        <SplashScreen onEnter={handleEnter} />
      ) : currentUser ? (
        <MainApp />
      ) : (
        <AuthScreen />
      )}
    </div>
  );
};

export default App;
