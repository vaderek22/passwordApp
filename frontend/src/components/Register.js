import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [hashMethod, setHashMethod] = useState('argon2');
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async () => {
        try {
            await axios.post('http://127.0.0.1:8000/api/register/', {
                username,
                password,
                hash_method: hashMethod
            });

            setError('');
            setShowModal(true);
        } catch (err) {
            setError('Błąd rejestracji. Spróbuj ponownie.');
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Rejestracja</h2>
            {error && <p className="text-red-500 p-2">{error}</p>}

            <input
                type="text"
                placeholder="Nazwa użytkownika"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border p-2 w-full mb-2 rounded"
            />
            <input
                type="password"
                placeholder="Hasło"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            <button onClick={handleRegister} className="w-full bg-green-500 text-white p-2 rounded">
                Zarejestruj
            </button>

            <p className="mt-2 text-sm">
                Masz już konto? <a href="/" className="text-blue-500">Zaloguj się</a>
            </p>

            {showModal && (
                <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-lg text-center">
                        <h2 className="text-green-600 font-bold text-xl mb-4">Rejestracja zakończona sukcesem!</h2>
                        <button
                            onClick={() => {
                                setShowModal(false);
                                navigate('/');
                            }}
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Register;
