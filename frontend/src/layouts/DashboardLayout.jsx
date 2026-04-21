import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import useAuthStore from '../store/useAuthStore';

const DashboardLayout = () => {
    const { isAuthenticated, fetchMe, user } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        } else if (!user) {
            fetchMe();
        }
    }, [isAuthenticated, user, navigate, fetchMe]);

    if (!isAuthenticated) return null;

    return (
        <div className="flex bg-slate-50 h-screen w-screen overflow-hidden text-slate-800">
            <Sidebar />
            <main className="flex-1 h-full overflow-y-auto p-8 relative">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
