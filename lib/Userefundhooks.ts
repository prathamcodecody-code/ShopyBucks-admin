/**
 * Advanced TypeScript Hooks for Refund Dashboard
 * Handles state management, API calls, and business logic
 */

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  Dispatch,
  SetStateAction,
  FC,
} from "react";
import {
  Refund,
  RefundStatus,
  RefundStats,
  Pagination,
  NotificationType,
} from "./refund.types";
import refundService from "./refundservice";

// ========================================
// Refund Query Hook
// ========================================

interface UseRefundsReturn {
  refunds: Refund[];
  pagination: Pagination;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export const useRefunds = (
  activeTab: string,
  statusFilter: RefundStatus | "all",
  searchTerm: string,
  page: number = 1,
  limit: number = 20
): UseRefundsReturn => {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRefunds = async () => {
      setIsLoading(true);
      setIsError(false);
      setError(null);

      try {
        const response = await refundService.getRefunds(statusFilter, page, limit);
        let filtered = response.data || [];

        // Client-side filtering
        const typeMap: Record<string, string> = {
          "order-refunds": "ORDER",
          "wallet-topup": "WALLET_TOPUP",
          "seller-credits": "SELLER_CREDIT",
        };

        if (activeTab !== "all" && typeMap[activeTab]) {
          filtered = filtered.filter((r) => r.type === typeMap[activeTab]);
        }

        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filtered = filtered.filter((r) => {
            const userEmail = "userEmail" in r ? r.userEmail : "";
            const sellerEmail = "sellerEmail" in r ? r.sellerEmail : "";
            const orderId = "orderId" in r ? r.orderId : null;

            return (
              userEmail?.toLowerCase().includes(term) ||
              sellerEmail?.toLowerCase().includes(term) ||
              orderId?.toString().includes(term) ||
              r.id?.toString().includes(term)
            );
          });
        }

        setRefunds(filtered);
        setPagination(response.pagination);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);
        setIsError(true);
        console.error("Error fetching refunds:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRefunds();
  }, [activeTab, statusFilter, searchTerm, page, limit]);

  return {
    refunds,
    pagination,
    isLoading,
    isError,
    error,
  };
};

// ========================================
// Process Refund Hook
// ========================================

interface UseProcessRefundReturn {
  processRefund: (
    refundId: number,
    action: "APPROVE" | "REJECT",
    notes?: string
  ) => Promise<any>;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  reset: () => void;
}

export const useProcessRefund = (): UseProcessRefundReturn => {
  const [isPending, setIsPending] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const processRefund = useCallback(
    async (
      refundId: number,
      action: "APPROVE" | "REJECT",
      notes: string = ""
    ) => {
      setIsPending(true);
      setIsError(false);
      setError(null);

      try {
        const result = await refundService.processRefund(refundId, action, notes);
        setIsPending(false);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);
        setIsError(true);
        setIsPending(false);
        throw error;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setIsPending(false);
    setIsError(false);
    setError(null);
  }, []);

  return {
    processRefund,
    isPending,
    isError,
    error,
    reset,
  };
};

// ========================================
// Refund Stats Hook
// ========================================

export const useRefundStats = (refunds: Refund[]): RefundStats => {
  const [stats, setStats] = useState<RefundStats>({
    total: 0,
    pending: 0,
    completed: 0,
    failed: 0,
    rejected: 0,
    totalAmount: 0,
    avgProcessingTime: 0,
    avgRefundAmount: 0,
  });

  useEffect(() => {
    if (refunds.length > 0) {
      const pending = refunds.filter((r) => r.status === "PENDING").length;
      const completed = refunds.filter((r) => r.status === "COMPLETED").length;
      const failed = refunds.filter((r) => r.status === "FAILED").length;
      const rejected = refunds.filter((r) => r.status === "REJECTED").length;
      const totalAmount = refunds.reduce((sum, r) => sum + r.amount, 0);

      setStats({
        total: refunds.length,
        pending,
        completed,
        failed,
        rejected,
        totalAmount,
        avgProcessingTime: 24,
        avgRefundAmount: totalAmount / refunds.length,
      });
    }
  }, [refunds]);

  return stats;
};

// ========================================
// Pagination Hook
// ========================================

