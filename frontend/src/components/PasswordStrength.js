import React, { useState } from 'react';

const PasswordStrength = () => {
    const [password, setPassword] = useState('');
    const [strengthLabel, setStrengthLabel] = useState('');
    const [feedback, setFeedback] = useState([]);

    const detectWeakPatterns = (pwd) => {
        const weakPatterns = ["password", "qwerty", "abc", "abcd", "abcdef", "letmein"];
        const sequentialNumbers = /(?:0123|1234|2345|3456|4567|5678|6789|7890|0000|1111|2222|3333|4444|5555|6666|7777|8888|9999)/;
        const sequentialLetters = /(?:abcd|bcde|cdef|defg|efgh|fghi|ghij|hijk|ijkl|jklm|klmn|lmno|mnop|nopq|opqr|pqrs|qrst|rstu|stuv)/i;
        const repeatedPatterns = /(\w)\1{2,}/;
        const commonTriplets = /(?:qwe|asd|zxc|123|234|345|456|567|678|789|890)/i;

        if (pwd.length < 8) return "Hasło powinno mieć co najmniej 8 znaków.";
        if (weakPatterns.some(seq => pwd.toLowerCase().includes(seq))) return "Unikaj łatwych słów (np. password, qwerty, abc).";
        if (sequentialNumbers.test(pwd)) return "Unikaj prostych sekwencji liczbowych (np. 1234, 5678, 0000).";
        if (sequentialLetters.test(pwd)) return "Unikaj sekwencji literowych (np. abcd, efgh).";
        if (repeatedPatterns.test(pwd)) return "Unikaj powtórzonych liter (np. aaa, qqq).";
        if (commonTriplets.test(pwd)) return "Unikaj popularnych układów klawiatury (np. qwe, asd, zxc, 123).";
        return null;
    };

    const checkStrength = (pwd) => {
        let score = 0;
        let feedbackMsg = [];

        if (pwd.length === 0) {
            setStrengthLabel('');
            setFeedback([]);
            return;
        }

        if (pwd.length >= 12) score += 25;
        else feedbackMsg.push("Hasło powinno mieć co najmniej 12 znaków.");

        if (/[A-Z]/.test(pwd)) score += 15;
        else feedbackMsg.push("Dodaj co najmniej jedną wielką literę.");

        if (/[0-9]/.test(pwd)) score += 15;
        else feedbackMsg.push("Dodaj co najmniej jedną cyfrę.");

        if (/\W|_/.test(pwd)) score += 20;
        else feedbackMsg.push("Dodaj co najmniej jeden znak specjalny (!@#$%^&*).");

        const weakMessage = detectWeakPatterns(pwd);
        if (weakMessage) {
            feedbackMsg.push(weakMessage);
        } else {
            score += 25;
        }

        const strengthStage = score < 40 ? 'Słabe' : score < 70 ? 'Średnie' : 'Silne';
        setStrengthLabel(strengthStage);
        setFeedback(feedbackMsg);
    };

    const getProgressWidth = () => {
        if (password.length === 0) return '0%';
        if (strengthLabel === 'Słabe') return '33%';
        if (strengthLabel === 'Średnie') return '66%';
        return '100%';
    };

    const getProgressColor = () => {
        switch (strengthLabel) {
            case 'Słabe':
                return 'bg-red-500';
            case 'Średnie':
                return 'bg-yellow-500';
            case 'Silne':
                return 'bg-green-500';
            default:
                return 'bg-gray-200';
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Analiza siły hasła</h2>
            <input
                type="password"
                placeholder="Wpisz swoje hasło"
                value={password}
                onChange={(e) => {
                    setPassword(e.target.value);
                    checkStrength(e.target.value);
                }}
                className="border p-2 w-full mb-2 rounded"
            />
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div
                    className={`h-4 rounded-full transition-all ${getProgressColor()}`}
                    style={{ width: getProgressWidth() }}
                ></div>
            </div>
            {strengthLabel && <p className="text-gray-700 font-semibold mb-2">Siła hasła: {strengthLabel}</p>}
            {feedback.length > 0 && (
                <ul className="text-red-500 text-sm mb-2">
                    {feedback.map((msg) => (
                        <li key={msg}>• {msg}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default PasswordStrength;
