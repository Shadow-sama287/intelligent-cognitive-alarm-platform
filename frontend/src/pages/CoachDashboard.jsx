import React from 'react';
import { Users, AlertTriangle } from 'lucide-react';

export const CoachDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-black flex items-center gap-3">
        <Users className="w-8 h-8 text-indigo-400" /> Wellness Coach Portal
      </h1>

      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="text-black font-semibold flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-400" /> Flagged Client Anomalies
        </h3>
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs text-slate-400 uppercase bg-slate-900/50">
            <tr>
              <th className="p-3 text-white">Client Name</th>
              <th className="p-3 text-white">Avg Snooze Count</th>
              <th className="p-3 text-white">Flag Reason</th>
              <th className="p-3 text-white">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            <tr>
              <td className="p-3 font-semibold text-black">Alex Johnson</td>
              <td className="p-3 text-rose-400 font-bold">3.4 snoozes/day</td>
              <td className="p-3 text-black">Monday Morning Snooze Spike</td>
              <td className="p-3">
                <button className="px-3 py-1 bg-indigo-600 text-white rounded text-xs">Send Advice</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};