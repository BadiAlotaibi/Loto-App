
import React, { useState, useEffect, useCallback } from 'react';
import { Locker, LockerStatus, AuthContext, HistoryEntry, ToastMessage } from './types';
import { Timer } from './components/Timer';
import { AuthModal } from './components/AuthModal';
import { AdminPanel } from './components/AdminPanel';
import { HistoryReport } from './components/HistoryReport';
import { Toast } from './components/Toast';
import { announceStatusChange } from './services/geminiService';

const App: React.FC = () => {
  const [lockers, setLockers] = useState<Locker[]>(() => {
    const saved = localStorage.getItem('lockers_data');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [view, setView] = useState<'operational' | 'admin' | 'history'>('operational');
  const [selectedLocker, setSelectedLocker] = useState<{ id: string, target: LockerStatus } | null>(null);

  useEffect(() => {
    localStorage.setItem('lockers_data', JSON.stringify(lockers));
  }, [lockers]);

  const addToast = (message: string, type: ToastMessage['type'] = 'info') => {
    setToasts(prev => [...prev, { id: crypto.randomUUID(), message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleStatusChange = (lockerId: string, auth: AuthContext) => {
    if (!selectedLocker) return;
    
    setLockers(prev => prev.map(l => {
      if (l.id === lockerId) {
        const historyEntry: HistoryEntry = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          fromStatus: l.status,
          toStatus: selectedLocker.target,
          ...auth
        };
        
        const updatedLocker = {
          ...l,
          status: selectedLocker.target,
          lastChangedAt: Date.now(),
          history: [historyEntry, ...(l.history || [])]
        };

        // Trigger Voice Feedback
        announceStatusChange(l.name, selectedLocker.target, auth.technician);
        addToast(`${l.name} updated to ${selectedLocker.target} by ${auth.technician}`, 'success');

        return updatedLocker;
      }
      return l;
    }));
    
    setSelectedLocker(null);
  };

  const bulkDeploy = (prefix: string, start: number, end: number, location: string) => {
    const newLockers: Locker[] = [];
    for (let i = start; i <= end; i++) {
      const name = `${prefix}${i.toString().padStart(2, '0')}`;
      newLockers.push({
        id: crypto.randomUUID(),
        name,
        location,
        status: LockerStatus.OPEN,
        lastChangedAt: Date.now(),
        history: []
      });
    }
    setLockers(prev => [...prev, ...newLockers]);
    addToast(`Bulk deployed ${newLockers.length} units to ${location}`, 'success');
  };

  const adminSetStatus = (id: string, status: LockerStatus) => {
    setLockers(prev => prev.map(l => l.id === id ? { ...l, status, lastChangedAt: Date.now() } : l));
    addToast(`Status override applied for unit ID: ${id}`, 'info');
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">LockGuard <span className="text-blue-400">Fleet</span></h1>
          </div>
          <nav className="flex gap-1 bg-slate-800 p-1 rounded-xl">
            {(['operational', 'admin', 'history'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  view === v ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'operational' && (
          <div>
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-900">Operational Grid</h2>
                <p className="text-slate-500 mt-1">Real-time status monitoring and lock management.</p>
              </div>
              <div className="flex gap-4 text-xs font-bold uppercase tracking-wider">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span> Open</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span> Locked</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-slate-400"></span> Missing</div>
              </div>
            </div>

            {lockers.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-16 text-center">
                <div className="text-slate-400 mb-4 flex justify-center">
                   <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-700">No units provisioned</h3>
                <p className="text-slate-500 mt-2">Head over to the Admin tab to deploy your first set of lockouts.</p>
                <button 
                  onClick={() => setView('admin')}
                  className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                  Configure Fleet
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {lockers.map((locker) => (
                  <div 
                    key={locker.id}
                    className={`relative overflow-hidden group rounded-2xl border-4 transition-all duration-300 hover:shadow-2xl ${
                      locker.status === LockerStatus.OPEN ? 'bg-green-50 border-green-500 shadow-green-100' :
                      locker.status === LockerStatus.LOCKED ? 'bg-red-50 border-red-500 shadow-red-100' :
                      'bg-slate-100 border-slate-400 opacity-90 shadow-slate-100'
                    }`}
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full animate-pulse shadow-sm ${
                            locker.status === LockerStatus.OPEN ? 'bg-green-600' :
                            locker.status === LockerStatus.LOCKED ? 'bg-red-600' :
                            'bg-slate-600'
                          }`}></div>
                          <span className="text-2xl font-black text-slate-900 tracking-tight">{locker.name}</span>
                        </div>
                        <Timer startTime={locker.lastChangedAt} />
                      </div>
                      
                      <div className="mb-6">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Location</span>
                        <p className="text-slate-800 font-bold truncate">{locker.location}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          disabled={locker.status === LockerStatus.OPEN}
                          onClick={() => setSelectedLocker({ id: locker.id, target: LockerStatus.OPEN })}
                          className={`py-2 rounded-lg text-sm font-bold transition-all ${
                            locker.status === LockerStatus.OPEN 
                            ? 'bg-green-200 text-green-800 cursor-not-allowed border-b-4 border-green-300' 
                            : 'bg-green-600 text-white hover:bg-green-700 shadow-md shadow-green-200 active:translate-y-0.5 border-b-4 border-green-800'
                          }`}
                        >
                          OPEN
                        </button>
                        <button
                          disabled={locker.status === LockerStatus.LOCKED}
                          onClick={() => setSelectedLocker({ id: locker.id, target: LockerStatus.LOCKED })}
                          className={`py-2 rounded-lg text-sm font-bold transition-all ${
                            locker.status === LockerStatus.LOCKED 
                            ? 'bg-red-200 text-red-800 cursor-not-allowed border-b-4 border-red-300' 
                            : 'bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-200 active:translate-y-0.5 border-b-4 border-red-800'
                          }`}
                        >
                          LOCK
                        </button>
                      </div>
                    </div>
                    
                    {/* Visual state indicator strip */}
                    <div className={`h-1.5 w-full ${
                      locker.status === LockerStatus.OPEN ? 'bg-green-600' :
                      locker.status === LockerStatus.LOCKED ? 'bg-red-600' :
                      'bg-slate-600'
                    }`}></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'admin' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-black text-slate-900 mb-8">Fleet Administration</h2>
            <AdminPanel 
              lockers={lockers}
              onAddLocker={(l) => setLockers(prev => [...prev, { ...l, history: [] }])}
              onBulkDeploy={bulkDeploy}
              onSetStatus={adminSetStatus}
            />
          </div>
        )}

        {view === 'history' && (
          <HistoryReport lockers={lockers} />
        )}
      </main>

      {/* Floating Action Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-3 px-4 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex gap-4">
            <div className="hidden md:flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Active Fleet Size</span>
              <span className="text-sm font-bold text-slate-900">{lockers.length} Units</span>
            </div>
            <div className="hidden md:flex flex-col border-l pl-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase">System Status</span>
              <span className="text-sm font-bold text-green-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setView('history')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-900 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              View Reports
            </button>
            <button 
              onClick={() => {
                const csvContent = lockers.map(l => `${l.name},${l.location},${l.status}`).join('\n');
                const blob = new Blob([`Name,Location,Status\n${csvContent}`], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'fleet_snapshot.csv';
                a.click();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-100"
            >
              Snapshot Report
            </button>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={!!selectedLocker}
        onClose={() => setSelectedLocker(null)}
        onConfirm={(auth) => handleStatusChange(selectedLocker!.id, auth)}
        title={`Authorize ${selectedLocker?.target === LockerStatus.OPEN ? 'Unlock' : 'Lockout'}`}
        targetStatus={selectedLocker?.target || LockerStatus.OPEN}
      />

      <Toast toasts={toasts} onRemove={removeToast} />

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes pop-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
        .animate-pop-in { animation: pop-in 0.2s ease-out; }
      `}</style>
    </div>
  );
};

export default App;
