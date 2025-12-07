export interface OrderProduct { productId: string; quantity: number; }
export interface OrderRecord { orderId: string; products: OrderProduct[]; createdAt?: string; }
export interface GroupedOrders { [orderId: string]: { orderId: string; products: OrderProduct[]; createdAt?: string } }

export function groupOrders(ordersArray: OrderRecord[]): GroupedOrders {
  return ordersArray.reduce<GroupedOrders>((acc, curr) => {
    const id = curr.orderId;
    if (!acc[id]) {
      acc[id] = { orderId: id, products: [], createdAt: curr.createdAt };
    }
    acc[id].products.push(...curr.products);
    return acc;
  }, {});
}
