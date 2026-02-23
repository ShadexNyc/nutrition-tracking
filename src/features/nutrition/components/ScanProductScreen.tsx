import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import { ROUTES } from '@/app/routes'
import { nutritionService } from '../services/nutritionService'
import { fetchProductByBarcode } from '../services/barcodeLookupService'
import type { Product } from '../types'
import { NativeButton } from '@/shared/components/NativeButton'
import { AddCircleIcon } from '@/shared/components/icons/AddCircleIcon'

const SCANNER_ELEMENT_ID = 'scan-product-reader'
const NO_BARCODE_ENABLE_MS = 5000

export function ScanProductScreen() {
  const navigate = useNavigate()
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [recognizedProduct, setRecognizedProduct] = useState<Product | null>(null)
  const [isRecognizing, setIsRecognizing] = useState(false)
  const [unrecognized, setUnrecognized] = useState(false)
  const [addButtonActive, setAddButtonActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const noBarcodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastScannedCodeRef = useRef<string | null>(null)

  const handleAddProduct = useCallback(() => {
    navigate(ROUTES.main, {
      state: { openAddFormWithProduct: recognizedProduct },
      replace: true,
    })
  }, [navigate, recognizedProduct])

  useEffect(() => {
    const el = document.getElementById(SCANNER_ELEMENT_ID)
    if (!el) return

    const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID)
    scannerRef.current = scanner

    const startScan = () => {
      setCameraError(null)
      scanner
        .start(
          { facingMode: 'environment' },
          { fps: 8, qrbox: undefined },
          async (decodedText) => {
            if (lastScannedCodeRef.current === decodedText) return
            lastScannedCodeRef.current = decodedText
            if (noBarcodeTimerRef.current) {
              clearTimeout(noBarcodeTimerRef.current)
              noBarcodeTimerRef.current = null
            }

            setIsRecognizing(true)
            setUnrecognized(false)
            setRecognizedProduct(null)

            let product: Product | null =
              await nutritionService.findProductByBarcode(decodedText)
            if (!product) {
              product = await fetchProductByBarcode(decodedText)
              if (product) {
                await nutritionService.saveProductWithBarcode({
                  ...product,
                  barcode: decodedText,
                })
              }
            }

            setIsRecognizing(false)
            if (product) {
              setRecognizedProduct(product)
              setUnrecognized(false)
            } else {
              setUnrecognized(true)
              setRecognizedProduct(null)
            }
            setAddButtonActive(true)
          },
          () => {}
        )
        .catch((err: Error) => {
          setCameraError(err?.message ?? 'Camera error')
          setAddButtonActive(true)
        })
    }

    startScan()

    noBarcodeTimerRef.current = setTimeout(() => {
      noBarcodeTimerRef.current = null
      if (!scannerRef.current?.isScanning) return
      setAddButtonActive(true)
    }, NO_BARCODE_ENABLE_MS)

    return () => {
      if (noBarcodeTimerRef.current) {
        clearTimeout(noBarcodeTimerRef.current)
        noBarcodeTimerRef.current = null
      }
      scanner
        .stop()
        .then(() => {
          scanner.clear()
          scannerRef.current = null
        })
        .catch(() => {})
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="relative flex-1 min-h-0">
        <div
          id={SCANNER_ELEMENT_ID}
          className="absolute inset-0 w-full h-full [&>div]:!w-full [&>div]:!h-full [& video]:!object-cover"
        />

        {cameraError && (
          <div className="absolute inset-0 flex items-center justify-center p-4 bg-black/80">
            <p className="text-white text-center">{cameraError}</p>
          </div>
        )}

        {unrecognized && (
          <div className="absolute top-4 left-4 right-4 rounded-2xl bg-black/90 px-4 py-3 text-center">
            <p className="text-white font-medium">Не опознали продукт</p>
          </div>
        )}

        <div className="absolute top-4 left-4">
          <button
            type="button"
            onClick={() => navigate(ROUTES.main, { replace: true })}
            className="h-10 px-4 rounded-xl bg-white/90 text-black font-medium"
          >
            Back
          </button>
        </div>
      </div>

      <div className="flex-shrink-0 p-4 pb-8 bg-black">
        <NativeButton
          type="button"
          onClick={handleAddProduct}
          disabled={!addButtonActive || isRecognizing}
          variant="cta"
          className="w-full h-[54px] flex items-center justify-center gap-2 rounded-[16px] text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <AddCircleIcon className="w-5 h-5 shrink-0" variant="outline" />
          <span>Добавить продукт</span>
        </NativeButton>
      </div>
    </div>
  )
}
