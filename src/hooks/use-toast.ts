
import { toast as sonnerToast } from 'sonner';
import { type ToastProps } from "@/components/ui/toast";

// Create a mock toast array to satisfy the toaster component
const mockToasts: any[] = [];

// Enhanced Toast function with better typing
export function toast(props: ToastProps) {
  const { title, description, variant, ...rest } = props;
  
  if (variant === 'destructive') {
    return sonnerToast.error(title as string || 'Error', {
      description,
      ...rest
    });
  }
  
  if (variant === 'success' || title === 'Success') {
    return sonnerToast.success(title as string || 'Success', {
      description,
      ...rest
    });
  }

  return sonnerToast(title as string || '', {
    description,
    ...rest
  });
}

// Keep the original hook for compatibility
export const useToast = () => {
  return {
    toast,
    toasts: mockToasts
  };
};
