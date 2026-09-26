import React, { useState, useEffect } from 'react';
import { 
  X, 
  Monitor, 
  Camera, 
  Barcode, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  User, 
  AlertTriangle,
  RotateCw,
  Sparkles
} from 'lucide-react';
import { ColumnConfig, ProductionOrder, ProductionNote } from '../types';
import { extractOrderIdFromScan } from '../utils/qr';
import { playScanSuccessSound } from '../utils/audio';
import { getStoredOperatorName, setStoredOperatorName } from '../utils/storage';

interface StationModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: ColumnConfig[];
  allOrders: ProductionOrder[];
  onOrderStationCheckin: (
    orderId: string,
    targetColumnId: string,
    noteText: string,
    operator: string
  ) => void;
}

export const StationModeModal: React.FC<StationModeModalProps> = ({
  isOpen,
  onClose,
  columns,
  allOrders,
  onOrderStationCheckin,
}) => {
  const [selectedStationId, setSelectedStationId] = useState<string>(columns[2]?.id || columns[0]?.id || '');
  const [scannedInput, setScannedInput] = useState('');
  const [operator, setOperator] = useState('');
  const [stationNote, setStationNote] = useState('');
  const [lastCheckinMessage, setLastCheckinMessage] = useState<string | null>(null);

  useEffect(() => {
    setOperator(getStoredOperatorName() || 'Station Operatör');
  }, [isOpen]);

  if (!isOpen) return null;

  const currentStation = columns.find((c) => c.id === selectedStationId);

  // Orders currently sitting at this station
  const stationOrders = allOrders.filter((o) => o.columnId === selectedStationId);

  const handleManualCheckin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = extractOrderIdFromScan(scannedInput);
    if (!cleanId) return;

    const foundOrder = allOrders.find((o) => o.id.toLowerCase() === cleanId.toLowerCase());
    if (!foundOrder) {
      alert(`Order ${cleanId} hittades inte i systemet.`);
      return;
    }

    if (operator.trim()) setStoredOperatorName(operator.trim());

    onOrderStationCheckin(
      foundOrder.id,
      selectedStationId,
      stationNote.trim() || `Incheckad på ${currentStation?.title}`,
      operator.trim() || 'Operatör'
    );

    playScanSuccessSound();
    setLastCheckinMessage(`✓ Order ${foundOrder.id} (${foundOrder.title}) incheckad på ${currentStation?.title}!`);
    setScannedInput('');
    setStationNote('');

    setTimeout(() => {
      setLastCheckinMessage(null);
    }, 4000);
  };

  const handleQuickSimulateScan = (orderId: string) => {
    const foundOrder = allOrders.find((o) => o.id === orderId);
    if (!foundOrder) return;

    onOrderStationCheckin(
      foundOrder.id,
      selectedStationId,
      `Incheckad vid station ${currentStation?.title}`,
      operator.trim() || 'Operatör'
    );

    playScanSuccessSound();
    setLastCheckinMessage(`✓ Order ${foundOrder.id} incheckad på ${currentStation?.title}!`);
    setTimeout(() => {
      setLastCheckinMessage(null);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border-2 border-neutral-800 shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b-2 border-neutral-800 bg-neutral-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Monitor className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight font-sans">
                Stationsläge / Arbetsplatsterminal
              </h2>
              <p className="text-xs text-neutral-400">
                För surfplattor eller pekskärmar monterade vid specifika arbetsstationer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Station Selector Bar */}
        <div className="p-4 bg-neutral-100 border-b border-neutral-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-neutral-700">
                Aktiv Station:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {columns.map((col) => {
                  const isSelected = col.id === selectedStationId;
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setSelectedStationId(col.id)}
                      style={{
                        backgroundColor: isSelected ? col.headerBg : '#ffffff',
                        borderColor: isSelected ? '#171717' : '#d4d4d4',
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition cursor-pointer ${
                        isSelected
                          ? 'ring-2 ring-neutral-900 text-neutral-900 shadow-xs'
                          : 'text-neutral-600 hover:border-neutral-500'
                      }`}
                    >
                      {col.title}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-neutral-500" />
              <input
                type="text"
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                placeholder="Operatör..."
                className="text-xs font-semibold px-2 py-1 bg-white border border-neutral-300 rounded max-w-[130px]"
              />
            </div>
          </div>
        </div>

        {/* Main Terminal View */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
          
          {/* Left: Instant Scanner & Input */}
          <div className="space-y-4">
            <div
              style={{ backgroundColor: currentStation?.headerBg }}
              className="p-5 rounded-2xl border-2 border-neutral-800 text-center shadow-xs"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
                Skanningspunkt
              </span>
              <h3 className="text-2xl font-black text-neutral-900 mt-1 uppercase font-sans">
                Station: {currentStation?.title}
              </h3>
              <p className="text-xs text-neutral-600 mt-1 max-w-sm mx-auto">
                Skanna arbetsorderns QR-kod eller streckkod här. Den checkas automatiskt in på denna station.
              </p>

              {/* Success Banner */}
              {lastCheckinMessage && (
                <div className="mt-4 p-3 bg-emerald-600 text-white rounded-xl text-xs font-bold animate-in zoom-in-95 duration-150 shadow-md">
                  {lastCheckinMessage}
                </div>
              )}

              {/* Fast Barcode / QR Gun Input */}
              <form onSubmit={handleManualCheckin} className="mt-4 space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    autoFocus
                    value={scannedInput}
                    onChange={(e) => setScannedInput(e.target.value)}
                    placeholder="Skanna eller skriv ordernummer..."
                    className="w-full text-center font-mono text-lg font-black px-4 py-3 bg-white border-2 border-neutral-800 rounded-xl focus:outline-hidden focus:ring-4 focus:ring-neutral-900/20"
                  />
                </div>

                <input
                  type="text"
                  value={stationNote}
                  onChange={(e) => setStationNote(e.target.value)}
                  placeholder="Valfri stationsnotering (t.ex. 'Provtryckt', 'Monterat')..."
                  className="w-full text-xs px-3 py-2 bg-white/90 border border-neutral-400 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                />

                <button
                  type="submit"
                  disabled={!scannedInput.trim()}
                  className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md transition cursor-pointer"
                >
                  Checka in order på {currentStation?.title} →
                </button>
              </form>
            </div>

            {/* Quick Demo Simulator */}
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-2">
                Eller klicka på en order nedan för att simulera skanning hit:
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                {allOrders
                  .filter((o) => o.columnId !== selectedStationId)
                  .map((ord) => (
                    <button
                      key={ord.id}
                      type="button"
                      onClick={() => handleQuickSimulateScan(ord.id)}
                      className="px-2.5 py-1 bg-white hover:bg-neutral-900 hover:text-white border border-neutral-300 rounded text-xs font-mono font-bold transition cursor-pointer"
                    >
                      {ord.id}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Right: Active Work Orders at This Station */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                Pågående på denna station ({stationOrders.length})
              </span>
              <span className="text-xs text-neutral-500 font-mono">
                {currentStation?.title}
              </span>
            </div>

            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {stationOrders.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-neutral-200 rounded-xl text-neutral-400 text-xs">
                  Inga aktiva ordrar på denna station just nu.
                </div>
              ) : (
                stationOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3 bg-white rounded-xl border-2 border-neutral-800 shadow-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-300">
                          {ord.id}
                        </span>
                        <span className="text-xs font-bold text-neutral-900">
                          {ord.title}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-1">
                        {ord.customer} · {ord.batchSize} {ord.unit} · Operatör: {ord.operator || '–'}
                      </div>
                    </div>

                    <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                      Aktiv
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