interface UsePaginationReturn<T> {
  currentPage: number;
  totalPages: number;
  currentItems: T[];
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const usePagination = <T,>(
  items: T[] = [],
  pageSize: number = 20
): UsePaginationReturn<T> => {
  const [currentPage, setCurrentPage] = useState<number>(1);

  const totalPages = Math.ceil(items.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentItems = items.slice(startIndex, endIndex);

  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  return {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
};

// ========================================
// Debounced Search Hook
// ========================================

interface UseDebouncedSearchReturn {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  debouncedValue: string;
}

export const useDebouncedSearch = (
  initialValue: string = "",
  delay: number = 300
): UseDebouncedSearchReturn => {
  const [value, setValue] = useState<string>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<string>(initialValue);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return {
    value,
    setValue,
    debouncedValue,
  };
};

// ========================================
// Modal Hook
// ========================================

interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useModal = (initialState: boolean = false): UseModalReturn => {
  const [isOpen, setIsOpen] = useState<boolean>(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
};

// ========================================
// Form State Hook
// ========================================

interface UseFormStateReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  setFieldValue: <K extends keyof T>(name: K, value: T[K]) => void;
  setFieldError: <K extends keyof T>(name: K, error: string) => void;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
  reset: () => void;
}

export const useFormState = <T extends Record<string, any>>(
  initialValues: T
): UseFormStateReturn<T> => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target as any;
      setValues((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      }));

      if (errors[name as keyof T]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[name as keyof T];
          return next;
        });
      }
    },
    [errors]
  );

  const setFieldValue = useCallback(<K extends keyof T>(name: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setFieldError = useCallback(
    <K extends keyof T>(name: K, error: string) => {
      setErrors((prev) => ({ ...prev, [name]: error }));
    },
    []
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    setFieldValue,
    setFieldError,
    setIsSubmitting,
    reset,
  };
};

// ========================================
// Notification Hook
// ========================================

interface Notification {
  message: string;
  type: NotificationType;
}

interface UseNotificationReturn {
  notification: Notification | null;
  show: (message: string, type?: NotificationType, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
}

export const useNotification = (): UseNotificationReturn => {
  const [notification, setNotification] = useState<Notification | null>(null);

  const show = useCallback(
    (message: string, type: NotificationType = "info", duration: number = 3000) => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), duration);
    },
    []
  );

  const showSuccess = useCallback(
    (message: string, duration?: number) => {
      show(message, "success", duration);
    },
    [show]
  );

  const showError = useCallback(
    (message: string, duration?: number) => {
      show(message, "error", duration);
    },
    [show]
  );

  const showWarning = useCallback(
    (message: string, duration?: number) => {
      show(message, "warning", duration);
    },
    [show]
  );

  return {
    notification,
    show,
    showSuccess,
    showError,
    showWarning,
  };
};

// ========================================
// Export Refunds Hook
// ========================================

interface UseExportRefundsReturn {
  exportToCSV: (refunds: Refund[], filename?: string) => Promise<void>;
  isExporting: boolean;
  exportError: Error | null;
}

export const useExportRefunds = (): UseExportRefundsReturn => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportError, setExportError] = useState<Error | null>(null);

  const exportToCSV = useCallback(
    async (refunds: Refund[], filename: string = "refunds"): Promise<void> => {
      try {
        setIsExporting(true);
        setExportError(null);

        const headers = [
          "ID",
          "Type",
          "User Email",
          "Amount",
          "Status",
          "Reason",
          "Created Date",
        ];

        const rows = refunds.map((r) => {
          const userEmail = "userEmail" in r ? r.userEmail : "sellerEmail" in r ? r.sellerEmail : "N/A";
          return [
            r.id,
            r.type,
            userEmail,
            r.amount,
            r.status,
            r.reason,
            new Date(r.createdAt).toLocaleDateString(),
          ];
        });

        const csv = [
          headers.join(","),
          ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
        ].join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setIsExporting(false);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setExportError(error);
        setIsExporting(false);
        throw error;
      }
    },
    []
  );

  return {
    exportToCSV,
    isExporting,
    exportError,
  };
};

// ========================================
// Adjust Wallet Hook
// ========================================

interface UseAdjustWalletReturn {
  adjustWallet: (userId: number, amount: number, reason: string) => Promise<any>;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
}

export const useAdjustWallet = (): UseAdjustWalletReturn => {
  const [isPending, setIsPending] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const adjustWallet = useCallback(
    async (userId: number, amount: number, reason: string) => {
      setIsPending(true);
      setIsError(false);
      setError(null);

      try {
        const result = await refundService.adjustUserWallet(userId, amount, reason);
        setIsPending(false);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);
        setIsError(true);
        setIsPending(false);
        throw error;
      }
    },
    []
  );

  return {
    adjustWallet,
    isPending,
    isError,
    error,
  };
};

// ========================================
// Refund Topup Hook
// ========================================

interface UseRefundTopupReturn {
  refundTopup: (
    topupId: number,
    userId: number,
    amount: number,
    txnid: string,
    reason?: string
  ) => Promise<any>;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
}

export const useRefundTopup = (): UseRefundTopupReturn => {
  const [isPending, setIsPending] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const refundTopup = useCallback(
    async (
      topupId: number,
      userId: number,
      amount: number,
      txnid: string,
      reason: string = ""
    ) => {
      setIsPending(true);
      setIsError(false);
      setError(null);

      try {
        const result = await refundService.refundTopup(
          topupId,
          userId,
          amount,
          txnid,
          reason
        );
        setIsPending(false);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);
        setIsError(true);
        setIsPending(false);
        throw error;
      }
    },
    []
  );

  return {
    refundTopup,
    isPending,
    isError,
    error,
  };
};