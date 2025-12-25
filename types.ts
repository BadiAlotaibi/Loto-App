
export enum LockerStatus {
  OPEN = 'OPEN',
  LOCKED = 'LOCKED',
  MISSING = 'MISSING'
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  fromStatus: LockerStatus;
  toStatus: LockerStatus;
  technician: string;
  supervisor: string;
  foreman: string;
}

export interface Locker {
  id: string;
  name: string;
  location: string;
  status: LockerStatus;
  lastChangedAt: number;
  history: HistoryEntry[];
}

export interface AuthContext {
  technician: string;
  supervisor: string;
  foreman: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
