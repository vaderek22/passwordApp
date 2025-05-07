import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import UpdatePassword from './components/UpdatePassword';
import Home from './components/Home';
import PasswordStrength from './components/PasswordStrength';
import DeleteAccount from './components/DeleteAccount';
import MainLayout from './components/MainLayout';
import Manage2FA from './components/Manage2FA';

const AppRouter = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route element={<MainLayout />}>
                    <Route path="/home" element={<Home />} />
                    <Route path="/password-strength" element={<PasswordStrength />} />
                    <Route path="/update-password" element={<UpdatePassword />} />
                    <Route path="/delete-account" element={<DeleteAccount />} />
                    <Route path="/manage-2fa" element={<Manage2FA />} />
                </Route>
            </Routes>
        </Router>
    );
};

export default AppRouter;