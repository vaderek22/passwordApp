import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DeleteAccount = () => {
    const [username, setUsername] = useState('');
    const [password1, setPassword1] = useState('');
    const [password2, setPassword2] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
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

    const handleDeleteAccount = async () => {
        if (!password1 || !password2) {
            setMessage('Oba pola hasła są wymagane!');
            setError(true);
            return;
        }

        if (password1 !== password2) {
            setMessage('Hasła nie są identyczne!');
            setError(true);
            return;
        }

        try {
            await axios.post(
                'http://127.0.0.1:8000/api/check-password/',
                {
                    password: password1
                },
                { withCredentials: true }
            );

            setMessage('');
            setError(false);
            setShowConfirmationModal(true);
        } catch (err) {
            setMessage('Nieprawidłowe hasło!');
            setError(true);
        }
    };

    const confirmDeleteAccount = async () => {
        try {
            await axios.post(
                'http://127.0.0.1:8000/api/delete-account/',
                {
                    password1: password1,
                    password2: password2
                },
                { withCredentials: true }
            );

            navigate('/');
        } catch (err) {
            setMessage('Wystąpił błąd podczas usuwania konta.');
            setError(true);
            setShowConfirmationModal(false);
        }
    };

    return (
        <div className="relative">
            <h2 className="text-2xl font-bold mb-4">Usuń konto</h2>

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
                placeholder="Podaj hasło"
                value={password1}
                onChange={(e) => setPassword1(e.target.value)}
                className="border p-2 w-full mb-2 rounded"
            />
            <input
                type="password"
                placeholder="Powtórz hasło"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                className="border p-2 w-full mb-4 rounded"
            />

            <button
                onClick={handleDeleteAccount}
                className="w-full bg-red-500 text-white p-2 rounded mb-2 hover:bg-red-600 transition-colors"
            >
                Usuń konto
            </button>

            {showConfirmationModal && (
                <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-lg text-center max-w-sm w-full">
                        <h2 className="text-red-600 font-bold text-xl mb-4">Czy na pewno chcesz usunąć konto?</h2>
                        <p className="mb-4">Ta operacja jest nieodwracalna.</p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={() => setShowConfirmationModal(false)}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                            >
                                Nie
                            </button>
                            <button
                                onClick={confirmDeleteAccount}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                            >
                                Tak
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeleteAccount;