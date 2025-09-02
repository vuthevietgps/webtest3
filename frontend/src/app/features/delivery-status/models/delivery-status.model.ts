export interface DeliveryStatus {
  _id?: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  isActive: boolean;
  isFinal: boolean;
  order: number;
  estimatedDays?: number;
  trackingNote?: string;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateDeliveryStatusDto {
  name: string;
  description: string;
  color: string;
  icon: string;
  isActive?: boolean;
  isFinal?: boolean;
  order?: number;
  estimatedDays?: number;
  trackingNote?: string;
  metadata?: Record<string, any>;
}

export interface DeliveryStatusStats {
  total: number;
  active: number;
  inactive: number;
  finalStatuses: number;
  averageEstimatedDays: number;
}
