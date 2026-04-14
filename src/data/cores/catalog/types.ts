export interface CatalogItem {
  id: string;
  model: string;
  manufacturer: string;
  category: 'server' | 'switch' | 'transceiver' | 'cable' | 'pdu' | 'cabinet' | 'other';
  description: string;
  partNumber: string;
  estimatedCost: string;
  specs: string;
  vendorIds: string[];
}
