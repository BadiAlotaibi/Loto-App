
import React, { useState, useEffect, useCallback } from 'react';
import { Locker, LockerStatus, AuthContext, HistoryEntry, ToastMessage } from './types';
import { Timer } from './components/Timer';
import { AuthModal } from './components/AuthModal';
import { AdminPanel } from './components/AdminPanel';
import { HistoryReport } from './components/HistoryReport';
import { Toast } from './components/Toast';
import { announceStatusChange } from './services/geminiService';

// Robust ID generator
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

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
    setToasts(prev => [...prev, { id: generateId(), message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleStatusChange = (lockerId: string, auth: AuthContext) => {
    if (!selectedLocker) return;
    
    setLockers(prev => prev.map(l => {
      if (l.id === lockerId) {
        const historyEntry: HistoryEntry = {
          id: generateId(),
          timestamp: Date.now(),
          fromStatus: l.status,
          toStatus: selectedLocker.target,
          ...auth
        };
        
        const updatedLocker = {
          ...l,
          status: selectedLocker.target,
          location: auth.location,
          lastChangedAt: Date.now(),
          history: [historyEntry, ...(l.history || [])]
        };

        announceStatusChange(l.name, selectedLocker.target, auth.technician);
        addToast(`${l.name} LOTO updated for ${auth.equipment}`, 'success');

        return updatedLocker;
      }
      return l;
    }));
    
    setSelectedLocker(null);
  };

  const deleteLocker = useCallback((id: string) => {
    setLockers(prev => {
      const filtered = prev.filter(l => l.id !== id);
      return filtered;
    });
    addToast('Locker removed from system.', 'info');
  }, []);

  const adminSetStatus = (id: string, status: LockerStatus) => {
    setLockers(prev => prev.map(l => l.id === id ? { ...l, status, lastChangedAt: Date.now() } : l));
    addToast(`Force override: ${status}`, 'info');
  };

  const currentLockerForAuth = selectedLocker ? lockers.find(l => l.id === selectedLocker.id) : null;

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg shadow-inner">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <h1 className="text-xl font-black tracking-tight">LOTO <span className="text-blue-400 font-medium">management</span></h1>
          </div>
          <nav className="flex gap-1 bg-slate-800 p-1 rounded-xl">
            {(['operational', 'admin', 'history'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                  view === v ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {v}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'operational' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-black text-slate-900">Operational Grid</h2>
                <p className="text-slate-500 mt-1">Real-time safety lockout status monitoring.</p>
              </div>
              <div className="flex gap-3 text-[10px] font-black uppercase tracking-widest">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg border border-green-200">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Open
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg border border-red-200">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Locked
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg border border-slate-200">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span> Missing
                </div>
              </div>
            </div>

            {lockers.length === 0 ? (
              <div className="bg-white border-4 border-dashed border-slate-200 rounded-3xl p-20 text-center">
                <div className="text-slate-200 mb-6 flex justify-center">
                   <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Operational Fleet Empty</h3>
                <p className="text-slate-500 mt-2 max-w-sm mx-auto">No units provisioned. Configure your fleet in the administration tab.</p>
                <button onClick={() => setView('admin')} className="mt-8 bg-blue-600 text-white px-10 py-3 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                  Go to Admin
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {lockers.map((locker) => (
                  <div 
                    key={locker.id}
                    className={`relative overflow-hidden group rounded-2xl border-4 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                      locker.status === LockerStatus.OPEN ? 'bg-green-50 border-green-500 shadow-green-100' :
                      locker.status === LockerStatus.LOCKED ? 'bg-red-50 border-red-500 shadow-red-100' :
                      'bg-slate-100 border-slate-400 opacity-90'
                    }`}
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black text-slate-900 tracking-tight">{locker.name}</span>
                        </div>
                        <Timer startTime={locker.lastChangedAt} />
                      </div>
                      
                      <div className="mb-6 space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Site</span>
                        <p className="text-slate-800 font-bold truncate leading-tight">{locker.location === 'Not Specified' ? '--' : locker.location}</p>
                        {locker.history?.[0] && (
                          <div className="text-[10px] text-slate-500 italic truncate font-medium">
                             Job: {locker.history[0].equipment}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          disabled={locker.status === LockerStatus.OPEN}
                          onClick={() => setSelectedLocker({ id: locker.id, target: LockerStatus.OPEN })}
                          className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            locker.status === LockerStatus.OPEN 
                            ? 'bg-green-100 text-green-800 cursor-not-allowed border-b-2 border-green-200' 
                            : 'bg-green-600 text-white hover:bg-green-700 shadow-md border-b-4 border-green-800 active:border-b-0 active:translate-y-1'
                          }`}
                        >
                          RELEASE
                        </button>
                        <button
                          disabled={locker.status === LockerStatus.LOCKED}
                          onClick={() => setSelectedLocker({ id: locker.id, target: LockerStatus.LOCKED })}
                          className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            locker.status === LockerStatus.LOCKED 
                            ? 'bg-red-100 text-red-800 cursor-not-allowed border-b-2 border-red-200' 
                            : 'bg-red-600 text-white hover:bg-red-700 shadow-md border-b-4 border-red-800 active:border-b-0 active:translate-y-1'
                          }`}
                        >
                          LOCKOUT
                        </button>
                      </div>
                    </div>
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
              onAddLocker={(l) => setLockers(prev => [...prev, { ...l, id: generateId(), history: [] }])}
              onDeleteLocker={deleteLocker}
              onSetStatus={adminSetStatus}
            />
          </div>
        )}

        {view === 'history' && (
          <HistoryReport lockers={lockers} />
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-3 px-4 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex gap-4">
            <div className="hidden md:flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Units Active</span>
              <span className="text-sm font-black text-slate-900">{lockers.length}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setView('history')} className="bg-slate-100 hover:bg-slate-200 text-slate-900 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all">
              Reports
            </button>
          </div>
        </div>
      </footer>

      <AuthModal 
        isOpen={!!selectedLocker}
        onClose={() => setSelectedLocker(null)}
        onConfirm={(auth) => handleStatusChange(selectedLocker!.id, auth)}
        title={`LOTO Action: Unit ${currentLockerForAuth?.name}`}
        targetStatus={selectedLocker?.target || LockerStatus.OPEN}
        currentLocation={currentLockerForAuth?.location || ''}
      />

      <Toast toasts={toasts} onRemove={removeToast} />

      <style>{`
        @keyframes slide-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes pop-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-slide-in { animation: slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-pop-in { animation: pop-in 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

export default App;
