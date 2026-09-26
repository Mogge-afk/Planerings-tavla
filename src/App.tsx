import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ColumnConfig, ProductionOrder, Priority, ProductionNote, ChecklistItem } from './types';
import { 
  loadStoredOrders, 
  saveStoredOrders, 
  loadStoredColumns, 
  saveStoredColumns, 
  subscribeToSync, 
  DEFAULT_COLUMNS, 
  INITIAL_ORDERS 
} from './utils/storage';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { BoardView } from './components/BoardView';
import { QRScannerModal } from './components/QRScannerModal';
import { QuickUpdateModal } from './components/QuickUpdateModal';
import { OrderDetailModal } from './components/OrderDetailModal';
import { NewOrderModal } from './components/NewOrderModal';
import { ColumnManagerModal } from './components/ColumnManagerModal';
import { PrintLabelsModal } from './components/PrintLabelsModal';
import { StationModeModal } from './components/StationModeModal';
import { playScanSuccessSound } from './utils/audio';

export default function App() {
  const [orders, setOrders] = useState<ProductionOrder[]>(() => loadStoredOrders());
  const [columns, setColumns] = useState<ColumnConfig[]>(() => loadStoredColumns());
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'all'>('all');

  // Modals state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedOrder, setScannedOrder] = useState<ProductionOrder | null>(null);
  const [isQuickUpdateOpen, setIsQuickUpdateOpen] = useState(false);
  
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);

  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [targetColumnForNewOrder, setTargetColumnForNewOrder] = useState<string | undefined>(undefined);

  const [isColumnManagerOpen, setIsColumnManagerOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printTargetOrderId, setPrintTargetOrderId] = useState<string | undefined>(undefined);

  const [isStationModeOpen, setIsStationModeOpen] = useState(false);
  const [recentlyUpdatedOrderId, setRecentlyUpdatedOrderId] = useState<string | null>(null);

  // Subscribe to real-time sync across browser tabs/windows
  useEffect(() => {
    const unsubscribe = subscribeToSync(
      (newOrders) => {
        setOrders(newOrders);
      },
      (newColumns) => {
        setColumns(newColumns);
      }
    );
    return () => unsubscribe();
  }, []);

  // Check URL parameters for direct QR scan link (e.g. ?order=AO-2026-101)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const directOrderId = params.get('order') || params.get('scan') || params.get('id');
      if (directOrderId) {
        const found = orders.find(
          (o) => o.id.toLowerCase() === directOrderId.toLowerCase()
        );
        if (found) {
          setScannedOrder(found);
          setIsQuickUpdateOpen(true);
        }
      }
    } catch {
      // ignore
    }
  }, [orders]);

  // Highlight helper for visual confirmation
  const flashUpdatedCard = (orderId: string) => {
    setRecentlyUpdatedOrderId(orderId);
    setTimeout(() => {
      setRecentlyUpdatedOrderId(null);
    }, 2500);
  };

  // Move order between columns (drag & drop or button click)
  const handleMoveOrder = useCallback((orderId: string, targetColumnId: string) => {
    setOrders((prev) => {
      const targetCol = columns.find((c) => c.id === targetColumnId);
      const next = prev.map((ord) => {
        if (ord.id === orderId && ord.columnId !== targetColumnId) {
          const fromCol = columns.find((c) => c.id === ord.columnId);
          const newNote: ProductionNote = {
            id: 'n_' + Date.now(),
            timestamp: new Date().toISOString(),
            operator: 'Operatör',
            text: `Flyttad från "${fromCol?.title || 'Okänd'}" till "${targetCol?.title || 'Okänd'}".`,
            type: 'stage_change',
            stageName: targetCol?.title,
          };
          return {
            ...ord,
            columnId: targetColumnId,
            updatedAt: new Date().toISOString(),
            notes: [newNote, ...ord.notes],
          };
        }
        return ord;
      });
      saveStoredOrders(next);
      return next;
    });
    flashUpdatedCard(orderId);
    playScanSuccessSound();
  }, [columns]);

  // Rename column title directly on the board
  const handleUpdateColumnTitle = useCallback((columnId: string, newTitle: string) => {
    setColumns((prev) => {
      const next = prev.map((col) => (col.id === columnId ? { ...col, title: newTitle } : col));
      saveStoredColumns(next);
      return next;
    });
  }, []);

  // Save new order
  const handleCreateOrder = (newOrder: ProductionOrder) => {
    setOrders((prev) => {
      const next = [newOrder, ...prev];
      saveStoredOrders(next);
      return next;
    });
    flashUpdatedCard(newOrder.id);
  };

  // Update existing order from detail modal
  const handleUpdateOrder = (updated: ProductionOrder) => {
    setOrders((prev) => {
      const next = prev.map((o) => (o.id === updated.id ? updated : o));
      saveStoredOrders(next);
      return next;
    });
    if (selectedOrder?.id === updated.id) {
      setSelectedOrder(updated);
    }
  };

  // Delete order
  const handleDeleteOrder = (orderId: string) => {
    setOrders((prev) => {
      const next = prev.filter((o) => o.id !== orderId);
      saveStoredOrders(next);
      return next;
    });
  };

  // Handler when QR code is identified from scanner
  const handleOrderIdentified = (orderId: string) => {
    setIsScannerOpen(false);
    const found = orders.find(
      (o) => o.id.toLowerCase() === orderId.toLowerCase()
    );

    if (found) {
      setScannedOrder(found);
      setIsQuickUpdateOpen(true);
    } else {
      alert(`Order "${orderId}" hittades inte bland aktiva tillverkningsordrar.`);
    }
  };

  // Save status & notes from QR scan quick modal
  const handleSaveQuickUpdate = (
    orderId: string,
    newColumnId: string,
    noteText: string,
    noteType: ProductionNote['type'],
    operator: string,
    updatedChecklists?: Record<string, ChecklistItem[]>
  ) => {
    const targetCol = columns.find((c) => c.id === newColumnId);

    setOrders((prev) => {
      const next = prev.map((ord) => {
        if (ord.id === orderId) {
          const notesCopy = [...ord.notes];
          const isStageChanged = ord.columnId !== newColumnId;

          // If stage changed, log automatic movement note
          if (isStageChanged) {
            const oldCol = columns.find((c) => c.id === ord.columnId);
            notesCopy.unshift({
              id: 'n_stage_' + Date.now(),
              timestamp: new Date().toISOString(),
              operator,
              text: `Status uppdaterad: Flyttad till ${targetCol?.title} (Tidigare: ${oldCol?.title})`,
              type: 'stage_change',
              stageName: targetCol?.title,
            });
          }

          // If custom operator note entered, log it
          if (noteText) {
            notesCopy.unshift({
              id: 'n_user_' + Date.now(),
              timestamp: new Date().toISOString(),
              operator,
              text: noteText,
              type: noteType,
              stageName: targetCol?.title,
            });
          }

          return {
            ...ord,
            columnId: newColumnId,
            operator,
            updatedAt: new Date().toISOString(),
            notes: notesCopy,
            checklists: updatedChecklists || ord.checklists,
          };
        }
        return ord;
      });

      saveStoredOrders(next);
      return next;
    });

    flashUpdatedCard(orderId);
  };

  // Station check-in handler from tablet kiosk mode
  const handleOrderStationCheckin = (
    orderId: string,
    targetColumnId: string,
    noteText: string,
    operator: string
  ) => {
    const targetCol = columns.find((c) => c.id === targetColumnId);

    setOrders((prev) => {
      const next = prev.map((ord) => {
        if (ord.id === orderId) {
          const notesCopy = [...ord.notes];
          notesCopy.unshift({
            id: 'n_station_' + Date.now(),
            timestamp: new Date().toISOString(),
            operator,
            text: noteText || `Incheckad på station ${targetCol?.title}`,
            type: 'stage_change',
            stageName: targetCol?.title,
          });

          return {
            ...ord,
            columnId: targetColumnId,
            operator,
            updatedAt: new Date().toISOString(),
            notes: notesCopy,
          };
        }
        return ord;
      });

      saveStoredOrders(next);
      return next;
    });

    flashUpdatedCard(orderId);
  };

  // Save new customized columns
  const handleSaveColumns = (newColumns: ColumnConfig[]) => {
    setColumns(newColumns);
    saveStoredColumns(newColumns);
  };

  // Reset to initial demo data
  const handleResetDemoData = () => {
    if (confirm('Vill du återställa till demodata och standardkolumner från bilden?')) {
      setOrders(INITIAL_ORDERS);
      saveStoredOrders(INITIAL_ORDERS);
      setColumns(DEFAULT_COLUMNS);
      saveStoredColumns(DEFAULT_COLUMNS);
    }
  };

  // Filtered orders for the board
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        order.id.toLowerCase().includes(q) ||
        order.title.toLowerCase().includes(q) ||
        order.customer.toLowerCase().includes(q) ||
        order.articleNumber.toLowerCase().includes(q) ||
        (order.drawingNumber && order.drawingNumber.toLowerCase().includes(q));

      // Priority
      const matchesPriority =
        selectedPriority === 'all' || order.priority === selectedPriority;

      return matchesSearch && matchesPriority;
    });
  }, [orders, searchQuery, selectedPriority]);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100 text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white">
      {/* Top Application Header */}
      <Header
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenNewOrder={() => {
          setTargetColumnForNewOrder(undefined);
          setIsNewOrderOpen(true);
        }}
        onOpenColumnManager={() => setIsColumnManagerOpen(true)}
        onOpenPrintModal={() => {
          setPrintTargetOrderId(undefined);
          setIsPrintModalOpen(true);
        }}
        onOpenStationMode={() => setIsStationModeOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        totalOrdersCount={orders.length}
      />

      {/* Production KPIs & Quick Actions Bar */}
      <StatsBar
        orders={orders}
        columns={columns}
        onResetDemoData={handleResetDemoData}
      />

      {/* Main Production Board (Styled precisely after user's screenshot) */}
      <BoardView
        columns={columns}
        orders={filteredOrders}
        onUpdateColumnTitle={handleUpdateColumnTitle}
        onMoveOrder={handleMoveOrder}
        onSelectOrder={(ord) => {
          setSelectedOrder(ord);
          setIsOrderDetailOpen(true);
        }}
        onQuickQR={(ord) => {
          setPrintTargetOrderId(ord.id);
          setIsPrintModalOpen(true);
        }}
        onNewOrderInColumn={(colId) => {
          setTargetColumnForNewOrder(colId);
          setIsNewOrderOpen(true);
        }}
        recentlyUpdatedOrderId={recentlyUpdatedOrderId}
      />

      {/* MODAL 1: QR Code Scanner */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onOrderIdentified={handleOrderIdentified}
        allOrders={orders}
      />

      {/* MODAL 2: Quick Status & Note Updater upon QR scan */}
      <QuickUpdateModal
        isOpen={isQuickUpdateOpen}
        order={scannedOrder}
        columns={columns}
        onClose={() => setIsQuickUpdateOpen(false)}
        onSaveUpdate={handleSaveQuickUpdate}
      />

      {/* MODAL 3: Order Detail Inspection & History */}
      <OrderDetailModal
        isOpen={isOrderDetailOpen}
        order={selectedOrder}
        columns={columns}
        onClose={() => setIsOrderDetailOpen(false)}
        onUpdateOrder={handleUpdateOrder}
        onDeleteOrder={handleDeleteOrder}
        onPrintLabel={(ord) => {
          setPrintTargetOrderId(ord.id);
          setIsPrintModalOpen(true);
        }}
      />

      {/* MODAL 4: New Work Order */}
      <NewOrderModal
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
        columns={columns}
        defaultColumnId={targetColumnForNewOrder}
        onCreateOrder={handleCreateOrder}
        existingCount={orders.length}
      />

      {/* MODAL 5: Column & Title Manager */}
      <ColumnManagerModal
        isOpen={isColumnManagerOpen}
        onClose={() => setIsColumnManagerOpen(false)}
        columns={columns}
        onSaveColumns={handleSaveColumns}
      />

      {/* MODAL 6: Print Labels & Routing Sheets */}
      <PrintLabelsModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        orders={orders}
        columns={columns}
        initialSelectedOrderId={printTargetOrderId}
      />

      {/* MODAL 7: Station Kiosk Mode (For mounted tablets at stations) */}
      <StationModeModal
        isOpen={isStationModeOpen}
        onClose={() => setIsStationModeOpen(false)}
        columns={columns}
        allOrders={orders}
        onOrderStationCheckin={handleOrderStationCheckin}
      />
    </div>
  );
}
