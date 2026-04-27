import { useEffect, useRef, useState, useCallback } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

interface UseBarcodeScannerOptions {
  onScan: (barcode: string) => void
  qrboxWidth?: number
  qrboxHeight?: number
}

export function useBarcodeScanner({
  onScan,
  qrboxWidth = 260,
  qrboxHeight = 180,
}: UseBarcodeScannerOptions) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [flashOn, setFlashOn] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const onScanRef = useRef(onScan)
  onScanRef.current = onScan

  const startScanning = useCallback(async () => {
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
        {
          fps: 10,
          qrbox: { width: qrboxWidth, height: qrboxHeight },
          aspectRatio: 1,
        },
        (decodedText: string) => {
          scanner.stop().catch(() => {})
          setIsScanning(false)
          onScanRef.current(decodedText)
        },
        () => {
          // onScanFailure — quiet, successful scan fires onScan
        },
      )
      setIsScanning(true)
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to start camera'
      if (msg.includes('NotAllowed') || msg.includes('Permission')) {
        setError('Camera permission denied. Please allow camera access.')
      } else if (msg.includes('NotFound')) {
        setError('No camera found. Try on a device with a camera.')
      } else {
        setError(msg)
      }
    }
  }, [qrboxWidth, qrboxHeight])

  const stopScanning = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
      } catch {
        // already stopped
      }
      try {
        await scannerRef.current.clear()
      } catch {
        // already cleared
      }
      scannerRef.current = null
      setIsScanning(false)
    }
  }, [])

  const toggleFlash = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          advanced: [{ torch: !flashOn } as any],
        },
      })
      stream.getTracks().forEach((t) => t.stop())
      setFlashOn((prev) => !prev)
    } catch {
      // torch not supported on this device
    }
  }, [flashOn])

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
        try { scannerRef.current.clear() } catch { /* ok */ }
      }
    }
  }, [])

  return { startScanning, stopScanning, isScanning, error, flashOn, toggleFlash }
}
