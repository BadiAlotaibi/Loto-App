
import React, { useState } from 'react';
import { AuthContext, LockerStatus } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (auth: AuthContext) => void;
  title: string;
  targetStatus: LockerStatus;
  currentLocation: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onConfirm, title, targetStatus, currentLocation }) => {
  const [auth, setAuth] = useState<AuthContext>({
    technician: localStorage.getItem('default_technician') || '',
    supervisor: localStorage.getItem('default_supervisor') || '',
    foreman: localStorage.getItem('default_foreman') || '',
    equipment: '',
    operator: '',
    location: currentLocation,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('default_technician', auth.technician);
    localStorage.setItem('default_supervisor', auth.supervisor);
    localStorage.setItem('default_foreman', auth.foreman);
    onConfirm(auth);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-pop-in">
        <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
            Changing unit status to <strong>{targetStatus}</strong> requires safety verification.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 border-b pb-1">Personnel</h3>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Technician</label>
                <input
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={auth.technician}
                  onChange={(e) => setAuth({ ...auth, technician: e.target.value })}
                  placeholder="Lock Installer/Remover"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Supervisor</label>
                <input
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={auth.supervisor}
                  onChange={(e) => setAuth({ ...auth, supervisor: e.target.value })}
                  placeholder="Verification Auth"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Operations Foreman</label>
                <input
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={auth.foreman}
                  onChange={(e) => setAuth({ ...auth, foreman: e.target.value })}
                  placeholder="Final Release Auth"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 border-b pb-1">Operation Details</h3>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Equipment Name/ID</label>
                <input
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={auth.equipment}
                  onChange={(e) => setAuth({ ...auth, equipment: e.target.value })}
                  placeholder="e.g. Pump-01, Motor-B"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Operator Name</label>
                <input
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={auth.operator}
                  onChange={(e) => setAuth({ ...auth, operator: e.target.value })}
                  placeholder="Affected Operator"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Work Location</label>
                <input
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={auth.location}
                  onChange={(e) => setAuth({ ...auth, location: e.target.value })}
                  placeholder="Specific Site/Area"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-300 rounded-xl font-bold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
            >
              Confirm LOTO Action
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
