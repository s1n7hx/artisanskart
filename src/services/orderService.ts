import { supabase } from './supabase';
import { OrderStatus } from '../types';

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  trackingInfo?: {
    trackingAwb?: string;
    courierName?: string;
    estimatedDelivery?: string;
  }
) {
  const updateData: any = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  if (trackingInfo) {
    if (trackingInfo.trackingAwb) updateData.tracking_awb = trackingInfo.trackingAwb;
    if (trackingInfo.courierName) updateData.courier_name = trackingInfo.courierName;
    if (trackingInfo.estimatedDelivery) updateData.estimated_delivery = trackingInfo.estimatedDelivery;
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
