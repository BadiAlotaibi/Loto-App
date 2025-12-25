
import React, { useState, useEffect } from 'react';
import { AuthContext, LockerStatus } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (auth: AuthContext) => void;
  title: string;
  targetStatus: LockerStatus;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onConfirm, title, targetStatus }) => {
  const [auth, setAuth] = useState<AuthContext>({
    technician: localStorage.getItem('default_technician') || '',
    supervisor: localStorage.getItem('default_supervisor') || '',
    foreman: localStorage.getItem('default_foreman') || '',
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-pop-in">
        <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
            Changing unit status to <strong>{targetStatus}</strong> requires valid credentials.
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Technician Name</label>
            <input
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={auth.technician}
              onChange={(e) => setAuth({ ...auth, technician: e.target.value })}
              placeholder="Full Name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Supervisor Name</label>
            <input
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={auth.supervisor}
              onChange={(e) => setAuth({ ...auth, supervisor: e.target.value })}
              placeholder="Full Name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Operation Foreman</label>
            <input
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={auth.foreman}
              onChange={(e) => setAuth({ ...auth, foreman: e.target.value })}
              placeholder="Full Name"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
              Verify & Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
