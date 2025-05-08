import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [hashMethod, setHashMethod] = useState('argon2');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [show2FASetup, setShow2FASetup] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [token2FA, setToken2FA] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    
    const handleRegister = async () => {
        if (password.length < 12) {
            setError('Hasło musi mieć minimum 12 znaków');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const response = await axios.post(
                'http://127.0.0.1:8000/api/register/', 
                { username, password, hash_method: hashMethod },
                { withCredentials: true }
            );
    
            if (response.data.requires_2fa_setup) {
                const setupResponse = await axios.get(
                    'http://127.0.0.1:8000/api/setup-2fa/',
                    { withCredentials: true }
                );
                
                setQrCode(setupResponse.data.qr_code);
                setSecret(setupResponse.data.secret);
                setShow2FASetup(true);
            } else {
                navigate('/', { state: { registrationSuccess: true } });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Błąd rejestracji. Spróbuj ponownie.');
        } finally {
            setIsLoading(false);
        }
    };

    const handle2FASetup = async () => {
        setIsLoading(true);
        setError('');
        try {
            await axios.post(
                'http://127.0.0.1:8000/api/verify-2fa-setup/', 
                { token: token2FA },
                { withCredentials: true }
            );
            
            navigate('/', { state: { registrationSuccess: true } });
        } catch (err) {
            if (err.response) {
                if (err.response.status === 400) {
                    setError('Nieprawidłowy kod weryfikacyjny');
                } else if (err.response.status === 401) {
                    setError('Sesja wygasła, zaloguj się ponownie');
                } else {
                    setError(`Błąd serwera: ${err.response.status}`);
                }
            } else if (err.request) {
                setError('Brak odpowiedzi z serwera');
            } else {
                setError('Błąd podczas wysyłania żądania');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const skip2FASetup = () => {
        navigate('/', { state: { registrationSuccess: true } });
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Rejestracja</h2>
            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

            {!show2FASetup ? (
                <>
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-gray-700 mb-2">Nazwa użytkownika</label>
                        <input
                            id="password"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="border p-2 w-full rounded"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="mb-4">
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
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Metoda hashowania:</h3>
                        <div className="space-y-2">
                            {['md5', 'sha1', 'bcrypt', 'argon2'].map((method) => (
                                <label key={method} className="flex items-center">
                                    <input
                                        type="radio"
                                        name="hashMethod"
                                        value={method}
                                        checked={hashMethod === method}
                                        onChange={(e) => setHashMethod(e.target.value)}
                                        className="mr-2"
                                        disabled={isLoading}
                                    />
                                    {method.toUpperCase()}
                                </label>
                            ))}
                        </div>
                    </div>
                    <button 
                        onClick={handleRegister} 
                        className="w-full bg-green-500 hover:bg-green-600 text-white p-2 rounded disabled:opacity-50"
                        disabled={isLoading || !username || !password}
                    >
                        {isLoading ? 'Rejestrowanie...' : 'Zarejestruj'}
                    </button>
                </>
            ) : (
                <div className="text-center">
                    <h3 className="text-xl font-bold mb-4">Konfiguracja uwierzytelniania dwuetapowego</h3>
                    <p className="mb-4">Zeskanuj poniższy kod QR w aplikacji uwierzytelniającej (np. Google Authenticator):</p>
                    
                    <div className="flex justify-center mb-4">
                        {qrCode && (
                            <img 
                                src={`data:image/png;base64,${qrCode}`} 
                                alt="QR Code" 
                                className="border p-2"
                            />
                        )}
                    </div>
                    
                    <div className="mb-6">
                        <p className="mb-2">Lub wprowadź ręcznie ten kod:</p>
                        <div className="bg-gray-100 p-3 rounded font-mono select-all">
                            {secret}
                        </div>
                    </div>
                    
                    <div className="mb-6">
                        <label htmlFor="2fa_key" className="block text-gray-700 mb-2">Wprowadź kod weryfikacyjny:</label>
                        <input
                            id="2fa_key"
                            type="text"
                            value={token2FA}
                            onChange={(e) => setToken2FA(e.target.value)}
                            placeholder="123456"
                            className="border p-2 w-full rounded text-center text-xl tracking-widest"
                            maxLength="6"
                            disabled={isLoading}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <button 
                            onClick={handle2FASetup}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded disabled:opacity-50"
                            disabled={isLoading || token2FA.length !== 6}
                        >
                            {isLoading ? 'Weryfikacja...' : 'Zakończ rejestrację'}
                        </button>
                        
                        <button
                            onClick={skip2FASetup}
                            className="w-full bg-gray-500 hover:bg-gray-600 text-white p-2 rounded disabled:opacity-50"
                            disabled={isLoading}
                        >
                            Pomiń konfigurację 2FA
                        </button>
                    </div>
                    
                    <p className="mt-4 text-sm text-gray-600">
                        Możesz pominąć teraz konfigurację 2FA i włączyć ją później w panelu zarządzania kontem.
                    </p>
                </div>
            )}
            
            <p className="mt-4 text-sm text-center">
                Masz już konto?{' '}
                <a href="/" className="text-blue-500 hover:text-blue-700">
                    Zaloguj się
                </a>
            </p>
        </div>
    );
};

export default Register;