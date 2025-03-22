import React from 'react';

const Home = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold">Witaj!</h1>
            <div className="mt-4">
                <p className="text-lg">Jesteś zalogowany. Oto kilka informacji:</p>
                <ul className="list-disc list-inside mt-2">
                    <li>Możesz zmienić swoje hasło, korzystając z opcji w panelu bocznym.</li>
                    <li>Pamiętaj, aby regularnie aktualizować swoje hasło w celu zwiększenia bezpieczeństwa.</li>
                    <li>Możesz także sprawdzić siłę swojego aktualnego hasła</li>
                    <li>W każdej chwili możesz usunąć swoje konto.</li>
                    <li>Jeśli chcesz się wylogować, użyj przycisku w panelu bocznym.</li>
                </ul>
            </div>
        </div>
    );
};

export default Home;