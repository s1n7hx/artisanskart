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
  const res = await fetch('/api/orders/update-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId,
      newStatus,
      actorRole: 'admin',
      actorName: 'System',
      trackingAwb: trackingInfo?.trackingAwb,
      courierName: trackingInfo?.courierName,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to update order status.');
  }
  return data.order;
}
