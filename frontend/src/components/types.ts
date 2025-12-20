// components/types.ts - Common TypeScript interfaces for component props
import { ReactNode } from 'react';

// Base component props
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  id?: string;
  'data-testid'?: string;
}

// Size variants
export type SizeVariant = 'sm' | 'md' | 'lg';

// Button variants
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

// Button sizes
export type ButtonSize = 'sm' | 'md' | 'lg';

// Input variants
export type InputVariant = 'default' | 'error' | 'success';

// Status variants for badges, etc.
export type StatusVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

// Position variants
export type PositionVariant = 'top' | 'bottom' | 'left' | 'right';

// Alignment variants
export type AlignVariant = 'start' | 'center' | 'end';

// Direction variants
export type DirectionVariant = 'horizontal' | 'vertical';

// Icon props
export interface IconProps extends BaseComponentProps {
  size?: SizeVariant;
  color?: string;
}

// Common form field props
export interface FormFieldProps extends BaseComponentProps {
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
}

// Table column definition
export interface TableColumn<T = any> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: T) => ReactNode;
}

// Table props
export interface TableProps<T = any> extends BaseComponentProps {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

// Modal props
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closable?: boolean;
}

// Toast props
export interface ToastProps extends BaseComponentProps {
  type: StatusVariant;
  message: string;
  duration?: number;
  onClose?: () => void;
}

// Step props for stepper
export interface StepProps {
  title: string;
  description?: string;
  completed?: boolean;
  active?: boolean;
}

// Card props
export interface CardProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  padding?: SizeVariant;
}