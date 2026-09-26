import { ColumnConfig, ProductionOrder } from '../types';

export const DEFAULT_COLUMNS: ColumnConfig[] = [
  {
    id: 'col-planerat',
    title: 'Planerat',
    headerBg: '#dbeafe', // soft blue matching screenshot
    borderColor: '#93c5fd',
    headerTextColor: '#1e3a8a',
    description: 'Ordinarie order inlagd och väntar på produktionsstart',
  },
  {
    id: 'col-material',
    title: 'Material uttaget',
    headerBg: '#dcfce7', // soft green matching screenshot
    borderColor: '#86efac',
    headerTextColor: '#14532d',
    description: 'Råmaterial och komponenter plockade från lagret',
  },
  {
    id: 'col-montering',
    title: 'Montering',
    headerBg: '#fef3c7', // soft warm yellow/amber matching screenshot
    borderColor: '#fde047',
    headerTextColor: '#713f12',
    description: 'Aktiv montering och mekanisk/elektrisk sammanställning',
  },
  {
    id: 'col-test',
    title: 'Test',
    headerBg: '#f3e8ff', // soft lavender/purple matching screenshot
    borderColor: '#d8b4fe',
    headerTextColor: '#581c87',
    description: 'Kvalitetstest, provtryckning, mätning och funktionsverifiering',
  },
  {
    id: 'col-packning',
    title: 'Packning',
    headerBg: '#fce7f3', // soft pink/rose matching screenshot
    borderColor: '#f9a8d4',
    headerTextColor: '#831843',
    description: 'Slutrengöring, märkning och emballering',
  },
  {
    id: 'col-leverans',
    title: 'Klar för leverans',
    headerBg: '#dcfce7', // light mint/sage matching screenshot
    borderColor: '#86efac',
    headerTextColor: '#14532d',
    description: 'Färdigställt gods uppställt på leveranstorg',
  },
];

export const TEMPLATES: Record<string, { name: string; columns: ColumnConfig[] }> = {
  original: {
    name: 'Verkstad standard (från bild)',
    columns: DEFAULT_COLUMNS,
  },
  mechanical: {
    name: 'Mekanisk bearbetning',
    columns: [
      { id: 'col-beredning', title: 'Beredning', headerBg: '#e0f2fe', borderColor: '#7dd3fc', headerTextColor: '#0369a1' },
      { id: 'col-laser', title: 'Laserskärning', headerBg: '#fee2e2', borderColor: '#fca5a5', headerTextColor: '#991b1b' },
      { id: 'col-bockning', title: 'Kantpress / Bock', headerBg: '#fef3c7', borderColor: '#fde047', headerTextColor: '#854d0e' },
      { id: 'col-svets', title: 'Svetsning & Slip', headerBg: '#ffedd5', borderColor: '#fdba74', headerTextColor: '#9a3412' },
      { id: 'col-ytbeh', title: 'Ytbehandling', headerBg: '#f3e8ff', borderColor: '#d8b4fe', headerTextColor: '#6b21a8' },
      { id: 'col-kontroll', title: 'Slutkontroll', headerBg: '#dcfce7', borderColor: '#86efac', headerTextColor: '#166534' },
      { id: 'col-utleverans', title: 'Klar för avgång', headerBg: '#ccfbf1', borderColor: '#5eead4', headerTextColor: '#115e59' },
    ],
  },
  electronics: {
    name: 'Elektronik & Kretskort',
    columns: [
      { id: 'col-el-plan', title: 'Planering', headerBg: '#e0f2fe', borderColor: '#7dd3fc', headerTextColor: '#0369a1' },
      { id: 'col-el-kitting', title: 'Kitting / Plock', headerBg: '#fef3c7', borderColor: '#fde047', headerTextColor: '#854d0e' },
      { id: 'col-el-smd', title: 'SMD-lina', headerBg: '#f3e8ff', borderColor: '#d8b4fe', headerTextColor: '#6b21a8' },
      { id: 'col-el-aoi', title: 'Optisk AOI / Syn', headerBg: '#ffedd5', borderColor: '#fdba74', headerTextColor: '#9a3412' },
      { id: 'col-el-box', title: 'Box-Build', headerBg: '#fce7f3', borderColor: '#f9a8d4', headerTextColor: '#831843' },
      { id: 'col-el-functest', title: 'Funktionstest & Bränning', headerBg: '#dcfce7', borderColor: '#86efac', headerTextColor: '#166534' },
      { id: 'col-el-klar', title: 'Packat & Klart', headerBg: '#ccfbf1', borderColor: '#5eead4', headerTextColor: '#115e59' },
    ],
  },
};

