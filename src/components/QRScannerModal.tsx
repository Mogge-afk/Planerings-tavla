import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Camera, 
  Barcode, 
  Sparkles, 
  AlertCircle, 
  Search, 
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { ProductionOrder, ColumnConfig } from '../types';
import { extractScanPayload } from '../utils/qr';
import { playScanSuccessSound } from '../utils/audio';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderIdentified: (orderId: string, stationId?: string) => void;
  allOrders: ProductionOrder[];
  columns: ColumnConfig[];
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onOrderIdentified,
  allOrders,
  columns,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'barcode' | 'simulator'>('camera');
  const [manualInput, setManualInput] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [simulatorSearch, setSimulatorSearch] = useState('');
  const [selectedStationFilter, setSelectedStationFilter] = useState<string>('all');
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'interactive-qr-reader';

  // Start Camera Scanner when camera tab is active
  useEffect(() => {
    if (!isOpen || activeTab !== 'camera') {
      stopCamera();
      return;
    }

    let isMounted = true;

    const startScanner = async () => {
      try {
        setCameraError(null);
        await new Promise((resolve) => setTimeout(resolve, 200));
        if (!isMounted) return;

        const html5QrCode = new Html5Qrcode(scannerContainerId);
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            playScanSuccessSound();
            const { orderId, stationId } = extractScanPayload(decodedText);
            stopCamera();
            onOrderIdentified(orderId, stationId);
          },
          () => {
            // ignore scan frame misses
          }
        );
        if (isMounted) setIsScanning(true);
      } catch (err: unknown) {
        console.warn('Camera scan initialization failed:', err);
        if (isMounted) {
          setCameraError(
            'Kunde inte starta kameran. Kontrollera behörigheter eller använd handskanner / snabbtestet.'
          );
          setIsScanning(false);
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [isOpen, activeTab]);

  const stopCamera = () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().then(() => {
            scannerRef.current?.clear();
          }).catch(() => {});
        } else {
          scannerRef.current.clear();
        }
      } catch {
        // ignore cleanup error
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleManualSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const { orderId, stationId } = extractScanPayload(manualInput);
    if (!orderId) return;

    playScanSuccessSound();
    onOrderIdentified(orderId, stationId);
    setManualInput('');
  };

  const handleSimulatorSelect = (orderId: string, stationId?: string) => {
    playScanSuccessSound();
    onOrderIdentified(orderId, stationId);
  };

  const filteredOrders = allOrders.filter(
    (o) =>
      o.id.toLowerCase().includes(simulatorSearch.toLowerCase()) ||
      o.title.toLowerCase().includes(simulatorSearch.toLowerCase()) ||
      o.customer.toLowerCase().includes(simulatorSearch.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border-2 border-neutral-900 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="px-5 py-4 border-b-2 border-neutral-900 bg-neutral-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight uppercase font-sans">
                Skanna QR-kod / Följesedel
              </h2>
              <p className="text-xs text-neutral-400">
                Skanna produkt- och stationsbunden QR för att rapportera Antal & Totalt
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 pb-2 border-b border-neutral-200 bg-neutral-50 flex gap-2">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'camera'
                ? 'bg-neutral-950 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            Kamera (Mobil)
          </button>
          <button
            onClick={() => setActiveTab('barcode')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'barcode'
                ? 'bg-neutral-950 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200'
            }`}
          >
            <Barcode className="w-4 h-4" />
            Handskanner (USB)
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Snabbtest (Simulera)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {/* TAB 1: Camera */}
          {activeTab === 'camera' && (
            <div className="flex flex-col items-center">
              <div className="w-full max-w-[340px] aspect-square bg-neutral-950 rounded-xl overflow-hidden relative border-2 border-neutral-900 flex items-center justify-center">
                <div id={scannerContainerId} className="w-full h-full" />
                
                {/* Visual reticle */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-emerald-400 rounded-lg relative">
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-emerald-400" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-emerald-400" />
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-emerald-400" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-emerald-400" />
                  </div>
                </div>
              </div>

              {cameraError ? (
                <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5 max-w-md">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">{cameraError}</p>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => setActiveTab('simulator')}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-medium cursor-pointer"
                      >
                        Välj i testlistan
                      </button>
                      <button
                        onClick={() => setActiveTab('barcode')}
                        className="px-2.5 py-1 bg-white border border-rose-300 text-rose-900 rounded font-medium cursor-pointer"
                      >
                        Skriv in ordernr
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-neutral-500 mt-3 text-center">
                  Rikta kameran mot QR-koden på följesedeln för den specifika stationen.
                </p>
              )}
            </div>
          )}

          {/* TAB 2: Barcode / Handheld gun */}
          {activeTab === 'barcode' && (
            <div className="space-y-4">
              <div className="p-3 bg-neutral-100 rounded-lg border border-neutral-300 text-xs text-neutral-700 flex items-start gap-2">
                <Info className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                <span>
                  Skanna med din USB- eller Bluetooth-streckkodsläsare. Den fyller automatiskt i order och station (t.ex. <code>AO-2026-101@col-montering</code>).
                </span>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Order / QR-sträng
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="t.ex. AO-2026-101 eller AO-2026-101@col-montering"
                    className="w-full font-mono text-base px-3.5 py-2.5 bg-white border-2 border-neutral-900 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!manualInput.trim()}
                  className="w-full py-2.5 bg-neutral-950 hover:bg-neutral-800 disabled:opacity-50 text-white rounded-lg font-bold text-sm transition cursor-pointer"
                >
                  Hämta orderstatus →
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: Simulator with Station Picker */}
          {activeTab === 'simulator' && (
            <div className="space-y-3">
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-950 flex items-center justify-between">
                <span>
                  Klicka på en order + station för att testa direkt:
                </span>
                <span className="font-bold font-mono">{filteredOrders.length} ordrar</span>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={simulatorSearch}
                  onChange={(e) => setSimulatorSearch(e.target.value)}
                  placeholder="Sök order att simulera skanning på..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-300 rounded-md focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                {filteredOrders.map((order) => {
                  const currentCol = columns.find((c) => c.id === order.columnId);
                  return (
                    <div
                      key={order.id}
                      className="p-3 bg-white rounded-xl border-2 border-neutral-800 shadow-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-300">
                            {order.id}
                          </span>
                          <span className="text-xs font-bold text-neutral-900">
                            {order.title}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded">
                          Order: {order.batchSize} {order.unit}
                        </span>
                      </div>

                      {/* Station specific quick scan buttons */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-neutral-200">
                        <span className="text-[10px] text-neutral-500 font-bold uppercase">
                          Skanna bunden till station:
                        </span>
                        {columns.slice(1, 5).map((col) => (
                          <button
                            key={col.id}
                            type="button"
                            onClick={() => handleSimulatorSelect(order.id, col.id)}
                            style={{ backgroundColor: col.headerBg }}
                            className="px-2 py-1 rounded text-[11px] font-bold text-neutral-900 border border-neutral-400 hover:border-neutral-900 hover:scale-105 transition cursor-pointer"
                          >
                            + {col.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
