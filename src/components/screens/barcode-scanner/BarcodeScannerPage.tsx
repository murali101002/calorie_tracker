import { useNavigate } from 'react-router-dom'
import { useCallback } from 'react'
import { useScannerStore } from '../../../stores/useScannerStore'

type ScannerTab = 'barcode' | 'vision' | 'recent'

export function BarcodeScannerPage() {
  const navigate = useNavigate()
  const isScanning = useScannerStore((s) => s.isScanning)
  const flashOn = useScannerStore((s) => s.flashOn)
  const toggleFlash = useScannerStore((s) => s.toggleFlash)
  const startScanning = useScannerStore((s) => s.startScanning)
  const stopScanning = useScannerStore((s) => s.stopScanning)
  const activeTab = useScannerStore((s) => s.activeTab)
  const setActiveTab = useScannerStore((s) => s.setActiveTab)

  const handleMockScan = useCallback(() => {
    startScanning()
    setTimeout(() => {
      stopScanning()
      navigate('/food/greek-yogurt')
    }, 2000)
  }, [startScanning, stopScanning, navigate])

  const tabs: { id: ScannerTab; label: string; icon: string }[] = [
    { id: 'barcode', label: 'Barcode', icon: 'barcode_scanner' },
    { id: 'vision', label: 'Vision', icon: 'fastfood' },
    { id: 'recent', label: 'Recent', icon: 'history' },
  ]

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden h-screen w-screen font-body-md text-white">
      {/* Background image */}
      <div className="fixed inset-0 z-0">
        <img
          alt=""
          className="w-full h-full object-cover opacity-80"
          src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=1200&fit=crop"
        />
      </div>

      {/* Foreground overlay */}
      <div className="fixed inset-0 z-10 flex flex-col items-center"
           style={{ background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(2px)' }}>

        {/* Header */}
        <header className="w-full h-20 px-4 flex items-center justify-between z-20">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-12 h-12 flex items-center justify-center rounded-full
              bg-black/30 backdrop-blur-md text-white active:scale-95 transition-transform cursor-pointer"
          >
            <span className="material-symbols-outlined text-[28px]">close</span>
          </button>
          <button
            type="button"
            onClick={toggleFlash}
            className="w-12 h-12 flex items-center justify-center rounded-full
              bg-black/30 backdrop-blur-md text-white active:scale-95 transition-transform cursor-pointer"
          >
            <span className="material-symbols-outlined text-[28px]">
              {flashOn ? 'flashlight_on' : 'flashlight_off'}
            </span>
          </button>
        </header>

        {/* Center - reticle + instructions */}
        <div className="flex-1 w-full flex flex-col items-center justify-center">
          <div className="z-20 relative flex flex-col items-center">
            {/* Reticle */}
            <div className="relative w-[260px] h-[200px]">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary-container rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary-container rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary-container rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary-container rounded-br-xl" />
              {/* Scan line */}
              <div
                className={`absolute left-0 w-full h-0.5 bg-primary-container shadow-[0_0_12px_#22c55e]
                  ${isScanning ? 'animate-scan-line' : ''}`}
              />
            </div>

            {/* Instructions */}
            <div className="mt-8 text-center px-8">
              <p className="text-label-lg text-white drop-shadow-md tracking-wide">
                Point at barcode
              </p>
              <p className="text-body-md text-white/70 mt-2 max-w-[240px]">
                Align the barcode within the frame to scan automatically
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="w-full h-40 flex flex-col items-center justify-start z-20">
          <button
            type="button"
            onClick={() => navigate('/food/greek-yogurt')}
            className="flex items-center gap-3 px-8 py-4 rounded-full bg-primary-container
              text-white font-semibold shadow-lg active:scale-95 transition-transform mb-6 cursor-pointer"
          >
            <span className="material-symbols-outlined">search</span>
            Search manually
          </button>

          <div className="flex gap-12 text-white/50">
            {tabs.map((tab) => {
              const active = tab.id === activeTab
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-1 cursor-pointer ${
                    active ? '!text-white' : ''
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-2xl"
                    style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {tab.icon}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {tab.label}
                  </span>
                </button>
              )
            })}
          </div>
        </footer>
      </div>

      {/* Zoom indicator right edge */}
      <div className="fixed top-1/2 right-4 transform -translate-y-1/2 flex flex-col gap-6 z-20">
        <div className="w-1.5 h-32 bg-white/20 rounded-full relative overflow-hidden">
          <div className="absolute top-1/4 left-0 w-full h-1/2 bg-primary-container rounded-full" />
        </div>
        <span className="material-symbols-outlined text-white/40">zoom_in</span>
      </div>

      {/* Dev mock scan */}
      <button
        type="button"
        onClick={handleMockScan}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 h-10 px-6 rounded-lg
          border border-white/20 text-white/60 text-body-sm
          hover:bg-white/10 transition-colors cursor-pointer"
      >
        [Dev] Simulate Scan
      </button>
    </div>
  )
}
