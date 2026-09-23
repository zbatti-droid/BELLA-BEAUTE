export type PricedItem = { name: string; price: string };

export function parsePrice(price: string): number {
  return Number(price.replace(/[^0-9]/g, '')) || 0;
}

export function calculateCartTotal(items: PricedItem[]): number {
  return items.reduce((sum, item) => sum + parsePrice(item.price), 0);
}

export function formatOrderMessage(items: PricedItem[]): string {
  return `مرحباً BELLA BEAUTÉ، أريد طلب: ${items.map(item => item.name).join(', ')}.`;
}
