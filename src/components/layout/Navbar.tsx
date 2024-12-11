import React from 'react';
// import NotificationBell from '/NotificationBell'; // Adjust the import path as needed
// import { Bell } from 'lucide-react';
import NotificationBell from "../../pages/auth/NotificationBell.tsx";

interface NavbarProps {
    username?: string;
}

const Navbar = ({ username = 'Guest' }: NavbarProps) => {
    return (
        <div className="h-16 bg-blue-600 text-white px-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold"></h1>
            {/* Add any additional navbar elements here */}
            <NotificationBell username={username} />
        </div>
    );
};

export default Navbar;