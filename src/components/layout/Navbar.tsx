import React from 'react';
import { Bell } from 'lucide-react';

interface NavbarProps {
    username?: string;
}

const Navbar = ({ username = 'Guest' }: NavbarProps) => {
    return (
        <div className="h-16 bg-blue-600 text-white px-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold"></h1>
            <div className="flex items-center gap-4">
                <Bell className="w-5 h-5 cursor-pointer"/>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"/>
                    <div>
                        <div className="text-sm font-medium">{username}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;