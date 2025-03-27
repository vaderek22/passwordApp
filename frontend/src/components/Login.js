import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await axios.post(
                'http://127.0.0.1:8000/api/login/',
                { username, password },
                { withCredentials: true }
            );

            if (response.status === 200) {
                console.log("Zalogowano, przekierowanie...");
                navigate('/home');
            }
        } catch (err) {
            setError('Nieprawidłowe dane logowania.');
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Logowanie</h2>
            {error && <p className="text-red-500">{error}</p>}
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
                className="border p-2 w-full mb-2 rounded"
            />
            <button onClick={handleLogin} className="w-full bg-blue-500 text-white p-2 rounded">
                Zaloguj
            </button>
            <p className="mt-2 text-sm">
                Nie masz konta? <a href="/register" className="text-blue-500">Zarejestruj się</a>
            </p>
        </div>
    );
};

export default Login;