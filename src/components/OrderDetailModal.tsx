import React, { useState, useEffect } from 'react';
import { 
  X, 
  QrCode, 
  Calendar, 
  Clock, 
  User, 
  Building2, 
  FileText, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Printer, 
  Download, 
  Trash2,
  Send,
  CheckSquare
} from 'lucide-react';
import { ColumnConfig, ProductionOrder, ProductionNote, ChecklistItem } from '../types';
import { generateQRCodeDataUrl } from '../utils/qr';
import { getStoredOperatorName, setStoredOperatorName } from '../utils/storage';

interface OrderDetailModalProps {
  order: ProductionOrder | null;
  columns: ColumnConfig[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateOrder: (updated: ProductionOrder) => void;
  onDeleteOrder: (orderId: string) => void;
  onPrintLabel: (order: ProductionOrder) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  columns,
  isOpen,
  onClose,
  onUpdateOrder,
  onDeleteOrder,
  onPrintLabel,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteType, setNewNoteType] = useState<ProductionNote['type']>('info');
  const [operator, setOperator] = useState('');
  const [newChecklistText, setNewChecklistText] = useState('');

  useEffect(() => {
    if (order) {
      generateQRCodeDataUrl(order.qrPayload || order.id, { width: 300, margin: 2 }).then(setQrDataUrl);
      setOperator(getStoredOperatorName() || order.operator || '');
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const currentColumn = columns.find((c) => c.id === order.columnId);

  const handleStageChange = (newColId: string) => {
    if (newColId === order.columnId) return;
    const targetCol = columns.find((c) => c.id === newColId);
    const newNote: ProductionNote = {
      id: 'note_' + Date.now(),
      timestamp: new Date().toISOString(),
      operator: operator || 'Operatör',
      text: `Status ändrad från "${currentColumn?.title}" till "${targetCol?.title}".`,
      type: 'stage_change',
      stageName: targetCol?.title,
    };

    const updated: ProductionOrder = {
      ...order,
      columnId: newColId,
      updatedAt: new Date().toISOString(),
      notes: [newNote, ...order.notes],
    };
    onUpdateOrder(updated);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    if (operator.trim()) setStoredOperatorName(operator.trim());

    const note: ProductionNote = {
      id: 'note_' + Date.now(),
      timestamp: new Date().toISOString(),
      operator: operator.trim() || 'Operatör',
      text: newNoteText.trim(),
      type: newNoteType,
      stageName: currentColumn?.title,
    };

    const updated: ProductionOrder = {
      ...order,
      updatedAt: new Date().toISOString(),
      notes: [note, ...order.notes],
    };
    onUpdateOrder(updated);
    setNewNoteText('');
  };

  const handleToggleChecklist = (colId: string, itemId: string) => {
    const currentList = order.checklists[colId] || [];
    const updatedList = currentList.map((item) =>
      item.id === itemId
        ? {
            ...item,
            completed: !item.completed,
            completedBy: !item.completed ? operator || 'Operatör' : undefined,
            completedAt: !item.completed ? new Date().toISOString() : undefined,
          }
        : item
    );

    const updated: ProductionOrder = {
      ...order,
      checklists: {
        ...order.checklists,
        [colId]: updatedList,
      },
    };
    onUpdateOrder(updated);
  };

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    const currentList = order.checklists[order.columnId] || [];
    const newItem: ChecklistItem = {
      id: 'chk_' + Date.now(),
      text: newChecklistText.trim(),
      completed: false,
    };

    const updated: ProductionOrder = {
      ...order,
      checklists: {
        ...order.checklists,
        [order.columnId]: [...currentList, newItem],
      },
    };
    onUpdateOrder(updated);
    setNewChecklistText('');
  };

  const currentChecklist = order.checklists[order.columnId] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border-2 border-neutral-800 shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b-2 border-neutral-800 bg-neutral-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-base font-black px-2 py-0.5 rounded bg-white text-neutral-950">
              {order.id}
            </span>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">
                {order.title}
              </h2>
              <p className="text-xs text-neutral-400">
                Artikel: {order.articleNumber} · Kund: {order.customer}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrintLabel(order)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg border border-neutral-700 transition cursor-pointer"
              title="Skriv ut QR-följesedel för denna order"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Skriv ut etikett</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          
          {/* Left 2 Cols: Details & Timeline */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Status Selection */}
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
              <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider block mb-2">
                Produktionsfas (Klicka för att flytta):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {columns.map((col) => {
                  const isActive = col.id === order.columnId;
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => handleStageChange(col.id)}
                      style={{
                        backgroundColor: isActive ? col.headerBg : '#ffffff',
                        borderColor: isActive ? '#171717' : '#d4d4d4',
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs border-2 transition cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? 'font-black text-neutral-900 ring-2 ring-neutral-900 shadow-xs'
                          : 'font-medium text-neutral-700 hover:border-neutral-500'
                      }`}
                    >
                      {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-neutral-900" />}
                      <span>{col.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Production Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-neutral-100/70 rounded-lg border border-neutral-200">
                <span className="text-neutral-500 font-medium block">Antal / Batch</span>
                <span className="font-mono text-base font-bold text-neutral-900">
                  {order.batchSize} {order.unit}
                </span>
              </div>
              <div className="p-3 bg-neutral-100/70 rounded-lg border border-neutral-200">
                <span className="text-neutral-500 font-medium block">Leveransmål</span>
                <span className="font-mono text-sm font-bold text-neutral-900">
                  {order.targetDate || 'Ej satt'}
                </span>
              </div>
              <div className="p-3 bg-neutral-100/70 rounded-lg border border-neutral-200">
                <span className="text-neutral-500 font-medium block">Ritningsnummer</span>
                <span className="font-mono text-sm font-bold text-neutral-900">
                  {order.drawingNumber || 'Standard'}
                </span>
              </div>
            </div>

            {/* Checklist for Active Stage */}
            <div className="p-4 bg-white rounded-xl border border-neutral-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  Kvalitetskontroller för {currentColumn?.title}
                </span>
                <span className="text-xs text-neutral-500 font-mono">
                  {currentChecklist.filter((c) => c.completed).length}/{currentChecklist.length} klara
                </span>
              </div>

              <div className="space-y-2 mb-3">
                {currentChecklist.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic">Inga specifika checklistpunkter inlagda för denna fas.</p>
                ) : (
                  currentChecklist.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-start gap-2.5 p-2 rounded-lg bg-neutral-50 hover:bg-neutral-100 text-xs text-neutral-800 cursor-pointer select-none border border-neutral-200"
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggleChecklist(order.columnId, item.id)}
                        className="w-4 h-4 mt-0.5 rounded text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                      />
                      <div className="flex-1">
                        <span className={item.completed ? 'line-through text-neutral-400 font-medium' : 'font-semibold'}>
                          {item.text}
                        </span>
                        {item.completed && item.completedBy && (
                          <div className="text-[10px] text-emerald-700 mt-0.5">
                            Signerad av {item.completedBy}
                          </div>
                        )}
                      </div>
                    </label>
                  ))
                )}
              </div>

              {/* Add checklist item */}
              <form onSubmit={handleAddChecklist} className="flex gap-2">
                <input
                  type="text"
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  placeholder="Lägg till kontrollpunkt (t.ex. Provtryckning, Moment...)"
                  className="flex-1 px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                />
                <button
                  type="submit"
                  disabled={!newChecklistText.trim()}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-900 disabled:opacity-50 text-white rounded-md text-xs font-bold transition cursor-pointer"
                >
                  Lägg till
                </button>
              </form>
            </div>

            {/* Complete Production Log / Timeline */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider block">
                Produktionslogg & Historik ({order.notes.length})
              </span>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={operator}
                      onChange={(e) => setOperator(e.target.value)}
                      placeholder="Ditt namn..."
                      className="text-xs px-2 py-1 bg-white border border-neutral-300 rounded font-medium max-w-[140px]"
                    />
                    <span className="text-xs text-neutral-400">·</span>
                    <span className="text-xs text-neutral-600 font-medium">{currentColumn?.title}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setNewNoteType('info')}
                      className={`text-[10px] px-2 py-0.5 rounded cursor-pointer ${
                        newNoteType === 'info' ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-600'
                      }`}
                    >
                      Info
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewNoteType('approved')}
                      className={`text-[10px] px-2 py-0.5 rounded cursor-pointer ${
                        newNoteType === 'approved' ? 'bg-emerald-600 text-white font-bold' : 'text-emerald-700'
                      }`}
                    >
                      Godkänd
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewNoteType('deviation')}
                      className={`text-[10px] px-2 py-0.5 rounded cursor-pointer ${
                        newNoteType === 'deviation' ? 'bg-rose-600 text-white font-bold' : 'text-rose-700'
                      }`}
                    >
                      Avvikelse
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Skriv notering från verkstaden..."
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                  />
                  <button
                    type="submit"
                    disabled={!newNoteText.trim()}
                    className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white rounded-md text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Spara</span>
                  </button>
                </div>
              </form>

              {/* Timeline Items */}
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {order.notes.map((note) => (
                  <div
                    key={note.id}
                    className={`p-3 rounded-xl border text-xs ${
                      note.type === 'deviation'
                        ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                        : note.type === 'approved'
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                        : note.type === 'stage_change'
                        ? 'bg-sky-50/70 border-sky-200 text-sky-950'
                        : 'bg-white border-neutral-200 text-neutral-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-neutral-900">{note.operator}</span>
                        {note.stageName && (
                          <span className="text-neutral-500 font-medium">[{note.stageName}]</span>
                        )}
                      </div>
                      <span className="text-neutral-400 font-mono">
                        {new Date(note.timestamp).toLocaleTimeString('sv-SE', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        · {new Date(note.timestamp).toLocaleDateString('sv-SE', { month: 'numeric', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed">{note.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: Dedicated QR Code & Physical Tag Preview */}
          <div className="space-y-4">
            <div className="bg-neutral-50 p-4 rounded-xl border-2 border-neutral-800 text-center flex flex-col items-center">
              <span className="text-xs font-black uppercase tracking-wider text-neutral-700 mb-2">
                Orderns QR-kod
              </span>

              {qrDataUrl ? (
                <div className="p-3 bg-white rounded-lg border border-neutral-300 shadow-xs mb-3">
                  <img src={qrDataUrl} alt="Order QR" className="w-48 h-48 mx-auto" />
                </div>
              ) : (
                <div className="w-48 h-48 bg-neutral-200 rounded-lg animate-pulse mb-3" />
              )}

              <div className="font-mono text-sm font-black text-neutral-900 mb-1">
                {order.id}
              </div>
              <p className="text-[11px] text-neutral-500 leading-tight mb-3">
                Skannas med mobilkamera eller handskanner vid varje station för att hämta & uppdatera status.
              </p>

              <div className="flex flex-col w-full gap-2">
                <button
                  type="button"
                  onClick={() => onPrintLabel(order)}
                  className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Skriv ut följesedel</span>
                </button>
                {qrDataUrl && (
                  <a
                    href={qrDataUrl}
                    download={`QR_${order.id}.png`}
                    className="w-full py-1.5 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Ladda ner QR-bild</span>
                  </a>
                )}
              </div>
            </div>

            {/* Danger Zone: Delete Order */}
            <div className="pt-4 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Är du säker på att du vill ta bort order ${order.id}?`)) {
                    onDeleteOrder(order.id);
                    onClose();
                  }
                }}
                className="w-full py-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ta bort tillverkningsorder</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
