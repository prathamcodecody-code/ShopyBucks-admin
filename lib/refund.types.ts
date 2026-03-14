/**
 * TypeScript Types for Refund Management System
 */

// ========================================
// Refund Types
// ========================================

/**
 * Refund Status
 */
export type RefundStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REJECTED' | 'REFUNDED';

/**
 * Refund Type
 */
export type RefundType = 'ORDER' | 'WALLET_TOPUP' | 'SELLER_CREDIT';

/**
 * Refund Action
 */
export type RefundAction = 'APPROVE' | 'REJECT';

/**
 * Order Refund
 */
export interface OrderRefund {
  id: number;
  orderId: number;
  userId: number;
  userEmail: string;
  amount: number;
  status: RefundStatus;
  reason: string;
  type: 'ORDER';
  createdAt: string;
  processedAt?: string;
  processedBy?: number;
  adminNotes?: string;
  items: RefundItem[];
}

/**
 * Wallet Topup Refund
 */
export interface WalletTopupRefund {
  id: number;
  topupId: number;
  userId: number;
  userEmail: string;
  amount: number;
  status: RefundStatus;
  reason: string;
  type: 'WALLET_TOPUP';
  txnid: string;
  createdAt: string;
  processedAt?: string;
  processedBy?: number;
  adminNotes?: string;
  failureReason?: string;
}

/**
 * Seller Credit Refund
 */
export interface SellerCreditRefund {
  id: number;
  purchaseId: number;
  sellerId: number;
  sellerEmail: string;
  amount: number;
  credits?: number;
  status: RefundStatus;
  reason: string;
  type: 'SELLER_CREDIT';
  txnid: string;
  createdAt: string;
  processedAt?: string;
  processedBy?: number;
  adminNotes?: string;
}

/**
 * Union type for any refund
 */
export type Refund = OrderRefund | WalletTopupRefund | SellerCreditRefund;

/**
 * Refund Item (for order refunds)
 */
export interface RefundItem {
  id: number;
  name: string;
  price: number;
  quantity?: number;
  reason?: string;
}

// ========================================
// API Response Types
// ========================================

/**
 * API Response
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}

/**
 * Pagination Info
 */
export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ========================================
// Request Body Types
// ========================================

/**
 * Process Refund Request
 */
export interface ProcessRefundRequest {
  refundId: number;
  action: RefundAction;
  notes?: string;
}

/**
 * Refund Topup Request
 */
export interface RefundTopupRequest {
  topupId: number;
  userId: number;
  amount: number;
  txnid: string;
  reason?: string;
}

/**
 * Refund Purchase Request
 */
export interface RefundPurchaseRequest {
  purchaseId: number;
  userId: number;
  amount: number;
  txnid: string;
  reason?: string;
}

/**
 * Adjust Wallet Request
 */
export interface AdjustWalletRequest {
  userId: number;
  amount: number;
  reason: string;
}

/**
 * Adjust Seller Credits Request
 */
export interface AdjustSellerCreditsRequest {
  sellerId: number;
  credits: number;
  reason: string;
}

// ========================================
// Dashboard State Types
// ========================================

/**
 * Dashboard Statistics
 */
export interface RefundStats {
  total: number;
  pending: number;
  completed: number;
  failed: number;
  rejected: number;
  totalAmount: number;
  avgProcessingTime: number; // in hours
  avgRefundAmount: number;
}

/**
 * Filter State
 */
export interface RefundFilters {
  activeTab: 'all' | 'order-refunds' | 'wallet-topup' | 'seller-credits';
  statusFilter: RefundStatus | 'all';
  searchTerm: string;
  page: number;
  limit: number;
  dateRange?: {
    start: string;
    end: string;
  };
  amountRange?: {
    min: number;
    max: number;
  };
}

/**
 * Modal State
 */
export interface ModalState {
  isOpen: boolean;
  type?: 'detail' | 'action' | 'bulk';
  selectedRefund?: Refund;
}

/**
 * Form State
 */
export interface RefundFormState {
  action?: RefundAction;
  notes: string;
  reason: string;
}

// ========================================
// User & Admin Types
// ========================================

/**
 * Admin User
 */
export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  permissions: AdminPermission[];
  createdAt: string;
}

/**
 * Admin Permissions
 */
export type AdminPermission =
  | 'view_refunds'
  | 'process_refunds'
  | 'approve_refunds'
  | 'reject_refunds'
  | 'adjust_wallets'
  | 'export_data'
  | 'view_analytics';

/**
 * Audit Log
 */
export interface AuditLog {
  id: number;
  adminId: number;
  action: string;
  refundId?: number;
  changes: Record<string, any>;
  timestamp: string;
}

// ========================================
// Service Response Types
// ========================================

