import React, { useState } from 'react';

const PasswordStrength = () => {
    const [password, setPassword] = useState('');
    const [strengthLabel, setStrengthLabel] = useState('');
    const [feedback, setFeedback] = useState([]);

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

        if (/[\W_]/.test(pwd)) {
            score += 20;
        } else {
            feedbackMsg.push("Dodaj co najmniej jeden znak specjalny (!@#$%^&*).");
        }

        const weakPatterns = ["123", "abc", "password", "qwerty", "1111","1234"];
        if (!weakPatterns.some(seq => pwd.toLowerCase().includes(seq))) {
            score += 25;
        } else {
            feedbackMsg.push("Unikaj łatwych sekwencji (np. 123, abc, password).");
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
