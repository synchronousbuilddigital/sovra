import { Navigate, Outlet } from 'react-router-dom';
import { getStoredUser } from '../utils/storage';

const PrivateRoute = () => {
    const userInfo = getStoredUser();

    if (!userInfo) return <Navigate to="/login" replace />;
    if (!userInfo.isVerified) return <Navigate to="/verify-otp" replace />;

    return <Outlet />;
};

export default PrivateRoute;
