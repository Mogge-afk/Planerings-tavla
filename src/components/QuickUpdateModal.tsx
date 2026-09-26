import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Clock, 
  User, 
  MessageSquare, 
  CheckSquare, 
  ShieldCheck, 
  QrCode,
  Tag
} from 'lucide-react';
import { ColumnConfig, ProductionOrder, ProductionNote, ChecklistItem } from '../types';
import { getStoredOperatorName, setStoredOperatorName } from '../utils/storage';
import { playScanSuccessSound } from '../utils/audio';

interface QuickUpdateModalProps {
  order: ProductionOrder | null;
  columns: ColumnConfig[];
  isOpen: boolean;
  onClose: () => void;
  onSaveUpdate: (
    orderId: string,
    newColumnId: string,
    noteText: string,
    noteType: ProductionNote['type'],
    operator: string,
    updatedChecklists?: Record<string, ChecklistItem[]>
  ) => void;
}

export const QuickUpdateModal: React.FC<QuickUpdateModalProps> = ({
  order,
  columns,
  isOpen,
  onClose,
  onSaveUpdate,
}) => {
  const [selectedColumnId, setSelectedColumnId] = useState<string>('');
  const [noteText, setNoteText] = useState<string>('');
  const [noteType, setNoteType] = useState<ProductionNote['type']>('info');
  const [operator, setOperator] = useState<string>('');
  const [localChecklists, setLocalChecklists] = useState<Record<string, ChecklistItem[]>>({});

  useEffect(() => {
    if (order) {
      setSelectedColumnId(order.columnId);
      setNoteText('');
      setNoteType('info');
      setLocalChecklists(order.checklists || {});
      const savedOp = getStoredOperatorName();
      setOperator(savedOp || order.operator || '');
    }
  }, [order, isOpen]);

  if (!isOpen || !order) return null;

  const currentColumn = columns.find((c) => c.id === order.columnId);
  const currentColumnIndex = columns.findIndex((c) => c.id === order.columnId);
  const nextColumn = currentColumnIndex >= 0 && currentColumnIndex < columns.length - 1 
    ? columns[currentColumnIndex + 1] 
    : null;

  const handleQuickNextStage = () => {
    if (nextColumn) {
      setSelectedColumnId(nextColumn.id);
    }
  };

  const handleQuickChip = (text: string, type: ProductionNote['type']) => {
    setNoteText(text);
    setNoteType(type);
  };

  const handleToggleChecklist = (colId: string, itemId: string) => {
    setLocalChecklists((prev) => {
      const items = prev[colId] || [];
      return {
        ...prev,
        [colId]: items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                completed: !item.completed,
                completedBy: !item.completed ? operator || 'Operatör' : undefined,
                completedAt: !item.completed ? new Date().toISOString() : undefined,
              }
            : item
        ),
      };
    });
  };

  const handleAddChecklistItem = (colId: string, text: string) => {
    if (!text.trim()) return;
    setLocalChecklists((prev) => {
      const existing = prev[colId] || [];
      return {
        ...prev,
        [colId]: [
          ...existing,
          {
            id: 'chk_' + Date.now(),
            text: text.trim(),
            completed: false,
          },
        ],
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (operator.trim()) {
      setStoredOperatorName(operator.trim());
    }

    onSaveUpdate(
      order.id,
      selectedColumnId,
      noteText.trim(),
      noteType,
      operator.trim() || 'Operatör',
      localChecklists
    );
    playScanSuccessSound();
    onClose();
  };

  const stageChecklist = localChecklists[selectedColumnId] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border-2 border-neutral-800 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="px-5 py-4 border-b-2 border-neutral-800 bg-neutral-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500 text-neutral-950 font-black font-mono text-sm">
              QR OK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-white">
                  {order.id}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono">
                  {order.batchSize} {order.unit}
                </span>
              </div>
              <h2 className="text-sm font-semibold text-neutral-300">
                {order.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 flex-1">
          
          {/* Current Status banner & Next Stage shortcut */}
          <div className="p-3.5 bg-neutral-100 rounded-xl border border-neutral-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                Nuvarande station / status:
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  style={{ backgroundColor: currentColumn?.headerBg }}
                  className="px-2.5 py-1 rounded-md text-xs font-black text-neutral-900 border border-neutral-700"
                >
                  {currentColumn?.title}
                </span>
                <span className="text-xs text-neutral-500">
                  Kund: <strong className="text-neutral-800">{order.customer}</strong>
                </span>
              </div>
            </div>

            {nextColumn && (
              <button
                type="button"
                onClick={handleQuickNextStage}
                className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
              >
                <span>Flytta direkt till {nextColumn.title}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 1. SELECT TARGET STATUS (COLUMNS) */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
              Välj ny produktionsstatus / station:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {columns.map((col) => {
                const isSelected = selectedColumnId === col.id;
                const isCurrent = order.columnId === col.id;
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setSelectedColumnId(col.id)}
                    style={{
                      backgroundColor: isSelected ? col.headerBg : '#f9fafb',
                      borderColor: isSelected ? '#171717' : '#e5e7eb',
                    }}
                    className={`p-2.5 rounded-lg border-2 text-left transition flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-neutral-900 shadow-xs font-extrabold'
                        : 'hover:border-neutral-400 font-medium'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-900">{col.title}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-neutral-900 shrink-0" />}
                    </div>
                    {isCurrent && (
                      <span className="text-[10px] text-neutral-500 font-normal mt-1">
                        (Aktiv just nu)
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. OPERATOR NOTATION & DEVIATION */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                Notering / Avvikelse / Resultat
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setNoteType('info')}
                  className={`text-[11px] px-2 py-0.5 rounded cursor-pointer ${
                    noteType === 'info'
                      ? 'bg-neutral-800 text-white font-bold'
                      : 'text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  Info
                </button>
                <button
                  type="button"
                  onClick={() => setNoteType('approved')}
                  className={`text-[11px] px-2 py-0.5 rounded cursor-pointer ${
                    noteType === 'approved'
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  Godkänd
                </button>
                <button
                  type="button"
                  onClick={() => setNoteType('deviation')}
                  className={`text-[11px] px-2 py-0.5 rounded cursor-pointer ${
                    noteType === 'deviation'
                      ? 'bg-rose-600 text-white font-bold'
                      : 'text-rose-700 hover:bg-rose-100'
                  }`}
                >
                  Avvikelse
                </button>
              </div>
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickChip('Provkörning och måttkontroll godkänd.', 'approved')}
                className="text-[11px] px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md hover:bg-emerald-100 transition cursor-pointer"
              >
                ✓ Kontroll godkänd
              </button>
              <button
                type="button"
                onClick={() => handleQuickChip('Momentdragning 140 Nm utförd och signerad.', 'info')}
                className="text-[11px] px-2 py-1 bg-neutral-100 text-neutral-800 border border-neutral-300 rounded-md hover:bg-neutral-200 transition cursor-pointer"
              >
                🔧 Momentdraget
              </button>
              <button
                type="button"
                onClick={() => handleQuickChip('Saknas fästeleverans. På paus tills kl 13.', 'deviation')}
                className="text-[11px] px-2 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-md hover:bg-rose-100 transition cursor-pointer"
              >
                ⚠️ Saknar material
              </button>
              <button
                type="button"
                onClick={() => handleQuickChip('Emballerat på EU-pall och märkt med adresslapp.', 'approved')}
                className="text-[11px] px-2 py-1 bg-sky-50 text-sky-800 border border-sky-200 rounded-md hover:bg-sky-100 transition cursor-pointer"
              >
                📦 Emballerat
              </button>
            </div>

            <textarea
              rows={2}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Skriv notering från arbetsstationen (t.ex. moment, mått, avvikelser eller klar för nästa fas)..."
              className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          {/* 3. OPERATOR NAME SIGNATURE */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Operatör / Signatur
            </label>
            <div className="relative max-w-xs">
              <input
                type="text"
                required
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                placeholder="Ditt namn eller operatörs-ID..."
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900 font-medium"
              />
              <User className="w-4 h-4 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              Sparas lokalt så du slipper fylla i det vid varje skanning.
            </p>
          </div>

          {/* 4. STATION CHECKLIST (IF APPLICABLE) */}
          {stageChecklist.length > 0 && (
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
              <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider block mb-2">
                Checklista för {columns.find((c) => c.id === selectedColumnId)?.title}:
              </span>
              <div className="space-y-1.5">
                {stageChecklist.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-2 text-xs text-neutral-800 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggleChecklist(selectedColumnId, item.id)}
                      className="w-4 h-4 rounded text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                    />
                    <span className={item.completed ? 'line-through text-neutral-400' : 'font-medium'}>
                      {item.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </form>

        {/* Modal Bottom Actions */}
        <div className="px-5 py-3.5 border-t-2 border-neutral-800 bg-neutral-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-neutral-700 hover:text-neutral-900 hover:bg-neutral-200 rounded-lg transition cursor-pointer"
          >
            Avbryt
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-sm font-bold shadow-md transition active:scale-95 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Spara & Uppdatera tavlan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
