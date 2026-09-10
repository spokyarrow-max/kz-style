// Ręcznie napisane typy odzwierciedlające schemat z supabase/migrations/*.sql.
// Jeśli zmienisz strukturę bazy (nową migracją), zaktualizuj też ten plik.

export type UserRole = "customer" | "admin";
export type ProductGender = "men" | "women" | "unisex";
export type ProductSize = "XS" | "S" | "M" | "L" | "XL" | "XXL";
export type DiscountType = "percentage" | "fixed";
export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          role: UserRole;
          created_at: string;
        };
        Insert: {
          id: string;
          first_name?: string | null;
          last_name?: string | null;
          role?: UserRole;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string | null;
          recipient_name: string;
          street: string;
          city: string;
          postal_code: string;
          country: string;
          phone: string | null;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label?: string | null;
          recipient_name: string;
          street: string;
          city: string;
          postal_code: string;
          country?: string;
          phone?: string | null;
          is_default?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["addresses"]["Insert"]>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          parent_id: string | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          parent_id?: string | null;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [];
      };
      collections: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["collections"]["Insert"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          category_id: string | null;
          gender: ProductGender;
          price: number;
          compare_at_price: number | null;
          material_info: string | null;
          fit_info: string | null;
          care_info: string | null;
          is_new: boolean;
          is_bestseller: boolean;
          is_limited_drop: boolean;
          is_active: boolean;
          drop_ends_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          category_id?: string | null;
          gender: ProductGender;
          price: number;
          compare_at_price?: number | null;
          material_info?: string | null;
          fit_info?: string | null;
          care_info?: string | null;
          is_new?: boolean;
          is_bestseller?: boolean;
          is_limited_drop?: boolean;
          is_active?: boolean;
          drop_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      product_collections: {
        Row: { product_id: string; collection_id: string };
        Insert: { product_id: string; collection_id: string };
        Update: Partial<Database["public"]["Tables"]["product_collections"]["Insert"]>;
        Relationships: [];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          storage_path: string;
          alt_text: string | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          product_id: string;
          storage_path: string;
          alt_text?: string | null;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["product_images"]["Insert"]>;
        Relationships: [];
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          color_name: string;
          color_hex: string | null;
          size: ProductSize | null;
          sku: string;
          stock_quantity: number;
          reserved_quantity: number;
          price_override: number | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          product_id: string;
          color_name: string;
          color_hex?: string | null;
          size?: ProductSize | null;
          sku: string;
          stock_quantity?: number;
          reserved_quantity?: number;
          price_override?: number | null;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["product_variants"]["Insert"]>;
        Relationships: [];
      };
      wishlists: {
        Row: { user_id: string; product_id: string; created_at: string };
        Insert: { user_id: string; product_id: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["wishlists"]["Insert"]>;
        Relationships: [];
      };
      carts: {
        Row: {
          id: string;
          user_id: string | null;
          guest_token: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          guest_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["carts"]["Insert"]>;
        Relationships: [];
      };
      cart_items: {
        Row: {
          id: string;
          cart_id: string;
          product_variant_id: string;
          quantity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          cart_id: string;
          product_variant_id: string;
          quantity: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["cart_items"]["Insert"]>;
        Relationships: [];
      };
      discount_codes: {
        Row: {
          id: string;
          code: string;
          type: DiscountType;
          value: number;
          is_active: boolean;
          valid_from: string;
          valid_until: string | null;
          min_order_value: number | null;
          max_uses: number | null;
          used_count: number;
        };
        Insert: {
          id?: string;
          code: string;
          type: DiscountType;
          value: number;
          is_active?: boolean;
          valid_from?: string;
          valid_until?: string | null;
          min_order_value?: number | null;
          max_uses?: number | null;
          used_count?: number;
        };
        Update: Partial<Database["public"]["Tables"]["discount_codes"]["Insert"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string | null;
          guest_email: string | null;
          cart_id: string | null;
          status: OrderStatus;
          subtotal: number;
          discount_amount: number;
          discount_code_id: string | null;
          shipping_cost: number;
          total: number;
          shipping_address: Record<string, unknown>;
          billing_address: Record<string, unknown> | null;
          shipping_method: string | null;
          stripe_payment_intent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number?: string;
          user_id?: string | null;
          guest_email?: string | null;
          cart_id?: string | null;
          status?: OrderStatus;
          subtotal: number;
          discount_amount?: number;
          discount_code_id?: string | null;
          shipping_cost?: number;
          total: number;
          shipping_address: Record<string, unknown>;
          billing_address?: Record<string, unknown> | null;
          shipping_method?: string | null;
          stripe_payment_intent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_variant_id: string | null;
          product_name_snapshot: string;
          variant_label_snapshot: string;
          unit_price_snapshot: number;
          quantity: number;
          sku_snapshot: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_variant_id?: string | null;
          product_name_snapshot: string;
          variant_label_snapshot: string;
          unit_price_snapshot: number;
          quantity: number;
          sku_snapshot: string;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
        Relationships: [];
      };
      order_status_history: {
        Row: {
          id: string;
          order_id: string;
          status: string;
          changed_at: string;
          changed_by: string | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          status: string;
          changed_at?: string;
          changed_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["order_status_history"]["Insert"]>;
        Relationships: [];
      };
      payment_events: {
        Row: {
          id: string;
          order_id: string | null;
          stripe_event_id: string;
          type: string;
          payload: Record<string, unknown>;
          received_at: string;
        };
        Insert: {
          id?: string;
          order_id?: string | null;
          stripe_event_id: string;
          type: string;
          payload: Record<string, unknown>;
          received_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payment_events"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_pending_order: {
        Args: {
          p_user_id: string | null;
          p_guest_email: string | null;
          p_cart_id: string | null;
          p_shipping_address: Record<string, unknown>;
          p_shipping_method: string;
          p_subtotal: number;
          p_discount_amount: number;
          p_discount_code: string | null;
          p_shipping_cost: number;
          p_total: number;
          p_items: unknown;
        };
        Returns: { order_id: string; order_number: string }[];
      };
      mark_order_paid: {
        Args: { p_order_id: string };
        Returns: boolean;
      };
      release_order_reservation: {
        Args: { p_order_id: string };
        Returns: boolean;
      };
    };
  };
}
