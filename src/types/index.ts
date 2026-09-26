export type Priority = 'normal' | 'high' | 'urgent';

export interface ProductionNote {
  id: string;
  timestamp: string;
  operator: string;
  text: string;
  type: 'info' | 'deviation' | 'approved' | 'stage_change';
  stageName?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: string;
}

export interface ProductionOrder {
  id: string; // t.ex. "AO-2026-101"
  title: string; // Produktnamn t.ex. "Ventilblock VB-40 Hydraulik"
  articleNumber: string; // t.ex. "ART-8910"
  customer: string; // t.ex. "Hydraulik Nord AB"
  batchSize: number; // t.ex. 25
  unit: string; // t.ex. "st", "satser", "enheter"
  priority: Priority;
  columnId: string;
  targetDate: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
  operator?: string;
  notes: ProductionNote[];
  checklists: Record<string, ChecklistItem[]>;
  tags: string[];
  qrPayload: string;
  drawingNumber?: string; // Ritningsnummer
}

export interface ColumnConfig {
  id: string;
  title: string;
  headerBg: string; // Pastel background hex
  borderColor: string; // Border hex
  headerTextColor: string; // Text color
  description?: string;
}

export type ViewMode = 'board' | 'station' | 'print_preview';
