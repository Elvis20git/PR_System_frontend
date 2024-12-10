import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    Files,
    UserCircle,
    LogOut
} from 'lucide-react';

interface SidebarProps {
    onLogout?: () => void;
}

const Sidebar = ({ onLogout }: SidebarProps) => {
    const [isHovered, setIsHovered] = useState(true);
    const navigate = useNavigate();

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        }
        // Optionally navigate to login page after logout
        navigate('/login');
    };

    const menuItems = [
        {path: '/', icon: <LayoutDashboard className="w-5 h-5"/>, label: "Dashboard"},
        {path: '/purchase-request', icon: <FileText className="w-5 h-5"/>, label: "Purchase Request"},
        {path: '/purchase-request-list', icon: <Files className="w-5 h-5"/>, label: "All PR"},
        {path: '/profile', icon: <UserCircle className="w-5 h-5"/>, label: "Profile"},
    ];

    return (
        <div
            className={`h-screen bg-white shadow-lg transition-all duration-300 ease-in-out ${
                isHovered ? 'w-64' : 'w-16'
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(true)}
        >
            <div className="p-4">
                {/* Logo Section */}
                <div className="p-6">
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-2">
                            <span className="text-white text-xl rotate-0 transition-transform duration-300 hover:rotate-180">
                                ⟳
                            </span>
                        </div>
                        <span className="text-blue-600 font-bold text-2xl">PR</span>
                        <div className="relative">
                            <span className="text-emerald-400 font-bold text-2xl">O</span>
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-400 rounded-full"></div>
                        </div>
                        <span className="text-gray-800 font-bold text-2xl">CU</span>
                    </div>
                </div>

                <nav className="space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transform transition-all duration-300 ease-in-out
                            hover:scale-105 hover:shadow-md ${
                                location.pathname === item.path
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <span className="transition-transform duration-300 ease-in-out group-hover:translate-x-1">
                                {item.icon}
                            </span>
                            <span className="transition-transform duration-300 ease-in-out group-hover:translate-x-1">
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="absolute bottom-4 w-64 px-4">
                <button
                    onClick={handleLogout}
                    className="flex items-center p-2 w-full text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg cursor-pointer"
                >
                    <span>
                        <LogOut className="w-4 h-4"/>
                    </span>
                    <span className={`ml-3 transition-opacity duration-300 ${
                        isHovered ? 'opacity-100' : 'opacity-0'
                    }`}>
                        Logout
                    </span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;