export const INITIAL_ORDERS: ProductionOrder[] = [
  {
    id: 'AO-2026-101',
    title: 'Hydraulventilblock HVB-420',
    articleNumber: 'ART-99201',
    customer: 'Nordic Hydraulic AB',
    batchSize: 12,
    unit: 'st',
    priority: 'high',
    columnId: 'col-planerat',
    targetDate: '2026-10-02',
    drawingNumber: 'RIT-4421-C',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    operator: 'Mikael B',
    tags: ['CNC-fräst', 'Härdat stål'],
    qrPayload: 'AO-2026-101',
    notes: [
      {
        id: 'n1',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        operator: 'Mikael B',
        text: 'Produktionsorder upplagd. Ritning RIT-4421-C granskad och godkänd.',
        type: 'info',
        stageName: 'Planerat',
      },
    ],
    checklists: {
      'col-planerat': [
        { id: 'c1', text: 'Ritningsunderlag verifierat', completed: true, completedBy: 'Mikael B' },
        { id: 'c2', text: 'Råmaterial reserverat i lager', completed: true, completedBy: 'Mikael B' },
      ],
    },
  },
  {
    id: 'AO-2026-102',
    title: 'Stativram Robotcell R-28',
    articleNumber: 'ART-88140',
    customer: 'ABB Automation',
    batchSize: 2,
    unit: 'satser',
    priority: 'normal',
    columnId: 'col-planerat',
    targetDate: '2026-10-05',
    drawingNumber: 'RIT-2800-A',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    operator: 'Sara L',
    tags: ['Svetskonstruktion', 'Målning RAL7016'],
    qrPayload: 'AO-2026-102',
    notes: [
      {
        id: 'n2',
        timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
        operator: 'Sara L',
        text: 'Stålprofiler 80x80 beställda till kapstation.',
        type: 'info',
        stageName: 'Planerat',
      },
    ],
    checklists: {},
  },
  {
    id: 'AO-2026-098',
    title: 'Styrpanel Touch SP-700',
    articleNumber: 'ART-10499',
    customer: 'Scania CV',
    batchSize: 40,
    unit: 'st',
    priority: 'urgent',
    columnId: 'col-material',
    targetDate: '2026-09-28',
    drawingNumber: 'EL-700-REV3',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    operator: 'Peter K',
    tags: ['Express', 'Känslig elektronik'],
    qrPayload: 'AO-2026-098',
    notes: [
      {
        id: 'n3',
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        operator: 'Lager / Anna',
        text: 'Komponentplock färdigt i kitting-vagn 4. Kapslingar och kablage kompletta.',
        type: 'approved',
        stageName: 'Material uttaget',
      },
    ],
    checklists: {
      'col-material': [
        { id: 'c3', text: 'Kretskort verifierade mot stycklista', completed: true, completedBy: 'Anna M' },
        { id: 'c4', text: 'Kapsling och displayer utplockade', completed: true, completedBy: 'Anna M' },
      ],
    },
  },
  {
    id: 'AO-2026-095',
    title: 'Kuggväxelhus KV-160',
    articleNumber: 'ART-55310',
    customer: 'Volvo GTO Skövde',
    batchSize: 8,
    unit: 'st',
    priority: 'high',
    columnId: 'col-montering',
    targetDate: '2026-09-29',
    drawingNumber: 'M-160-04',
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    operator: 'Johan E',
    tags: ['Lagerpassning', 'Tätning'],
    qrPayload: 'AO-2026-095',
    notes: [
      {
        id: 'n4',
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
        operator: 'Johan E',
        text: 'Lager monterade med induktionsvärmare. Axlar injusterade till rätt axialspel.',
        type: 'info',
        stageName: 'Montering',
      },
      {
        id: 'n5',
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
        operator: 'Johan E',
        text: 'Varning: Momentnyckel kalibrerad, dragmoment 145 Nm applicerat på alla bultar.',
        type: 'approved',
        stageName: 'Montering',
      },
    ],
    checklists: {
      'col-montering': [
        { id: 'cm1', text: 'Lager monterade med rätt presspassning', completed: true, completedBy: 'Johan E' },
        { id: 'cm2', text: 'Tätningsringar insmorda och centrerade', completed: true, completedBy: 'Johan E' },
        { id: 'cm3', text: 'Momentdragning utförd och märkt med färgpenna', completed: true, completedBy: 'Johan E' },
      ],
    },
  },
  {
    id: 'AO-2026-092',
    title: 'Provtrycksmodul PM-300 Bar',
    articleNumber: 'ART-77211',
    customer: 'Parker Hannifin',
    batchSize: 4,
    unit: 'st',
    priority: 'normal',
    columnId: 'col-test',
    targetDate: '2026-09-30',
    drawingNumber: 'HYD-300-TEST',
    createdAt: new Date(Date.now() - 3600000 * 96).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    operator: 'Emma S',
    tags: ['Klass 1 provtryck', 'Olja ISO VG 46'],
    qrPayload: 'AO-2026-092',
    notes: [
      {
        id: 'n6',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        operator: 'Emma S',
        text: 'Enhet 1 och 2 provtryckta till 350 bar i 15 minuter utan tryckfall. Enhet 3 och 4 under provning.',
        type: 'approved',
        stageName: 'Test',
      },
    ],
    checklists: {
      'col-test': [
        { id: 'ct1', text: 'Täthetsprovning 350 bar utförd', completed: true, completedBy: 'Emma S' },
        { id: 'ct2', text: 'Flödesmätning loggad i testsystem', completed: false },
      ],
    },
  },
  {
    id: 'AO-2026-089',
    title: 'Kablagesats Cabin-Wiring C4',
    articleNumber: 'ART-33100',
    customer: 'Komatsu Forest',
    batchSize: 15,
    unit: 'satser',
    priority: 'normal',
    columnId: 'col-packning',
    targetDate: '2026-09-27',
    drawingNumber: 'KAB-C4-2026',
    createdAt: new Date(Date.now() - 3600000 * 120).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    operator: 'David N',
    tags: ['Märkt Deutsch-kontakt', 'Krympslang'],
    qrPayload: 'AO-2026-089',
    notes: [
      {
        id: 'n7',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        operator: 'David N',
        text: 'Testprotokoll och följesedel bifogade i kartong. Antistatpåsar förseglade.',
        type: 'info',
        stageName: 'Packning',
      },
    ],
    checklists: {
      'col-packning': [
        { id: 'cp1', text: 'Följesedel och testintyg ilagt', completed: true, completedBy: 'David N' },
        { id: 'cp2', text: 'Kollimärkning med streckkod klistrad', completed: true, completedBy: 'David N' },
      ],
    },
  },
  {
    id: 'AO-2026-084',
    title: 'Ventilblock VB-12 Aluminium',
    articleNumber: 'ART-99120',
    customer: 'Valmet Power',
    batchSize: 50,
    unit: 'st',
    priority: 'normal',
    columnId: 'col-leverans',
    targetDate: '2026-09-26',
    drawingNumber: 'AL-12-08',
    createdAt: new Date(Date.now() - 3600000 * 150).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 7).toISOString(),
    operator: 'Lager / Håkan',
    tags: ['EU-pall', 'Plastad'],
    qrPayload: 'AO-2026-084',
    notes: [
      {
        id: 'n8',
        timestamp: new Date(Date.now() - 3600000 * 7).toISOString(),
        operator: 'Lager / Håkan',
        text: 'Placerad på pallplats G-12. Väntar på DHL upphämtning kl 14:00.',
        type: 'approved',
        stageName: 'Klar för leverans',
      },
    ],
    checklists: {
      'col-leverans': [
        { id: 'cl1', text: 'Pall plastad och märkt med fraktetikett', completed: true, completedBy: 'Håkan' },
      ],
    },
  },
];

