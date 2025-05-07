import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UpdatePassword = () => {
    const [username, setUsername] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [hashMethod, setHashMethod] = useState('argon2');
    const [message, setMessage] = useState('');
    const [error, setError] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const sessionChecked = useRef(false);

    useEffect(() => {
        if (!sessionChecked.current) {
            sessionChecked.current = true;

            axios.get('http://127.0.0.1:8000/api/check-session/', { withCredentials: true })
                .then(response => {
                    if (response.data.authenticated) {
                        setUsername(response.data.username);
                    } else {
                        navigate('/');
                    }
                })
                .catch(() => navigate('/'));
        }
    }, [navigate]);

    const handleUpdatePassword = async () => {
        if (newPassword.length < 12) {
            setMessage('Nowe hasło musi mieć co najmniej 12 znaków!');
            setError(true);
            return;
        }
        try {
            await axios.post(
                'http://127.0.0.1:8000/api/update-password/',
                {
                    username,
                    old_password: oldPassword,
                    new_password: newPassword,
                    hash_method: hashMethod
                },
                { withCredentials: true }
            );

            setMessage('');
            setError(false);
            setShowModal(true);
        } catch (err) {
            setMessage('Błąd zmiany hasła!');
            setError(true);
        }
    };

    return (
        <div className="relative">
            <h2 className="text-2xl font-bold mb-4">Zmiana hasła</h2>

            {message && (
                <p className={`p-2 mb-2 rounded ${error ? 'text-red-500' : 'text-green-500'}`}>
                    {message}
                </p>
            )}

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Zalogowany użytkownik:</label>
                <input
                    type="text"
                    value={username || "Pobieranie danych..."}
                    readOnly
                    className="border p-2 w-full rounded bg-gray-100 font-medium"
                />
            </div>

            <input
                type="password"
                placeholder="Stare hasło"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="border p-2 w-full mb-2 rounded"
            />
            <input
                type="password"
                placeholder="Nowe hasło"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="border p-2 w-full mb-4 rounded"
            />

            <h3 className="text-lg font-semibold mb-2">Wybierz metodę hashowania:</h3>
            <div className="mb-4">
                {['md5', 'sha1', 'bcrypt', 'argon2'].map((method) => (
                    <label key={method} className="flex items-center mb-2">
                        <input
                            type="radio"
                            name="hashMethod"
                            value={method}
                            checked={hashMethod === method}
                            onChange={(e) => setHashMethod(e.target.value)}
                            className="mr-2"
                        />
                        {method.toUpperCase()}
                    </label>
                ))}
            </div>

            <button
                onClick={handleUpdatePassword}
                className="w-full bg-yellow-500 text-white p-2 rounded mb-2 hover:bg-yellow-600 transition-colors"
            >
                Zmień hasło
            </button>

            {showModal && (
                <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-lg text-center max-w-sm w-full">
                        <h2 className="text-green-600 font-bold text-xl mb-4">Hasło zmienione pomyślnie!</h2>
                        <button
                            onClick={() => setShowModal(false)}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UpdatePassword;