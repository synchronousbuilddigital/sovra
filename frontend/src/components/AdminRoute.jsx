import { Navigate, Outlet } from 'react-router-dom';
import { getStoredUser } from '../utils/storage';

const AdminRoute = () => {
    const userInfo = getStoredUser();

    if (!userInfo || !userInfo.isAdmin) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;
