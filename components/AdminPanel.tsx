import React, { useContext, useState, useRef } from 'react';
import { AppContext } from '../context/AppContext';

type AdminView = 'sectors' | 'users' | 'settings' | 'roles';

const AdminPanel: React.FC = () => {
    const [view, setView] = useState<AdminView>('sectors');

    const buttonClass = (v: AdminView, color: string) => `flex-1 text-center p-3 rounded-lg text-white font-bold transition-all duration-200 ${
        view === v ? `bg-${color}-700 shadow-inner` : `bg-${color}-500 hover:bg-${color}-600`
    }`;
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-xl mt-4">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">Panel de Administración</h2>
             <nav className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-6">
                <button onClick={() => setView('sectors')} className={buttonClass('sectors', 'blue')}>Gestionar Sectores</button>
                <button onClick={() => setView('users')} className={buttonClass('users', 'green')}>Ver Usuarios</button>
                <button onClick={() => setView('roles')} className={buttonClass('roles', 'indigo')}>Gestionar Roles</button>
                <button onClick={() => setView('settings')} className={buttonClass('settings', 'purple')}>Configuración</button>
            </nav>
            <div className="bg-gray-50 p-4 rounded-lg">
                {view === 'sectors' && <ManageSectors />}
                {view === 'users' && <ViewUsers />}
                {view === 'roles' && <ManageRoles />}
                {view === 'settings' && <AppSettingsComponent />}
            </div>
        </div>
    );
};

