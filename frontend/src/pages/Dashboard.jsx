import React from 'react';

export const Dashboard = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                    <p className="text-slate-400">Welcome back! Manage your active cognitive alarms.</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-indigo-500/20">
                    + Set New Alarm
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-2xl">
                    <h3 className="text-slate-400 text-sm font-medium">Next Alarm</h3>
                    <p className="text-4xl font-extrabold text-white mt-2">07:00 AM</p>
                    <span className="inline-block mt-3 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full border border-emerald-500/20">
                        Active • Math Challenge
                    </span>
                </div>

                <div className="glass-panel p-6 rounded-2xl">
                    <h3 className="text-slate-400 text-sm font-medium">Habit Score</h3>
                    <p className="text-4xl font-extrabold text-indigo-400 mt-2">88 / 100</p>
                    <p className="text-xs text-slate-500 mt-2">+4 points from last week</p>
                </div>

                <div className="glass-panel p-6 rounded-2xl">
                    <h3 className="text-slate-400 text-sm font-medium">Snooze Rate</h3>
                    <p className="text-4xl font-extrabold text-amber-400 mt-2">12%</p>
                    <p className="text-xs text-slate-500 mt-2">-5% reduction achieved</p>
                </div>
            </div>
        </div>
    );
};