import React from 'react';
import { 
  QrCode, 
  ChevronLeft, 
  ChevronRight, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  User, 
  CheckSquare
} from 'lucide-react';
import { ProductionOrder } from '../types';

interface OrderCardProps {
  order: ProductionOrder;
  columnTitle: string;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onClick: () => void;
  onQuickQR: () => void;
  isRecentlyUpdated?: boolean;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  columnTitle,
  canMoveLeft,
  canMoveRight,
  onMoveLeft,
  onMoveRight,
  onClick,
  onQuickQR,
  isRecentlyUpdated,
}) => {
  const hasDeviations = order.notes.some((n) => n.type === 'deviation');
  const totalNotes = order.notes.length;
  
  // Calculate checklist progress for this specific column
  const currentChecklist = order.checklists[order.columnId] || [];
  const completedChecklistCount = currentChecklist.filter((c) => c.completed).length;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', order.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
      className={`group relative bg-white rounded-lg border-2 border-neutral-800 p-3 shadow-xs hover:shadow-md transition-all cursor-pointer select-none active:scale-[0.99] ${
        isRecentlyUpdated ? 'ring-3 ring-emerald-500 ring-offset-2 animate-bounce-subtle' : ''
      }`}
    >
      {/* Top Header: Order ID & Priority & Batch */}
      <div className="flex items-center justify-between gap-1 mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs font-black tracking-tight text-neutral-900 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-300">
            {order.id}
          </span>
          {order.priority === 'urgent' && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-600 text-white animate-pulse">
              AKUT
            </span>
          )}
          {order.priority === 'high' && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400 text-neutral-900">
              HÖG
            </span>
          )}
        </div>

        {/* Batch size */}
        <div className="font-mono text-xs font-bold text-neutral-800 bg-neutral-50 px-1.5 py-0.5 rounded border border-neutral-200">
          {order.batchSize} {order.unit}
        </div>
      </div>

      {/* Product Title */}
      <h3 className="text-sm font-bold text-neutral-900 leading-snug line-clamp-2 group-hover:text-sky-700 transition">
        {order.title}
      </h3>

      {/* Customer & Article Number */}
      <div className="mt-1 flex items-center justify-between text-[11px] text-neutral-600">
        <span className="truncate max-w-[140px] font-medium" title={order.customer}>
          {order.customer}
        </span>
        {order.articleNumber && (
          <span className="font-mono text-neutral-600 shrink-0">
            {order.articleNumber}
          </span>
        )}
      </div>

      {/* Drawing / Tags */}
      {order.drawingNumber && (
        <div className="mt-1 text-[10px] text-neutral-600 font-mono flex items-center gap-1">
          <span>Ritn:</span>
          <span className="text-neutral-700">{order.drawingNumber}</span>
        </div>
      )}

      {/* Meta indicators: Notes, Checklist, Deviations, Operator */}
      <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-600">
        <div className="flex items-center gap-2">
          {hasDeviations ? (
            <span className="flex items-center gap-0.5 text-rose-700 font-bold bg-rose-50 px-1 py-0.5 rounded border border-rose-200">
              <AlertTriangle className="w-3 h-3 text-rose-600" />
              Avvikelse
            </span>
          ) : totalNotes > 0 ? (
            <span className="flex items-center gap-0.5 text-neutral-600 hover:text-neutral-900">
              <MessageSquare className="w-3 h-3 text-neutral-500" />
              {totalNotes}
            </span>
          ) : null}

          {currentChecklist.length > 0 && (
            <span className="flex items-center gap-0.5 text-neutral-600">
              <CheckSquare className="w-3 h-3 text-neutral-500" />
              {completedChecklistCount}/{currentChecklist.length}
            </span>
          )}

          {order.operator && (
            <span className="flex items-center gap-1 text-neutral-600 truncate max-w-[85px]" title={order.operator}>
              <User className="w-2.5 h-2.5" />
              {order.operator}
            </span>
          )}
        </div>

        {/* QR Code quick preview trigger */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onQuickQR();
          }}
          className="p-1 rounded text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer"
          title="Visa orderns QR-kod"
        >
          <QrCode className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Card Quick-Move Arrows (Visible on hover or mobile tap) */}
      <div className="mt-2 flex items-center justify-between gap-1 pt-1 border-t border-dashed border-neutral-200">
        <button
          type="button"
          disabled={!canMoveLeft}
          onClick={(e) => {
            e.stopPropagation();
            onMoveLeft();
          }}
          className={`flex items-center justify-center p-1 rounded text-xs transition cursor-pointer ${
            canMoveLeft
              ? 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200'
              : 'text-neutral-300 cursor-not-allowed'
          }`}
          title="Flytta till föregående steg"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <span className="text-[10px] text-neutral-600 uppercase tracking-wider font-semibold">
          {columnTitle}
        </span>

        <button
          type="button"
          disabled={!canMoveRight}
          onClick={(e) => {
            e.stopPropagation();
            onMoveRight();
          }}
          className={`flex items-center justify-center p-1 rounded text-xs transition cursor-pointer ${
            canMoveRight
              ? 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200'
              : 'text-neutral-300 cursor-not-allowed'
          }`}
          title="Flytta till nästa steg"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