const ManageSectors: React.FC = () => {
    const context = useContext(AppContext);
    const [newSector, setNewSector] = useState('');

    if (!context) return null;

    const handleAddSector = () => {
        if (newSector && !context?.sectors.includes(newSector)) {
            context?.addSector(newSector);
            setNewSector('');
        }
    };

    return (
        <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Sectores</h3>
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newSector}
                    onChange={(e) => setNewSector(e.target.value)}
                    placeholder="Nuevo sector"
                    className="flex-grow p-2 border rounded-md"
                />
                <button onClick={handleAddSector} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Agregar</button>
            </div>
            <ul className="space-y-2">
                {context?.sectors.map(sector => (
                    <li key={sector} className="flex justify-between items-center p-2 bg-white rounded shadow-sm">
                        <span>{sector}</span>
                        <button onClick={() => context.deleteSector(sector)} className="text-red-500 hover:text-red-700">Eliminar</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const ManageRoles: React.FC = () => {
    const context = useContext(AppContext);
    const [newRole, setNewRole] = useState('');

    if (!context) return null;
    const { roles, addRole, deleteRole } = context;

    const handleAddRole = () => {
        if (newRole && !roles.includes(newRole)) {
            addRole(newRole);
            setNewRole('');
        }
    };

    return (
        <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Roles</h3>
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="Nuevo rol"
                    className="flex-grow p-2 border rounded-md"
                />
                <button onClick={handleAddRole} className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600">Agregar</button>
            </div>
            <ul className="space-y-2">
                {roles.map(role => (
                    <li key={role} className="flex justify-between items-center p-2 bg-white rounded shadow-sm">
                        <span>{role}</span>
                        {role !== 'Administrador' && (
                             <button onClick={() => deleteRole(role)} className="text-red-500 hover:text-red-700">Eliminar</button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

const ViewUsers: React.FC = () => {
    const context = useContext(AppContext);
    const capitalize = (str: string = '') => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';
    
    return (
        <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Usuarios Registrados</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white text-xs">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="py-2 px-4 text-left">Apellido</th>
                            <th className="py-2 px-4 text-left">Nombre</th>
                            <th className="py-2 px-4 text-left">Celular</th>
                            <th className="py-2 px-4 text-left">Email</th>
                            <th className="py-2 px-4 text-left">Sector</th>
                            <th className="py-2 px-4 text-left">Rol</th>
                            <th className="py-2 px-4 text-left">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {context?.users.map(user => (
                            <tr key={user.id} className="border-b">
                                <td className="py-2 px-4">{capitalize(user.lastName)}</td>
                                <td className="py-2 px-4">{capitalize(user.firstName)}</td>
                                <td className="py-2 px-4">{user.phone}</td>
                                <td className="py-2 px-4">{user.email.toLowerCase()}</td>
                                <td className="py-2 px-4">{capitalize(user.sector) || 'N/A'}</td>
                                <td className="py-2 px-4">{capitalize(user.role)}</td>
                                <td className="py-2 px-4">
                                    <button className="text-gray-500 hover:text-gray-800 font-bold">...</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const AppSettingsComponent: React.FC = () => {
    const context = useContext(AppContext);
    const [adminCode, setAdminCode] = useState(context?.settings.adminCode || '');
    const logoInputRef = useRef<HTMLInputElement>(null);
    const bgInputRef = useRef<HTMLInputElement>(null);

    if (!context) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'logo' | 'backgroundImage') => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            alert('El archivo es demasiado grande. Por favor, elige una imagen de menos de 10MB.');
            e.target.value = ''; // Clear the input
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            if (!event.target?.result) return;
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                const MAX_WIDTH = fileType === 'backgroundImage' ? 1920 : 256;
                const MAX_HEIGHT = fileType === 'backgroundImage' ? 1080 : 256;
                
                let { width, height } = img;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                
                context?.updateSettings({ [fileType]: dataUrl });
                e.target.value = ''; // Clear the input for re-uploading the same file
            };
            img.onerror = () => {
                alert('No se pudo cargar el archivo de imagen. Por favor, inténtalo con otro archivo.');
                e.target.value = '';
            };
            img.src = event.target.result as string;
        };
        reader.onerror = () => {
             alert('No se pudo leer el archivo. Por favor, inténtalo de nuevo.');
             e.target.value = '';
        };
        reader.readAsDataURL(file);
    };
    
    const handleCodeChange = () => {
        context?.updateSettings({ adminCode });
        alert('Código de administrador actualizado.');
    };

    return (
        <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Configuración General</h3>
            <div className="space-y-6">
                <div>
                    <label className="block mb-2 font-medium">Logotipo de la Empresa</label>
                    <div className="flex items-center gap-4">
                        {context?.settings.logo && (
                            <img src={context.settings.logo} alt="Logo actual" className="h-16 w-auto bg-gray-100 p-1 rounded-md border" />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            ref={logoInputRef}
                            onChange={(e) => handleFileChange(e, 'logo')}
                            className="hidden"
                            aria-hidden="true"
                        />
                        <button
                            onClick={() => logoInputRef.current?.click()}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                            aria-label={context?.settings.logo ? 'Cambiar el logo de la empresa' : 'Subir un logo para la empresa'}
                        >
                            {context?.settings.logo ? 'Cambiar Logo' : 'Subir Logo'}
                        </button>
                    </div>
                </div>
                 <div>
                    <label className="block mb-2 font-medium">Fondo de Pantalla</label>
                    <div className="flex items-center gap-4">
                         {context?.settings.backgroundImage && (
                            <img src={context.settings.backgroundImage} alt="Fondo actual" className="h-16 w-auto bg-gray-100 p-1 rounded-md border aspect-video object-cover" />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            ref={bgInputRef}
                            onChange={(e) => handleFileChange(e, 'backgroundImage')}
                            className="hidden"
                            aria-hidden="true"
                        />
                         <button
                            onClick={() => bgInputRef.current?.click()}
                            className="px-4 py-2 bg-violet-500 text-white rounded-md hover:bg-violet-600 transition-colors"
                            aria-label={context?.settings.backgroundImage ? 'Cambiar el fondo de pantalla' : 'Subir un fondo de pantalla'}
                        >
                            {context?.settings.backgroundImage ? 'Cambiar Fondo' : 'Subir Fondo'}
                        </button>
                    </div>
                </div>
                 <div>
                    <label className="block mb-1 font-medium">Código de Administrador</label>
                    <div className="flex gap-2">
                        <input type="text" value={adminCode} onChange={(e) => setAdminCode(e.target.value)} className="flex-grow p-2 border rounded-md"/>
                        <button onClick={handleCodeChange} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">Guardar</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;