
import React from 'react';
import { Locker, HistoryEntry } from '../types';

interface HistoryReportProps {
  lockers: Locker[];
}

export const HistoryReport: React.FC<HistoryReportProps> = ({ lockers }) => {
  const allHistory: (HistoryEntry & { unitName: string })[] = lockers.flatMap(l => 
    l.history.map(h => ({ ...h, unitName: l.name }))
  ).sort((a, b) => b.timestamp - a.timestamp);

  const downloadCSV = () => {
    const headers = ['Timestamp', 'Unit', 'From', 'To', 'Technician', 'Supervisor', 'Foreman'];
    const rows = allHistory.map(h => [
      new Date(h.timestamp).toLocaleString(),
      h.unitName,
      h.fromStatus,
      h.toStatus,
      h.technician,
      h.supervisor,
      h.foreman
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `loto_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden mt-8">
      <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          Operational History Report
        </h2>
        <button 
          onClick={downloadCSV}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          Export CSV
        </button>
      </div>
      <div className="overflow-x-auto max-h-[500px]">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-slate-100 z-10 shadow-sm">
            <tr>
              <th className="px-6 py-3 font-bold border-b text-slate-700">Date/Time</th>
              <th className="px-6 py-3 font-bold border-b text-slate-700">Unit ID</th>
              <th className="px-6 py-3 font-bold border-b text-slate-700">Transition</th>
              <th className="px-6 py-3 font-bold border-b text-slate-700">Authorized By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {allHistory.map((h) => (
              <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 mono text-xs whitespace-nowrap">
                  {new Date(h.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 font-bold text-slate-900">{h.unitName}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{h.fromStatus}</span>
                    <svg className="w-3 h-3 text-slate-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                    <span className={`font-bold ${h.toStatus === 'LOCKED' ? 'text-red-600' : h.toStatus === 'OPEN' ? 'text-green-600' : 'text-slate-500'}`}>{h.toStatus}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-800">{h.technician} (Tech)</span>
                    <span className="text-xs text-slate-500">Sup: {h.supervisor} | For: {h.foreman}</span>
                  </div>
                </td>
              </tr>
            ))}
            {allHistory.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">No events recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
