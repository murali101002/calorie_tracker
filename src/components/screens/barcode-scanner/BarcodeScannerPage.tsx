import { useNavigate } from 'react-router-dom'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { mapOpenFoodFacts } from '../../../utils/mapOpenFoodFacts'

type ScannerTab = 'barcode' | 'vision' | 'recent'

export function BarcodeScannerPage() {
  const navigate = useNavigate()
  const [isScanning, setIsScanning] = useState(false)
  const [flashOn, setFlashOn] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [activeTab, setActiveTab] = useState<ScannerTab>('barcode')
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const startedRef = useRef(false)

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current
    if (scanner) {
      try { await scanner.stop() } catch { /* ok */ }
      try { await scanner.clear() } catch { /* ok */ }
      // Only clear ref if it still points to this scanner
      if (scannerRef.current === scanner) {
        scannerRef.current = null
      }
    }
    setIsScanning(false)
  }, [])

  const startScanner = useCallback(async () => {
    if (startedRef.current) return
    startedRef.current = true
    setError(null)
    try {
      const scanner = new Html5Qrcode('scanner-viewfinder')
      scannerRef.current = scanner
      // Use 1080p with fallback — 4K causes OverconstrainedError on most devices
      setConnecting(true)
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 260, height: 180 }, aspectRatio: 1.777 },
        async (decodedText: string) => {
          await stopScanner()
          try {
            const res = await fetch(
              `https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(decodedText)}.json`,
            )
            const json = await res.json()
            if (json.product) {
              const product = mapOpenFoodFacts(json.product)
              navigate('/food-detail', { state: { product, source: 'barcode' } })
            } else {
              setError('Product not found, try searching manually')
              setTimeout(() => {
                setError(null)
                startedRef.current = false
                startScanner()
              }, 2000)
            }
          } catch {
            setError('Network error, try again')
            setTimeout(() => {
              setError(null)
              startedRef.current = false
              startScanner()
            }, 2000)
          }
        },
        () => { /* scan frame processed, no action needed */ },
      )
      setIsScanning(true)
      setConnecting(false)
    } catch (err: unknown) {
      setConnecting(false)
      startedRef.current = false
      const msg = err instanceof Error ? (err.message || String(err)) : 'Failed to start camera'
      if (msg.includes('NotAllowed') || msg.includes('Permission')) {
        setError('Camera permission denied. Please allow camera access in your browser settings.')
      } else if (msg.includes('NotFound')) {
        setError('No camera found on this device.')
      } else if (msg.includes('Overconstrained') || msg.includes('constraint')) {
        setError('Camera resolution not supported. Trying default settings...')
      } else {
        setError(msg || 'Camera failed to start. Please try again.')
      }
    }
  }, [navigate, stopScanner])

  useEffect(() => {
    startScanner()
    return () => {
      startedRef.current = false
      stopScanner()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleFlash = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          advanced: [{ torch: !flashOn } as MediaTrackConstraints],
        },
      })
      stream.getTracks().forEach((t) => t.stop())
      setFlashOn((p) => !p)
    } catch { /* torch not supported */ }
  }, [flashOn])

  const tabs: { id: ScannerTab; label: string; icon: string }[] = [
    { id: 'barcode', label: 'Barcode', icon: 'barcode_scanner' },
    { id: 'vision', label: 'Vision', icon: 'fastfood' },
    { id: 'recent', label: 'Recent', icon: 'history' },
  ]

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden">
      {/* Camera viewfinder */}
      <div id="scanner-viewfinder" className="absolute inset-0" />

      {/* Overlay — subtle tint to keep UI readable without darkening camera feed */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      {/* Content layer */}
      <div className="relative z-10 flex flex-col h-full pointer-events-none">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pointer-events-auto">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-md active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-white text-[28px]">close</span>
          </button>
          <button
            type="button"
            onClick={toggleFlash}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-md active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-white text-[28px]">
              {flashOn ? 'flash_on' : 'flash_off'}
            </span>
          </button>
        </div>

        {/* Center: reticle + instructions */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative flex items-center gap-6">
            {/* Reticle */}
            <div className="relative w-[260px] h-[180px]">
              {/* Corner brackets - green #22c55e, 3px stroke, ~28px */}
              <div className="absolute top-0 left-0 w-7 h-7 border-t-[3px] border-l-[3px] border-[#22c55e] rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-7 h-7 border-t-[3px] border-r-[3px] border-[#22c55e] rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-7 h-7 border-b-[3px] border-l-[3px] border-[#22c55e] rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-7 h-7 border-b-[3px] border-r-[3px] border-[#22c55e] rounded-br-lg" />
              {/* Scan line */}
              {isScanning && (
                <div className="absolute left-0 w-full h-0.5 bg-[#22c55e] shadow-[0_0_8px_#22c55e] animate-scan-line" />
              )}
            </div>

            {/* Zoom indicator */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-1 h-24 bg-white/20 rounded-full relative overflow-hidden">
                <div className="absolute top-1/4 left-0 w-full h-1/2 bg-[#22c55e] rounded-full" />
              </div>
              <span className="material-symbols-outlined text-white/40 text-lg">zoom_in</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="flex flex-col items-center text-center px-8 pb-4">
          {connecting ? (
            <>
              <p className="text-white font-bold text-[18px] drop-shadow-md tracking-wide">
                Starting camera...
              </p>
              <p className="text-gray-300 text-[14px] mt-2 max-w-[260px]">
                Allow camera access when prompted
              </p>
            </>
          ) : (
            <>
              <p className="text-white font-bold text-[18px] drop-shadow-md tracking-wide">
                Point at barcode
              </p>
              <p className="text-gray-300 text-[14px] mt-2 max-w-[260px]">
                Align the barcode within the frame to scan automatically
              </p>
            </>
          )}
        </div>

        {/* Error toast */}
        {error && (
          <div className="mx-5 mb-2 px-4 py-3 bg-error/90 text-white text-sm rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="pointer-events-auto flex flex-col items-center pb-4">
          {/* Search manually button */}
          <button
            type="button"
            onClick={() => navigate('/search')}
            className="flex items-center justify-center gap-3 w-[calc(100%-32px)] h-14
              bg-[#22c55e] text-black font-semibold text-[16px] rounded-full shadow-lg
              active:scale-95 transition-transform mb-4"
          >
            <span className="material-symbols-outlined">search</span>
            Search manually
          </button>

          {/* Tab bar */}
          <div className="w-[calc(100%-32px)] h-16 rounded-2xl bg-black/20 backdrop-blur-md flex items-center justify-around px-2">
            {tabs.map((tab) => {
              const active = tab.id === activeTab
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-0.5 transition-colors ${
                    active ? 'text-white' : 'text-white/40'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-2xl"
                    style={{
                      fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
                    }}
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
        </div>
      </div>
    </div>
  )
}
