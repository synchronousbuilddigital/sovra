import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
    const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;

    if (!userInfo) return <Navigate to="/login" replace />;
    if (!userInfo.isVerified) return <Navigate to="/verify-otp" replace />;

    return <Outlet />;
};

export default PrivateRoute;
