import React from 'react';
import { Bell, User, AlarmClock } from 'lucide-react';

export const Navbar = () => {
    return (
        <nav className="h-16 border-b border-slate-800 glass-panel px-6 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-lg text-white">
                    <AlarmClock className="h-6 w-6" />
                </div>
                <span className="font-bold text-xl tracking-wide text-white">
                    Intelligent Cognitive Alarm
                </span>
            </div>
            <div className="flex items-center gap-4">
                <button className="p-2 text-slate-400 hover:text-white transition-colors">
                    <Bell className="h-5 w-5" />
                </button>
                <div className="h-8 w-8 rounded-full bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center text-indigo-300 font-semibold">
                    U
                </div>
            </div>
        </nav>
    );
};