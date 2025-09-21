import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { User } from '../types';

const AuthScreen: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const context = useContext(AppContext);

  if (!context) return null;

  const { settings } = context;

  const handleToggle = () => setIsRegistering(!isRegistering);

  return (
    <div className="flex items-center justify-center min-h-screen bg-transparent p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl">
        <div className="text-center">
          {settings.logo && <img src={settings.logo} alt="Company Logo" className="mx-auto h-20 w-auto mb-4" />}
          <h2 className="text-4xl font-extrabold text-gray-900">
            {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isRegistering ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}
            <button onClick={handleToggle} className="font-medium text-blue-600 hover:text-blue-500 ml-1">
              {isRegistering ? 'Inicia sesión' : 'Regístrate'}
            </button>
          </p>
        </div>
        {isRegistering ? <RegisterForm /> : <LoginForm />}
      </div>
    </div>
  );
};

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const context = useContext(AppContext);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = context?.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    // Check if the user is an admin and using the admin code
    if (user && user.isAdmin && user.password === password) {
       context?.setCurrentUser(user);
       return;
    }
    
    if (user && user.password === password) {
      context?.setCurrentUser(user);
    } else {
      setError('Email o contraseña incorrectos.');
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleLogin}>
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <div className="rounded-md shadow-sm -space-y-px">
        <div>
          <label htmlFor="email-address" className="sr-only">Email</label>
          <input
            id="email-address"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="Dirección de email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
         <div>
          <label htmlFor="password-login" className="sr-only">Contraseña</label>
          <input
            id="password-login"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>
      <div>
        <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Iniciar Sesión
        </button>
      </div>
    </form>
  );
};

const RegisterForm: React.FC = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        sector: '',
        role: 'Administrador',
        password: '',
        confirmPassword: '',
        adminCode: '',
    });
    const [error, setError] = useState('');
    const context = useContext(AppContext);
    const { sectors, users, addUser, setCurrentUser, settings, roles, playNotificationSound } = context!;

    const isAdministratorRole = formData.role === 'Administrador';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        setFormData(prev => {
            const newState = { ...prev, [name]: value };

            if (name === 'role') {
                if (value === 'Administrador') {
                    // When switching TO Admin role
                    newState.sector = ''; // Clear sector
                    newState.password = '';
                    newState.confirmPassword = '';
                } else if (prev.role === 'Administrador' && value !== 'Administrador') {
                    // When switching FROM Admin role
                    newState.sector = 'Facilities & Servicios'; // Set default sector
                }
            }
            return newState;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (users.some(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
            setError('Este email ya está registrado.');
            return;
        }

        if (isAdministratorRole) {
            if (formData.adminCode !== settings.adminCode) {
                setError('Código de administrador incorrecto.');
                return;
            }
        } else {
            if (formData.password !== formData.confirmPassword) {
                setError('Las contraseñas no coinciden.');
                return;
            }
             if (formData.password.length < 6) {
                setError('La contraseña debe tener al menos 6 caracteres.');
                return;
            }
            if (!formData.sector) {
                setError('Por favor, selecciona un sector.');
                return;
            }
        }
        
        if(!formData.role){
            setError('Por favor, selecciona un rol.');
            return;
        }

        const newUser: User = {
            id: crypto.randomUUID(),
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            email: formData.email.toLowerCase(),
            sector: isAdministratorRole ? undefined : formData.sector,
            isAdmin: isAdministratorRole,
            role: formData.role,
            password: isAdministratorRole ? formData.adminCode : formData.password,
        };

        addUser(newUser);
        playNotificationSound();
        alert(`¡Bienvenido, ${newUser.firstName}! Tu cuenta ha sido creada exitosamente.`);
        setCurrentUser(newUser);
    };

    return (
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <input name="firstName" required placeholder="Nombre" value={formData.firstName} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
            <input name="lastName" required placeholder="Apellido" value={formData.lastName} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
            <input name="phone" required placeholder="Celular (###)-#######" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
            <input name="email" type="email" required placeholder="Email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
            
            <select name="role" value={formData.role} onChange={handleChange} className="w-full px-3 py-2 border rounded-md text-gray-500" required>
                <option value="" disabled>Selecciona un rol...</option>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            {!isAdministratorRole && (
                 <select name="sector" value={formData.sector} onChange={handleChange} className="w-full px-3 py-2 border rounded-md text-gray-500" required={!isAdministratorRole}>
                    <option value="">Selecciona un sector...</option>
                    {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            )}

            {isAdministratorRole ? (
                 <input name="adminCode" type="password" placeholder="Código de Administrador" value={formData.adminCode} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
            ) : (
                <>
                    <input name="password" type="password" required placeholder="Contraseña" value={formData.password} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
                    <input name="confirmPassword" type="password" required placeholder="Confirmar Contraseña" value={formData.confirmPassword} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
                </>
            )}
            
            <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                Registrarse
            </button>
        </form>
    );
};

export default AuthScreen;