import { Bell, Globe } from 'lucide-react';
import { useState } from 'react';
import logo from '../assets/iMery_Log_Main_1.png';

const Header = ({ onNavigateHome, language, onLanguageToggle, onNotificationClick }) => {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
            <div className="flex items-center justify-between px-4 py-3">
                {/* Logo */}
                <div
                    className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity"
                    onClick={onNavigateHome}
                >
                    <img src={logo} alt="iMery Icon" className="w-8 h-8 object-contain" />
                    <h1 className="text-2xl font-serif font-bold">iMery</h1>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-3">
                    {/* Language Toggle */}
                    <button
                        onClick={onLanguageToggle}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                        <Globe size={16} />
                        <span className={language === 'KO' ? 'font-bold' : 'font-normal'}>KO</span>
                        <span>/</span>
                        <span className={language === 'EN' ? 'font-bold' : 'font-normal'}>EN</span>
                    </button>

                    {/* Notification Bell with Badge */}
                    <button
                        onClick={onNotificationClick}
                        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <Bell size={22} />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
