// Types pour le module Caissier

export interface CashierTransaction {
  id: string;
  cashierId: number;
  clientId: string;
  clientName: string;
  type: 'payment' | 'invoice' | 'cageots_in' | 'cageots_out';
  amount: number;
  description: string;
  createdAt: string;
  hangar: string;
  status: 'completed' | 'pending' | 'cancelled';
  reference?: string; // Invoice ID or Payment ID
}

export interface DailyClosure {
  id: string;
  cashierId: number;
  cashierName: string;
  hangar: string;
  date: string;
  openingBalance: number;
  closingBalance: number;
  totalCash: number;
  totalMobileMoney: number;
  totalBank: number;
  totalTransactions: number;
  totalAmount: number;
  status: 'open' | 'closed' | 'validated';
  transactions: CashierTransaction[];
  createdAt: string;
  closedAt?: string;
  validatedBy?: number;
  validatedAt?: string;
  notes?: string;
}

export interface CashierStats {
  todayRevenue: number;
  todayTransactions: number;
  pendingPayments: number;
  pendingInvoices: number;
  totalCageotsIn: number;
  totalCageotsOut: number;
  lastTransaction?: CashierTransaction;
}

export interface HangarClients {
  hangar: string;
  clients: ClientSummary[];
}

export interface ClientSummary {
  id: string;
  name: string;
  phone: string;
  debt: number;
  cageots: number;
  lastPurchase: string;
  status: 'good' | 'warning' | 'critical';
}

export interface InvoiceCreate {
  clientId: string;
  clientName: string;
  items: InvoiceItem[];
  hangar: string;
  responsiblePerson: string;
  dueDate: string;
  notes?: string;
}

export interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
  cageots?: number;
}

export interface PaymentCreate {
  clientId: string;
  clientName: string;
  invoices: string[];
  amount: number;
  method: 'cash' | 'mobile_money' | 'bank_transfer' | 'check';
  notes?: string;
}

export interface CageotsTransaction {
  clientId: string;
  type: 'add' | 'remove';
  quantity: number;
  reason: string;
}

export interface DailyReport {
  date: string;
  hangar: string;
  cashierName: string;
  openingTime: string;
  closingTime: string;
  totalSales: number;
  totalPayments: number;
  totalCash: number;
  totalMobileMoney: number;
  totalBank: number;
  transactionsCount: number;
  invoicesCreated: number;
  invoicesPaid: number;
  cageotsIn: number;
  cageotsOut: number;
  balanceChange: number;
  notes?: string;
}

