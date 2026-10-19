import type { Invoice } from '../../types';

export interface InvoicesDataGridProps {
  invoices: Invoice[];
  onMessage: (invoiceId: string, channel: 'whatsapp' | 'sms') => void;
  onPay: (invoice: Invoice) => void;
  canManage: boolean;
}
