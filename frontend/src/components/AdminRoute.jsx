import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
    const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;

    if (!userInfo || !userInfo.isAdmin) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;
