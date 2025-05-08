import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [requires2FA, setRequires2FA] = useState(false);
    const [tempUsername, setTempUsername] = useState('');
    const [token2FA, setToken2FA] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await axios.post(
                'http://127.0.0.1:8000/api/login/',
                { username, password },
                { withCredentials: true }
            );
    
            if (response.data.requires_2fa) {
                setTempUsername(username);
                setRequires2FA(true);
                localStorage.setItem('temp_session_key', response.data.temp_session_key);
            } else if (response.status === 200) {
                navigate('/home');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 
                               (err.response?.status === 403 ? 
                                "Konto zablokowane z powodu zbyt wielu nieudanych prób" : 
                                "Nieprawidłowe dane logowania");
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handle2FALogin = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await axios.post(
                'http://127.0.0.1:8000/api/verify-2fa-login/',
                { 
                    username: tempUsername, 
                    token: token2FA,
                    session_key: localStorage.getItem('temp_session_key')
                },
                { withCredentials: true }
            );
            
            if (response.status === 200) {
                localStorage.removeItem('temp_session_key');
                navigate('/home');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Nieprawidłowy kod weryfikacyjny');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Logowanie</h2>
            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
            
            {!requires2FA ? (
                <>
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-gray-700 mb-2">Nazwa użytkownika</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="border p-2 w-full rounded"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-gray-700 mb-2">Hasło</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="border p-2 w-full rounded"
                            disabled={isLoading}
                        />
                    </div>
                    <button 
                        onClick={handleLogin} 
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded disabled:opacity-50"
                        disabled={isLoading || !username || !password}
                    >
                        {isLoading ? 'Logowanie...' : 'Zaloguj'}
                    </button>
                </>
            ) : (
                <>
                    <div className="mb-6">
                        <p className="mb-2">Wprowadź 6-cyfrowy kod weryfikacyjny z aplikacji uwierzytelniającej:</p>
                        <input
                            type="text"
                            value={token2FA}
                            onChange={(e) => setToken2FA(e.target.value)}
                            placeholder="123456"
                            className="border p-2 w-full rounded text-center text-xl tracking-widest"
                            maxLength="6"
                            disabled={isLoading}
                        />
                    </div>
                    <button 
                        onClick={handle2FALogin}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded disabled:opacity-50 mb-2"
                        disabled={isLoading || token2FA.length !== 6}
                    >
                        {isLoading ? 'Weryfikacja...' : 'Zweryfikuj'}
                    </button>
                    <button 
                        onClick={() => {
                            setRequires2FA(false);
                            setToken2FA('');
                        }}
                        className="w-full bg-gray-500 hover:bg-gray-600 text-white p-2 rounded"
                    >
                        Wróć
                    </button>
                </>
            )}
            
            <p className="mt-4 text-sm text-center">
                Nie masz konta?{' '}
                <a href="/register" className="text-blue-500 hover:text-blue-700">
                    Zarejestruj się
                </a>
            </p>
        </div>
    );
};

export default Login;