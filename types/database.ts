export type AppRole = "customer" | "staff" | "admin";
export type ModifierType = "radio" | "checkbox";
export type OrderStatus = "pending" | "in_progress" | "complete" | "cancelled";

export interface Profile {
  id: string;
  full_name: string | null;
  role: AppRole;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  display_order: number;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: string;
  is_available: boolean;
  created_at: string;
}

export interface Modifier {
  id: string;
  name: string;
  type: ModifierType;
  is_required: boolean;
}

export interface ModifierOption {
  id: string;
  modifier_id: string;
  label: string;
  price_adjustment: number;
}

export interface ProductModifier {
  product_id: string;
  modifier_id: string;
}

export interface Order {
  id: string;
  customer_id: string;
  status: OrderStatus;
  total: number;
  pickup_code: string | null;
  created_at: string;
}

export interface SelectedModifier {
  modifier_id: string;
  modifier_name: string;
  option_id: string;
  option_label: string;
  price_adjustment: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  selected_modifiers: SelectedModifier[];
}

// Joined / enriched types for UI usage

export interface ProductWithCategory extends Product {
  category: Category;
}

export interface ModifierWithOptions extends Modifier {
  modifier_options: ModifierOption[];
}

export interface OrderWithItems extends Order {
  order_items: (OrderItem & { product: Product })[];
}

// Cart types (client-side)

export interface CartItemModifier {
  modifier_id: string;
  modifier_name: string;
  option_id: string;
  option_label: string;
  price_adjustment: number;
}

export interface CartItem {
  id: string; // unique cart line ID
  product_id: string;
  product_name: string;
  product_image_url: string | null;
  base_price: number;
  modifiers: CartItemModifier[];
  quantity: number;
}