const STORAGE_KEYS = {
  ORDERS: 'planeringstavla_orders_v1',
  COLUMNS: 'planeringstavla_columns_v1',
  OPERATOR_NAME: 'planeringstavla_operator_name',
  LAST_SYNC: 'planeringstavla_last_sync',
};

// Cross-tab real-time sync channel
let syncChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    syncChannel = new BroadcastChannel('planeringstavla_sync_channel');
  } catch {
    syncChannel = null;
  }
}

export function loadStoredOrders(): ProductionOrder[] {
  if (typeof window === 'undefined') return INITIAL_ORDERS;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!data) {
      saveStoredOrders(INITIAL_ORDERS);
      return INITIAL_ORDERS;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse orders:', e);
    return INITIAL_ORDERS;
  }
}

export function saveStoredOrders(orders: ProductionOrder[], notify = true) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    if (notify && syncChannel) {
      syncChannel.postMessage({ type: 'ORDERS_UPDATED', orders, timestamp: Date.now() });
    }
  } catch (e) {
    console.error('Failed to save orders:', e);
  }
}

export function loadStoredColumns(): ColumnConfig[] {
  if (typeof window === 'undefined') return DEFAULT_COLUMNS;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.COLUMNS);
    if (!data) {
      saveStoredColumns(DEFAULT_COLUMNS);
      return DEFAULT_COLUMNS;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse columns:', e);
    return DEFAULT_COLUMNS;
  }
}

export function saveStoredColumns(columns: ColumnConfig[], notify = true) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.COLUMNS, JSON.stringify(columns));
    if (notify && syncChannel) {
      syncChannel.postMessage({ type: 'COLUMNS_UPDATED', columns, timestamp: Date.now() });
    }
  } catch (e) {
    console.error('Failed to save columns:', e);
  }
}

export function getStoredOperatorName(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEYS.OPERATOR_NAME) || '';
}

export function setStoredOperatorName(name: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.OPERATOR_NAME, name);
}

export function subscribeToSync(
  onOrdersChange: (orders: ProductionOrder[]) => void,
  onColumnsChange: (columns: ColumnConfig[]) => void
): () => void {
  if (!syncChannel) return () => {};

  const handler = (event: MessageEvent) => {
    if (event.data?.type === 'ORDERS_UPDATED' && event.data.orders) {
      onOrdersChange(event.data.orders);
    } else if (event.data?.type === 'COLUMNS_UPDATED' && event.data.columns) {
      onColumnsChange(event.data.columns);
    }
  };

  syncChannel.addEventListener('message', handler);
  return () => {
    syncChannel?.removeEventListener('message', handler);
  };
}
