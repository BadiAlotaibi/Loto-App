
import React, { useState } from 'react';
import { Locker, LockerStatus } from '../types';

interface AdminPanelProps {
  onAddLocker: (locker: Omit<Locker, 'history'>) => void;
  onBulkDeploy: (prefix: string, start: number, end: number, location: string) => void;
  onSetStatus: (id: string, status: LockerStatus) => void;
  lockers: Locker[];
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onAddLocker, onBulkDeploy, onSetStatus, lockers }) => {
  const [activeTab, setActiveTab] = useState<'single' | 'bulk' | 'management'>('single');
  const [single, setSingle] = useState({ name: '', location: '' });
  const [bulk, setBulk] = useState({ prefix: 'L-', start: 1, end: 10, location: '' });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex border-b">
        {(['single', 'bulk', 'management'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-3 font-semibold capitalize transition-colors ${
              activeTab === tab ? 'bg-slate-50 text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="p-6">
        {activeTab === 'single' && (
          <div className="space-y-4 max-w-md">
            <h3 className="text-lg font-bold text-slate-800">Add Single Unit</h3>
            <input
              placeholder="Unit Name (e.g. L-101)"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={single.name}
              onChange={(e) => setSingle({ ...single, name: e.target.value })}
            />
            <input
              placeholder="Location (e.g. Pump Station A)"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={single.location}
              onChange={(e) => setSingle({ ...single, location: e.target.value })}
            />
            <button
              onClick={() => {
                onAddLocker({ id: crypto.randomUUID(), name: single.name, location: single.location, status: LockerStatus.OPEN, lastChangedAt: Date.now() });
                setSingle({ name: '', location: '' });
              }}
              className="w-full bg-slate-900 text-white py-2 rounded-lg font-bold hover:bg-slate-800 transition-colors"
            >
              Add Unit
            </button>
          </div>
        )}

        {activeTab === 'bulk' && (
          <div className="space-y-4 max-w-md">
            <h3 className="text-lg font-bold text-slate-800">Bulk Deploy Units</h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                placeholder="Prefix (L-)"
                className="px-4 py-2 border rounded-lg outline-none"
                value={bulk.prefix}
                onChange={(e) => setBulk({ ...bulk, prefix: e.target.value })}
              />
              <input
                placeholder="Location"
                className="px-4 py-2 border rounded-lg outline-none"
                value={bulk.location}
                onChange={(e) => setBulk({ ...bulk, location: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Start Range"
                className="px-4 py-2 border rounded-lg outline-none"
                value={bulk.start}
                onChange={(e) => setBulk({ ...bulk, start: parseInt(e.target.value) })}
              />
              <input
                type="number"
                placeholder="End Range"
                className="px-4 py-2 border rounded-lg outline-none"
                value={bulk.end}
                onChange={(e) => setBulk({ ...bulk, end: parseInt(e.target.value) })}
              />
            </div>
            <button
              onClick={() => onBulkDeploy(bulk.prefix, bulk.start, bulk.end, bulk.location)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
            >
              Deploy Range
            </button>
          </div>
        )}

        {activeTab === 'management' && (
          <div className="space-y-4 overflow-x-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Fleet Quick Status</h3>
              <p className="text-xs text-slate-500 italic">Overrides do not require authorization but are logged in report snapshot.</p>
            </div>
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-2 font-bold border-b text-slate-600">ID</th>
                  <th className="px-4 py-2 font-bold border-b text-slate-600">Location</th>
                  <th className="px-4 py-2 font-bold border-b text-slate-600">Status</th>
                  <th className="px-4 py-2 font-bold border-b text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {lockers.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2 border-b font-medium">{l.name}</td>
                    <td className="px-4 py-2 border-b text-slate-500">{l.location}</td>
                    <td className="px-4 py-2 border-b">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm border ${
                        l.status === LockerStatus.OPEN ? 'bg-green-100 text-green-700 border-green-200' :
                        l.status === LockerStatus.LOCKED ? 'bg-red-100 text-red-700 border-red-200' :
                        'bg-slate-200 text-slate-700 border-slate-300'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 border-b">
                      <select 
                        className="text-xs border-2 border-slate-200 rounded-lg p-1 font-bold outline-none focus:border-blue-500"
                        value={l.status}
                        onChange={(e) => onSetStatus(l.id, e.target.value as LockerStatus)}
                      >
                        <option value={LockerStatus.OPEN}>OPEN</option>
                        <option value={LockerStatus.LOCKED}>LOCKED</option>
                        <option value={LockerStatus.MISSING}>MISSING</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {lockers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-400">No units in fleet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
