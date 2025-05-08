import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Manage2FA = () => {
    const [status, setStatus] = useState(null);
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [token2FA, setToken2FA] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [username, setUsername] = useState('');
    const navigate = useNavigate();
    const sessionChecked = useRef(false);

    useEffect(() => {
        if (!sessionChecked.current) {
            sessionChecked.current = true;
            
            axios.get('http://127.0.0.1:8000/api/check-session/', { withCredentials: true })
                .then(response => {
                    if (response.data.authenticated) {
                        setUsername(response.data.username);
                        fetch2FAStatus();
                    } else {
                        navigate('/');
                    }
                })
                .catch(() => navigate('/'));
        }
    }, [navigate]);

    const fetch2FAStatus = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/get-2fa-status/', { withCredentials: true });
            setStatus(response.data);
        } catch (err) {
            if (err.response) {
                setError('Błąd podczas pobierania statusu 2FA.');
            } else {
                setError('Brak odpowiedzi z serwera. Sprawdź połączenie.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const setup2FA = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/manage-2fa/', { withCredentials: true });
            setQrCode(response.data.qr_code);
            setSecret(response.data.secret);
        } catch (err) {
            if (err.response) {
                setError('Błąd podczas inicjalizacji konfiguracji 2FA.');
            } else {
                setError('Brak odpowiedzi z serwera. Sprawdź połączenie.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const verify2FA = async () => {
        setIsLoading(true);
        setError('');
        try {
            await axios.post('http://127.0.0.1:8000/api/verify-2fa-setup/', { token: token2FA }, { withCredentials: true });
            setMessage('Uwierzytelnianie dwuetapowe zostało włączone!');
            fetch2FAStatus();
        } catch (err) {
            if (err.response) {
                if (err.response.status === 400) {
                    setError('Nieprawidłowy kod weryfikacyjny. Spróbuj ponownie.');
                } else {
                    setError('Wystąpił błąd podczas weryfikacji 2FA.');
                }
            } else {
                setError('Brak odpowiedzi z serwera. Sprawdź połączenie internetowe.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const disable2FA = async () => {
        setIsLoading(true);
        setError('');
        try {
            await axios.post('http://127.0.0.1:8000/api/disable-2fa/', {}, { withCredentials: true });
            setMessage('Uwierzytelnianie dwuetapowe zostało wyłączone.');
            fetch2FAStatus();
        } catch (err) {
            if (err.response) {
                setError('Błąd podczas wyłączania 2FA.');
            } else {
                setError('Brak odpowiedzi z serwera. Sprawdź połączenie.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Zarządzanie uwierzytelnianiem dwuetapowym</h2>
            
            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
            {message && <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded">{message}</div>}

            <div className="mb-4">
                <label htmlFor="logged-user"className="block text-sm font-medium text-gray-700 mb-1">Zalogowany użytkownik:</label>
                <input
                    id="logged-user"
                    type="text"
                    value={username || "Pobieranie danych..."}
                    readOnly
                    className="border p-2 w-full rounded bg-gray-100 font-medium"
                />
            </div>

            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Aktualny status:</h3>
                {status ? (
                    <p className={`p-3 rounded ${status.otp_enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        Uwierzytelnianie dwuetapowe jest aktualnie 
                        <span className="font-bold">{status.otp_enabled ? ' WŁĄCZONE' : ' WYŁĄCZONE'}</span>
                    </p>
                ) : (
                    <p className="p-3 bg-gray-100 rounded">Ładowanie statusu...</p>
                )}
            </div>

            {status && !status.otp_enabled && (
                <>
                    <button 
                        onClick={setup2FA}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded disabled:opacity-50 mb-6"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Konfigurowanie...' : 'Konfiguruj 2FA'}
                    </button>

                    {qrCode && (
                        <div className="space-y-4">
                            <div>
                                <p className="mb-2">Zeskanuj poniższy kod QR w aplikacji uwierzytelniającej:</p>
                                <div className="flex justify-center">
                                    <img 
                                        src={`data:image/png;base64,${qrCode}`} 
                                        alt="QR Code" 
                                        className="border p-2"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <p className="mb-2">Lub wprowadź ręcznie ten kod:</p>
                                <div className="bg-gray-100 p-3 rounded font-mono select-all">
                                    {secret}
                                </div>
                            </div>
                            
                            <div>
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
                            
                            <button
                                onClick={verify2FA}
                                className="w-full bg-green-500 hover:bg-green-600 text-white p-2 rounded disabled:opacity-50"
                                disabled={isLoading || token2FA.length !== 6}
                            >
                                {isLoading ? 'Weryfikacja...' : 'Zweryfikuj i włącz'}
                            </button>
                        </div>
                    )}
                </>
            )}

            {status && status.otp_enabled && (
                <button
                    onClick={disable2FA}
                    className="w-full bg-red-500 hover:bg-red-600 text-white p-2 rounded disabled:opacity-50"
                    disabled={isLoading}
                >
                    {isLoading ? 'Wyłączanie...' : 'Wyłącz 2FA'}
                </button>
            )}
        </div>
    );
};

export default Manage2FA;