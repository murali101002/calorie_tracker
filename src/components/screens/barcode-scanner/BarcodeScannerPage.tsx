import { useNavigate } from 'react-router-dom'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import type { FoodProduct } from '../../../types'

function mapOpenFoodFacts(raw: Record<string, unknown>): FoodProduct {
  const p = (raw as Record<string, unknown>) ?? {}
  const nutriments = (p.nutriments as Record<string, number>) ?? {}
  const sugarsVal = nutriments.sugars_100g ?? 0
  const sodiumVal = nutriments.sodium_100g ?? 0
  return {
    id: (p.code as string) ?? crypto.randomUUID(),
    name: (p.product_name as string) || 'Unknown Product',
    brand: (p.brands as string) || '',
    tagline: (p.quantity as string) || '',
    imageUrl: (p.image_url as string) || '',
    servingSize: 100,
    servingUnit: 'gram',
    calories: Math.round((nutriments['energy-kcal_100g'] as number) ?? (nutriments.energy_100g as number) ?? 0),
    protein: (nutriments.proteins_100g as number) ?? 0,
    carbs: (nutriments.carbohydrates_100g as number) ?? 0,
    fat: (nutriments.fat_100g as number) ?? 0,
    fiber: (nutriments.fiber_100g as number) ?? 0,
    sodium: Math.round(sodiumVal),
    sugars: Math.round(sugarsVal * 10) / 10,
    calcium: nutriments.calcium_100g != null ? `${Math.round(nutriments.calcium_100g)}% DV` : '',
    isFavorite: false,
  }
}

type ScannerTab = 'barcode' | 'vision' | 'recent'

export function BarcodeScannerPage() {
  const navigate = useNavigate()
  const [isScanning, setIsScanning] = useState(false)
  const [flashOn, setFlashOn] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<ScannerTab>('barcode')
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const startedRef = useRef(false)

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop() } catch { /* ok */ }
      try { await scannerRef.current.clear() } catch { /* ok */ }
      scannerRef.current = null
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
      await scanner.start(
        {
          facingMode: { ideal: 'environment' },
          width: { ideal: 3840 },
          height: { ideal: 2160 },
          aspectRatio: { ideal: 16 / 9 },
        },
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
              navigate('/food-detail', { state: { product } })
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
    } catch (err: unknown) {
      startedRef.current = false
      const msg = err instanceof Error ? err.message : 'Failed to start camera'
      if (msg.includes('NotAllowed') || msg.includes('Permission')) {
        setError('Camera permission denied')
      } else if (msg.includes('NotFound')) {
        setError('No camera found on this device')
      } else {
        setError(msg)
      }
    }
  }, [navigate, stopScanner])

  useEffect(() => {
    startScanner()
    return () => {
      startedRef.current = false
      stopScanner()
    }
  }, [startScanner, stopScanner])

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

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-none" />

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
          <p className="text-white font-bold text-[18px] drop-shadow-md tracking-wide">
            Point at barcode
          </p>
          <p className="text-gray-300 text-[14px] mt-2 max-w-[260px]">
            Align the barcode within the frame to scan automatically
          </p>
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
            onClick={() => navigate('/food/greek-yogurt')}
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
