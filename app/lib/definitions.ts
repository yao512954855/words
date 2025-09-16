// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.
// For simplicity of teaching, we're manually defining these types.
// However, these types are generated automatically if you're using an ORM such as Prisma.
export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  ok: string; // '0' for not matched, '1' for matched
};

export type Invoice = {
  id: string;
  customer_id: string;
  amount: number;
  date: string;
  // In TypeScript, this is called a string union type.
  // It means that the "status" property can only be one of the two strings: 'pending' or 'paid'.
  status: 'pending' | 'paid';
};

export type Revenue = {
  month: string;
  revenue: number;
};

export type LatestInvoice = {
  id: string;
  name: string;
  image_url: string;
  email: string;
  amount: string;
};

// The database returns a number for amount, but we later format it to a string with the formatCurrency function
export type LatestInvoiceRaw = Omit<LatestInvoice, 'amount'> & {
  amount: number;
};

export type InvoicesTable = {
  id: string;
  customer_id: string;
  name: string;
  email: string;
  image_url: string;
  date: string;
  amount: number;
  status: 'pending' | 'paid';
};

export type CustomersTableType = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: number;
  total_paid: number;
};

export type FormattedCustomersTable = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: string;
  total_paid: string;
};

export type CustomerField = {
  id: string;
  name: string;
};

export type InvoiceForm = {
  id: string;
  customer_id: string;
  amount: number;
  status: 'pending' | 'paid';
};

// app/lib/definitions.ts 新增
export type Word = {
  id: string;
  word: string;
  phonetic: string | null;
  definition: string;
  example: string | null;
  category: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  created_at: string;
  updated_at: string;
};

export type UserWord = {
  id: string;
  user_id: string;
  word_id: string;
  status: 'new' | 'learning' | 'mastered';
  review_count: number;
  last_reviewed: string | null;
  next_review: string | null;
  created_at: string;
  updated_at: string;
  // 联合单词详情（查询时关联）
  word?: Word;
};

export type FilteredWordsTableType = {
  id: string;
  word: string;
  definition: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  total_count?: number; // 可选，用于分页
};

export type CustomerForm = {
  id: string;
  customer_id: string;
  amount: number;
  status: 'pending' | 'paid';
};
