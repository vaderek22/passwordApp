import React from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import axios from 'axios';

const MainLayout = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axios.post('http://127.0.0.1:8000/api/logout/', {}, { withCredentials: true });
            navigate('/');
        } catch (err) {
            console.error('Błąd podczas wylogowania:', err);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <div className="w-64 bg-gray-800 text-white flex-shrink-0">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-center">Menu</h2>
                    <nav className="mt-6">
                        <ul>
                            <li>
                                <button
                                    onClick={() => navigate('/home')}
                                    className="w-full text-left py-2 px-4 hover:bg-gray-700"
                                >
                                    Strona główna
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => navigate('/password-strength')}
                                    className="w-full text-left py-2 px-4 hover:bg-gray-700"
                                >
                                    Sprawdź siłę hasła
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => navigate('/update-password')}
                                    className="w-full text-left py-2 px-4 hover:bg-gray-700"
                                >
                                    Zmień hasło
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => navigate('/delete-account/')}
                                    className="w-full text-left py-2 px-4 hover:bg-gray-700"
                                >
                                    Usuń konto
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => navigate('/manage-2fa')}
                                    className="w-full text-left py-2 px-4 hover:bg-gray-700"
                                >
                                    Zarządzaj 2FA
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left py-2 px-4 hover:bg-gray-700"
                                >
                                    Wyloguj
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
                <Outlet />
            </div>
        </div>
    );
};

export default MainLayout;