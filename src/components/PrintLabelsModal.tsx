import React, { useState, useEffect } from 'react';
import { X, Printer, CheckSquare, Square, Layers, Sparkles, FileText, Tag } from 'lucide-react';
import { ColumnConfig, ProductionOrder } from '../types';
import { generateQRCodeDataUrl } from '../utils/qr';

interface PrintLabelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: ProductionOrder[];
  columns: ColumnConfig[];
  initialSelectedOrderId?: string;
}

export const PrintLabelsModal: React.FC<PrintLabelsModalProps> = ({
  isOpen,
  onClose,
  orders,
  columns,
  initialSelectedOrderId,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [printFormat, setPrintFormat] = useState<'traveler' | 'sticker'>('traveler');
  const [qrMap, setQrMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialSelectedOrderId) {
      setSelectedIds([initialSelectedOrderId]);
    } else {
      setSelectedIds(orders.slice(0, 4).map((o) => o.id));
    }
  }, [initialSelectedOrderId, orders, isOpen]);

  // Pre-generate QR codes for selected orders
  useEffect(() => {
    if (!isOpen) return;

    const generateQRs = async () => {
      const map: Record<string, string> = {};
      for (const order of orders) {
        if (selectedIds.includes(order.id)) {
          const url = await generateQRCodeDataUrl(order.qrPayload || order.id, {
            width: 240,
            margin: 1,
          });
          map[order.id] = url;
        }
      }
      setQrMap(map);
    };

    generateQRs();
  }, [selectedIds, orders, isOpen]);

  if (!isOpen) return null;

  const toggleSelectOrder = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === orders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(orders.map((o) => o.id));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedOrders = orders.filter((o) => selectedIds.includes(o.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border-2 border-neutral-800 shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Modal Top Header (Hidden in Print) */}
        <div className="print:hidden px-5 py-4 border-b-2 border-neutral-800 bg-neutral-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-neutral-800 text-emerald-400 border border-neutral-700">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight uppercase font-sans">
                Skriv ut QR-etiketter & Följesedlar
              </h2>
              <p className="text-xs text-neutral-400">
                Fäst på materialpallar, backar eller detaljer för enkel skanning vid varje station
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

        {/* Format Selector & Order Checkbox Bar (Hidden in Print) */}
        <div className="print:hidden px-5 py-3 bg-neutral-50 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-700 uppercase tracking-wider">Format:</span>
            <div className="inline-flex rounded-lg bg-neutral-200 p-0.5 border border-neutral-300">
              <button
                type="button"
                onClick={() => setPrintFormat('traveler')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition cursor-pointer ${
                  printFormat === 'traveler'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-700 hover:text-neutral-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>A4 Följesedel (Arbetsorder)</span>
              </button>
              <button
                type="button"
                onClick={() => setPrintFormat('sticker')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition cursor-pointer ${
                  printFormat === 'sticker'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-700 hover:text-neutral-900'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Kompakt QR-etikett</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="text-xs font-bold text-neutral-700 hover:text-neutral-900 underline cursor-pointer"
            >
              {selectedIds.length === orders.length ? 'Avmarkera alla' : 'Välj alla ordrar'}
            </button>
            <span className="text-neutral-400">·</span>
            <span className="font-mono text-xs font-bold text-neutral-900">
              {selectedIds.length} valda
            </span>
          </div>
        </div>

        {/* Order Selector Chips (Hidden in Print) */}
        <div className="print:hidden px-5 py-2.5 bg-neutral-100 border-b border-neutral-200 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
          {orders.map((ord) => {
            const isSelected = selectedIds.includes(ord.id);
            return (
              <button
                key={ord.id}
                type="button"
                onClick={() => toggleSelectOrder(ord.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium border transition cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-500'
                }`}
              >
                <span className="font-mono font-bold">{ord.id}</span>
                <span className="truncate max-w-[100px]">{ord.title}</span>
              </button>
            );
          })}
        </div>

        {/* Printable Preview Container */}
        <div className="p-6 overflow-y-auto flex-1 bg-neutral-200/50 print:bg-white print:p-0">
          {selectedOrders.length === 0 ? (
            <div className="p-12 text-center text-neutral-500">
              Välj minst en order ovan för att förhandsgranska och skriva ut.
            </div>
          ) : (
            <div className="space-y-6 print:space-y-0">
              {selectedOrders.map((order, idx) => (
                <div
                  key={order.id}
                  className={`bg-white rounded-xl border-2 border-neutral-800 p-6 shadow-sm print:shadow-none print:border-2 print:border-black print:rounded-none print:break-after-page ${
                    printFormat === 'sticker' ? 'max-w-md mx-auto p-4' : 'max-w-3xl mx-auto'
                  }`}
                >
                  {/* Print Document Header */}
                  <div className="flex items-start justify-between border-b-2 border-neutral-800 pb-4 mb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block">
                        TILLVERKNINGSORDER & FÖLJESEDEL
                      </span>
                      <h1 className="text-2xl font-black text-neutral-900 uppercase font-sans tracking-tight">
                        {order.title}
                      </h1>
                      <div className="mt-1 flex items-center gap-3 text-xs text-neutral-600 font-medium">
                        <span>Artikel: <strong className="font-mono text-neutral-900">{order.articleNumber}</strong></span>
                        <span>·</span>
                        <span>Kund: <strong className="text-neutral-900">{order.customer}</strong></span>
                        {order.drawingNumber && (
                          <>
                            <span>·</span>
                            <span>Ritning: <strong className="font-mono text-neutral-900">{order.drawingNumber}</strong></span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* QR Code and Order ID */}
                    <div className="text-center shrink-0 ml-4">
                      {qrMap[order.id] ? (
                        <img
                          src={qrMap[order.id]}
                          alt="QR"
                          className="w-28 h-28 border border-neutral-400 p-1 mx-auto bg-white"
                        />
                      ) : (
                        <div className="w-28 h-28 bg-neutral-100 border border-neutral-300" />
                      )}
                      <div className="font-mono text-sm font-black text-neutral-900 mt-1">
                        {order.id}
                      </div>
                    </div>
                  </div>

                  {/* Order Specs Row */}
                  <div className="grid grid-cols-4 gap-2 text-xs mb-5">
                    <div className="p-2 border border-neutral-300 rounded bg-neutral-50 print:bg-transparent">
                      <span className="text-[10px] text-neutral-500 font-bold block uppercase">Batchstorlek</span>
                      <span className="font-mono text-base font-black text-neutral-900">
                        {order.batchSize} {order.unit}
                      </span>
                    </div>
                    <div className="p-2 border border-neutral-300 rounded bg-neutral-50 print:bg-transparent">
                      <span className="text-[10px] text-neutral-500 font-bold block uppercase">Prioritet</span>
                      <span className="font-bold uppercase text-neutral-900">
                        {order.priority}
                      </span>
                    </div>
                    <div className="p-2 border border-neutral-300 rounded bg-neutral-50 print:bg-transparent">
                      <span className="text-[10px] text-neutral-500 font-bold block uppercase">Leveransmål</span>
                      <span className="font-mono text-sm font-bold text-neutral-900">
                        {order.targetDate}
                      </span>
                    </div>
                    <div className="p-2 border border-neutral-300 rounded bg-neutral-50 print:bg-transparent">
                      <span className="text-[10px] text-neutral-500 font-bold block uppercase">Utskriven</span>
                      <span className="font-mono text-[11px] text-neutral-700">
                        {new Date().toLocaleDateString('sv-SE')}
                      </span>
                    </div>
                  </div>

                  {/* Full Routing & Station Sign-off Table (Only in traveler mode) */}
                  {printFormat === 'traveler' && (
                    <div className="mb-5">
                      <h3 className="text-xs font-black uppercase tracking-wider text-neutral-800 mb-1.5">
                        Flödesschema / Stationskvittering:
                      </h3>
                      <table className="w-full text-left border-collapse border border-neutral-800 text-xs">
                        <thead>
                          <tr className="bg-neutral-100 print:bg-neutral-200">
                            <th className="border border-neutral-800 p-2 font-bold w-12 text-center">Fas</th>
                            <th className="border border-neutral-800 p-2 font-bold">Produktionsstation</th>
                            <th className="border border-neutral-800 p-2 font-bold w-32">Status vid tavla</th>
                            <th className="border border-neutral-800 p-2 font-bold w-32">Operatörssignatur</th>
                            <th className="border border-neutral-800 p-2 font-bold w-24">Datum / Tid</th>
                          </tr>
                        </thead>
                        <tbody>
                          {columns.map((col, cIdx) => {
                            const isCurrent = col.id === order.columnId;
                            return (
                              <tr key={col.id} className="h-10">
                                <td className="border border-neutral-800 p-2 text-center font-mono font-bold">
                                  {cIdx + 1}
                                </td>
                                <td className="border border-neutral-800 p-2 font-bold">
                                  {col.title}
                                </td>
                                <td className="border border-neutral-800 p-2 text-neutral-600">
                                  {isCurrent ? '● Pågående här' : ''}
                                </td>
                                <td className="border border-neutral-800 p-2"></td>
                                <td className="border border-neutral-800 p-2"></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Notes / Deviations Space */}
                  <div className="border border-neutral-800 rounded p-3 text-xs bg-neutral-50/50 print:bg-transparent">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                      Operatörsnoteringar / Avvikelserapport:
                    </span>
                    <div className="h-16 border-b border-dashed border-neutral-400 mb-2">
                      {order.notes.length > 0 && (
                        <p className="text-[11px] text-neutral-800 italic">
                          Senaste logg: "{order.notes[0]?.text}" – {order.notes[0]?.operator}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-neutral-500">
                      <span>Rikta skanner mot QR-koden vid byte av station för realtidsuppdatering.</span>
                      <span className="font-mono">PLANERINGSTAVLA 4.0</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Print Action (Hidden in Print) */}
        <div className="print:hidden px-5 py-3.5 border-t-2 border-neutral-800 bg-neutral-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-200 rounded-lg cursor-pointer"
          >
            Stäng
          </button>

          <button
            type="button"
            disabled={selectedOrders.length === 0}
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white rounded-lg text-sm font-bold shadow-md transition active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Skriv ut ({selectedOrders.length} st)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
