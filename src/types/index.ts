export * from './auth';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  whatsappSecret?: string;
  whatsappAccount?: string;
}

export interface Customer {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
}

export interface App {
  id: string;
  userId: string;
  name: string;
  price: number;
  codesAvailable: number;
}

export interface AppCombo {
  id: string;
  userId: string;
  name: string;
  price: number;
  apps: App[];
}

export interface Code {
  id: string;
  appId: string;
  code: string;
  used: boolean;
}

export interface SaleItem {
  appId: string;
  quantity: number;
  price: number;
  codes: string[];
  isCombo?: boolean;
  comboId?: string;
}

export interface Sale {
  id: string;
  userId: string;
  customerId: string;
  items: SaleItem[];
  totalPrice: number;
  date: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}