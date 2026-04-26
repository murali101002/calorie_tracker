import { create } from 'zustand'

type ScannerTab = 'barcode' | 'vision' | 'recent'

interface ScannerState {
  isActive: boolean
  isScanning: boolean
  activeTab: ScannerTab
  lastScanResult: string | null
  flashOn: boolean

  startScanning: () => void
  stopScanning: () => void
  setActiveTab: (tab: ScannerTab) => void
  setResult: (code: string) => void
  toggleFlash: () => void
  reset: () => void
}

export const useScannerStore = create<ScannerState>()((set) => ({
  isActive: false,
  isScanning: false,
  activeTab: 'barcode',
  lastScanResult: null,
  flashOn: false,

  startScanning: () => set({ isActive: true, isScanning: true }),
  stopScanning: () => set({ isScanning: false }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setResult: (code) => set({ lastScanResult: code, isScanning: false }),
  toggleFlash: () => set((s) => ({ flashOn: !s.flashOn })),
  reset: () =>
    set({
      isActive: false,
      isScanning: false,
      lastScanResult: null,
      flashOn: false,
    }),
}))
