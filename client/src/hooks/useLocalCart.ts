export interface LocalCartItem {
  productId: number;
  quantity: number;
  product: {
    id: number;
    title: string;
    price: string;
    coverImageUrl?: string;
    stock: number;
  };
}

const CART_KEY = "cavally_cart";

export function getLocalCart(): LocalCartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveLocalCart(items: LocalCartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToLocalCart(product: LocalCartItem["product"], quantity = 1) {
  const cart = getLocalCart();
  const existing = cart.find((i) => i.productId === product.id);
  if (existing) { existing.quantity += quantity; }
  else { cart.push({ productId: product.id, quantity, product }); }
  saveLocalCart(cart);
  window.dispatchEvent(new Event("local-cart-updated"));
}

export function updateLocalCartItem(productId: number, quantity: number) {
  if (quantity <= 0) { removeFromLocalCart(productId); return; }
  const cart = getLocalCart();
  const item = cart.find((i) => i.productId === productId);
  if (item) { item.quantity = quantity; saveLocalCart(cart); window.dispatchEvent(new Event("local-cart-updated")); }
}

export function removeFromLocalCart(productId: number) {
  saveLocalCart(getLocalCart().filter((i) => i.productId !== productId));
  window.dispatchEvent(new Event("local-cart-updated"));
}

export function clearLocalCart() {
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new Event("local-cart-updated"));
}

export function getLocalCartCount(): number {
  return getLocalCart().reduce((sum, i) => sum + i.quantity, 0);
}
