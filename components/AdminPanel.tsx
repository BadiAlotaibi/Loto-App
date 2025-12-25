
import React, { useState } from 'react';
import { Locker, LockerStatus } from '../types';

interface AdminPanelProps {
  onAddLocker: (locker: Omit<Locker, 'id' | 'history'>) => void;
  onDeleteLocker: (id: string) => void;
  onSetStatus: (id: string, status: LockerStatus) => void;
  lockers: Locker[];
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onAddLocker, onDeleteLocker, onSetStatus, lockers }) => {
  const [activeTab, setActiveTab] = useState<'add' | 'management'>('add');
  const [lockerNumber, setLockerNumber] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = () => {
    const trimmed = lockerNumber.trim();
    if (!trimmed) return;
    onAddLocker({ 
      name: trimmed, 
      location: 'Not Specified', 
      status: LockerStatus.OPEN, 
      lastChangedAt: Date.now() 
    });
    setLockerNumber('');
    setActiveTab('management');
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-pop-in">
      <div className="flex border-b bg-slate-50">
        {(['add', 'management'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setDeletingId(null); }}
            className={`flex-1 px-4 py-4 font-black text-xs uppercase tracking-widest transition-all ${
              activeTab === tab ? 'bg-white text-blue-600 border-b-4 border-blue-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab === 'add' ? 'Add Locker' : 'Management Table'}
          </button>
        ))}
      </div>

      <div className="p-8">
        {activeTab === 'add' && (
          <div className="space-y-6 max-w-md mx-auto py-12">
            <div className="text-center space-y-2">
              <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
              </div>
              <h3 className="text-2xl font-black text-slate-900">New Lock</h3>
              <p className="text-sm text-slate-500">Enter the unique LOTO locker identifier.</p>
            </div>
            <div className="space-y-3">
              <input
                placeholder="e.g. 101, UNIT-A"
                className="w-full px-5 py-4 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-xl font-black text-center"
                value={lockerNumber}
                onChange={(e) => setLockerNumber(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                autoFocus
              />
              <button
                onClick={handleAdd}
                disabled={!lockerNumber.trim()}
                className="w-full bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl disabled:opacity-50"
              >
                Deploy Unit
              </button>
            </div>
          </div>
        )}

        {activeTab === 'management' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Fleet Overview</h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                {lockers.length} Registered
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-100">
                    <th className="px-4 py-4 font-black text-slate-400 uppercase text-[10px] tracking-widest">ID / Name</th>
                    <th className="px-4 py-4 font-black text-slate-400 uppercase text-[10px] tracking-widest">Status</th>
                    <th className="px-4 py-4 font-black text-slate-400 uppercase text-[10px] tracking-widest">Override</th>
                    <th className="px-4 py-4 font-black text-slate-400 uppercase text-[10px] tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {lockers.map((l) => (
                    <tr key={l.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-5 font-black text-slate-900 text-base">{l.name}</td>
                      <td className="px-4 py-5">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                          l.status === LockerStatus.OPEN ? 'bg-green-50 text-green-700 border-green-100' :
                          l.status === LockerStatus.LOCKED ? 'bg-red-50 text-red-700 border-red-100' :
                          'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="px-4 py-5">
                        <select 
                          className="text-[10px] border-2 border-slate-200 rounded-lg p-1.5 font-black uppercase outline-none focus:border-blue-500 bg-white"
                          value={l.status}
                          onChange={(e) => onSetStatus(l.id, e.target.value as LockerStatus)}
                        >
                          <option value={LockerStatus.OPEN}>OPEN</option>
                          <option value={LockerStatus.LOCKED}>LOCKED</option>
                          <option value={LockerStatus.MISSING}>MISSING</option>
                        </select>
                      </td>
                      <td className="px-4 py-5 text-right">
                        {deletingId === l.id ? (
                          <div className="flex justify-end gap-2 animate-pop-in">
                            <button 
                              onClick={() => onDeleteLocker(l.id)} 
                              className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-red-700"
                            >
                              Confirm
                            </button>
                            <button 
                              onClick={() => setDeletingId(null)} 
                              className="bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-slate-300"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeletingId(l.id)}
                            className="text-slate-300 hover:text-red-600 p-2 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete Locker"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {lockers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-20 text-center text-slate-400 italic">Fleet is empty. Provision a unit to begin.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
