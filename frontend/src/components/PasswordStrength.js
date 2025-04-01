import React, { useState } from 'react';

const PasswordStrength = () => {
    const [password, setPassword] = useState('');
    const [strengthLabel, setStrengthLabel] = useState('');
    const [feedback, setFeedback] = useState([]);

    const detectWeakPatterns = (pwd) => {
        const weakPatterns = ["password", "qwerty", "abc", "abcd", "abcdef", "letmein"];
        const sequentialNumbers = /(?:0123|1234|2345|3456|4567|5678|6789|7890|0000|1111|2222|3333|4444|5555|6666|7777|8888|9999)/;
        const sequentialLetters = /(?:abcd|bcde|cdef|defg|efgh|fghi|ghij|hijk|ijkl|jklm|klmn|lmno|mnop|nopq|opqr|pqrs|qrst|rstu|stuv|tuvw|uvwx|vwxy|wxyz)/i;
        const repeatedPatterns = /(\w)\1{2,}/; // Wykrywa powtórzone litery np. aaa, qqq
        const commonTriplets = /(?:qwe|asd|zxc|123|234|345|456|567|678|789|890)/i;

        if (pwd.length < 8) {
            return "Hasło powinno mieć co najmniej 8 znaków.";
        }
        if (weakPatterns.some(seq => pwd.toLowerCase().includes(seq))) {
            return "Unikaj łatwych słów (np. password, qwerty, abc).";
        }
        if (sequentialNumbers.test(pwd)) {
            return "Unikaj prostych sekwencji liczbowych (np. 1234, 5678, 0000).";
        }
        if (sequentialLetters.test(pwd)) {
            return "Unikaj sekwencji literowych (np. abcd, efgh).";
        }
        if (repeatedPatterns.test(pwd)) {
            return "Unikaj powtórzonych liter (np. aaa, qqq).";
        }
        if (commonTriplets.test(pwd)) {
            return "Unikaj popularnych układów klawiatury (np. qwe, asd, zxc, 123).";
        }
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

        if (pwd.length >= 12) {
            score += 25;
        } else {
            feedbackMsg.push("Hasło powinno mieć co najmniej 12 znaków.");
        }

        if (/[A-Z]/.test(pwd)) {
            score += 15;
        } else {
            feedbackMsg.push("Dodaj co najmniej jedną wielką literę.");
        }

        if (/[0-9]/.test(pwd)) {
            score += 15;
        } else {
            feedbackMsg.push("Dodaj co najmniej jedną cyfrę.");
        }

        if (/\W|_/.test(pwd)) {
            score += 20;
        } else {
            feedbackMsg.push("Dodaj co najmniej jeden znak specjalny (!@#$%^&*). ");
        }

        const weakMessage = detectWeakPatterns(pwd);
        if (weakMessage) {
            feedbackMsg.push(weakMessage);
        } else {
            score += 25;
        }

        let strengthStage = '';
        if (score < 40) {
            strengthStage = 'Słabe';
        } else if (score < 70) {
            strengthStage = 'Średnie';
        } else {
            strengthStage = 'Silne';
        }

        setStrengthLabel(strengthStage);
        setFeedback(feedbackMsg);
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
                    className={`h-4 rounded-full transition-all ${strengthLabel === 'Słabe' ? 'bg-red-500' : strengthLabel === 'Średnie' ? 'bg-yellow-500' : strengthLabel === 'Silne' ? 'bg-green-500' : 'bg-gray-200'}`}
                    style={{ width: password.length === 0 ? '0%' : strengthLabel === 'Słabe' ? '33%' : strengthLabel === 'Średnie' ? '66%' : '100%' }}
                ></div>
            </div>
            {strengthLabel && <p className="text-gray-700 font-semibold mb-2">Siła hasła: {strengthLabel}</p>}
            {feedback.length > 0 && (
                <ul className="text-red-500 text-sm mb-2">
                    {feedback.map((msg, index) => (
                        <li key={index}>• {msg}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default PasswordStrength;