/**
 * Get Refunds Response
 */
export interface GetRefundsResponse extends PaginatedResponse<Refund> {}

/**
 * Process Refund Response
 */
export interface ProcessRefundResponse extends ApiResponse<{
  id: number;
  status: RefundStatus;
  processedAt: string;
  processedBy: number;
}> {}

/**
 * Refund Topup Response
 */
export interface RefundTopupResponse extends ApiResponse<{
  id: number;
  status: RefundStatus;
  refundId: number;
}> {}

/**
 * Adjust Wallet Response
 */
export interface AdjustWalletResponse extends ApiResponse<{
  userId: number;
  newBalance: number;
  transaction: {
    id: number;
    amount: number;
    type: string;
    reason: string;
  };
}> {}

// ========================================
// Table Column Types
// ========================================

/**
 * Table Column Definition
 */
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

/**
 * Table Sort
 */
export interface TableSort {
  column: string;
  direction: 'asc' | 'desc';
}

// ========================================
// Hook Return Types
// ========================================

/**
 * Use Refunds Hook Return
 */
export interface UseRefundsReturn {
  refunds: Refund[];
  pagination: Pagination;
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
}

/**
 * Use Process Refund Hook Return
 */
export interface UseProcessRefundReturn {
  processRefund: (data: ProcessRefundRequest) => Promise<any>;
  isPending: boolean;
  isError: boolean;
  error?: Error | null;
}

/**
 * Use Pagination Hook Return
 */
export interface UsePaginationReturn<T> {
  currentPage: number;
  totalPages: number;
  currentItems: T[];
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Use Modal Hook Return
 */
export interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/**
 * Use Form State Hook Return
 */
export interface UseFormStateReturn<T> {
  values: T;
  errors: Record<keyof T, string | undefined>;
  isSubmitting: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  setFieldValue: <K extends keyof T>(name: K, value: T[K]) => void;
  setFieldError: <K extends keyof T>(name: K, error: string) => void;
  setIsSubmitting: (value: boolean) => void;
  reset: () => void;
}

/**
 * Use Notification Hook Return
 */
export interface UseNotificationReturn {
  notification: Notification | null;
  show: (message: string, type?: NotificationType, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
}

/**
 * Notification Type
 */
export interface Notification {
  message: string;
  type: NotificationType;
}

/**
 * Notification Type Options
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// ========================================
// Enum Types
// ========================================

/**
 * Refund Status Enum
 */
export enum RefundStatusEnum {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REJECTED = 'REJECTED',
  REFUNDED = 'REFUNDED',
}

/**
 * Refund Type Enum
 */
export enum RefundTypeEnum {
  ORDER = 'ORDER',
  WALLET_TOPUP = 'WALLET_TOPUP',
  SELLER_CREDIT = 'SELLER_CREDIT',
}

/**
 * Admin Role Enum
 */
export enum AdminRoleEnum {
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

// ========================================
// Utility Types
// ========================================

/**
 * Async Function Type
 */
export type AsyncFunction<T, R> = (data: T) => Promise<R>;

/**
 * Callback Function Type
 */
export type Callback<T> = (data: T) => void;

/**
 * Record Type (key-value mapping)
 */
export type Record<K extends string | number | symbol, T> = {
  [P in K]: T;
};

/**
 * Partial Type (all properties optional)
 */
export type Partial<T> = {
  [P in keyof T]?: T[P];
};

/**
 * Required Type (all properties required)
 */
export type Required<T> = {
  [P in keyof T]-?: T[P];
};

// ========================================
// Validation Types
// ========================================

/**
 * Validation Rule
 */
export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

/**
 * Validation Schema
 */
export type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule;
};

/**
 * Validation Result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// ========================================
// Analytics Types
// ========================================

/**
 * Analytics Event
 */
export interface AnalyticsEvent {
  eventName: string;
  properties: Record<string, any>;
  timestamp: string;
  userId?: number;
}

/**
 * Refund Analytics
 */
export interface RefundAnalytics {
  totalRefunds: number;
  totalAmount: number;
  averageRefundAmount: number;
  approvalRate: number; // percentage
  rejectionRate: number; // percentage
  avgTimeToProcess: number; // hours
  refundsByType: Record<RefundType, number>;
  refundsByReason: Record<string, number>;
  refundsByDate: Array<{
    date: string;
    count: number;
    amount: number;
  }>;
}

// ========================================
// Theme Types
// ========================================

/**
 * Theme Configuration
 */
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    background: string;
    surface: string;
    text: string;
  };
  spacing: Record<string, string>;
  typography: Record<string, any>;
}

/**
 * Color Palette
 */
export type ColorPalette = {
  [K in RefundStatus]: {
    bg: string;
    text: string;
    border: string;
  };
};