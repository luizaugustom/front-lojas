import { create } from 'zustand';

interface DeviceState {
  // Scanner status
  scannerActive: boolean;
  scanSuccess: boolean;
  barcodeBuffer: string;
  setScannerActive: (active: boolean) => void;
  setScanSuccess: (success: boolean) => void;
  // Aceita string direta ou atualizador funcional
  setBarcodeBuffer: (buffer: string | ((prev: string) => string)) => void;
  
  // Printer status
  printerStatus: 'checking' | 'connected' | 'disconnected' | 'error';
  printerName: string | null;
  setPrinterStatus: (status: 'checking' | 'connected' | 'disconnected' | 'error') => void;
  setPrinterName: (name: string | null) => void;
}

export const useDeviceStore = create<DeviceState>((set) => ({
  // Scanner
  scannerActive: false,
  scanSuccess: false,
  barcodeBuffer: '',
  setScannerActive: (active) => set({ scannerActive: active }),
  setScanSuccess: (success) => set({ scanSuccess: success }),
  setBarcodeBuffer: (buffer) =>
    set((state) => ({
      barcodeBuffer:
        typeof buffer === 'function' ? (buffer as (prev: string) => string)(state.barcodeBuffer) : buffer,
    })),
  
  // Printer
  printerStatus: 'checking',
  printerName: null,
  setPrinterStatus: (status) => set({ printerStatus: status }),
  setPrinterName: (name) => set({ printerName: name }),
}));

