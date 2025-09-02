// ---------- Базовые сущности каталога ----------
export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'radioguide' | 'audioguide' | 'accessory';
  description?: string;
  image?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Discount {
  type: 'percentage' | 'fixed';
  value: number;
}

// ---------- Типы справочников ----------
export type HeadphonesType = 'in_ear' | 'on_ear';
export type ChargerCapacity = 10 | 20 | 30;

export interface SkuPrice {
  sku: string;
  name: string;
  unitPrice: number; // цена за единицу в базовой валюте
}

export interface VolumeDiscountRule {
  // Порог суммарного кол-ва устройств (TX + RX + MIC + qty наушников + др.)
  thresholdQty: number;
  percentage: number; // 5 = 5%
}

export type DeliveryRegion = 'moscow' | 'rf' | 'world';

export interface ShippingMatrix {
  moscow: number;
  rf: number;
  world: number;
}

export type Shipping = number; // упрощённо: стоимость доставки

export interface PromoRule {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minAmount?: number;
  stackWithVolume?: boolean;
}

// ---------- Профили цен по вкладкам ----------
export type PriceProfile = 'radioguide' | 'audioguide' | 'uniguide';

export interface SkuSet {
  transmitter: SkuPrice;
  receiver: SkuPrice;
  microphone: SkuPrice;
  headphones: Record<HeadphonesType, SkuPrice>;
  charger: Record<ChargerCapacity, SkuPrice>;
}

// ---------- Конфиг калькулятора ----------
export interface CalculatorConfig {
  currency: string;
  vatRateDefault: number;

  // Базовый (фолбэк) прайс-набор
  sku: SkuSet;

  // Разные прайсы по вкладкам
  priceByTab: Record<PriceProfile, SkuSet>;

  volumeDiscounts: VolumeDiscountRule[];
  shipping: ShippingMatrix;
  promos: PromoRule[];
}

// ---------- Состояние стора калькулятора ----------
export interface CalculatorState {
  // Устаревшие / сервисные поля
  selectedProducts: CartItem[];
  shipping: Shipping | null;
  discount: Discount | null;

  // Ценовые итоги
  subtotal: number;              // ← вернули это поле
  promoDiscountAmount: number;
  discountAmount: number;
  vatAmount: number;
  shippingCost: number;
  total: number;

  // Параметры заказа
  select_delivery: DeliveryRegion;

  input_tr: number; // передатчики
  input_rc: number; // приёмники
  input_mic: number; // микрофоны

  select_headphones: HeadphonesType | null;
  qty_headphones: number;

  select_charger: ChargerCapacity | null;

  // Профиль цен по вкладке
  priceProfile: PriceProfile;

  // Под вкладки "Аудиогид", "Юнигид" и т.п.
  input_audioguide: number;
  input_triggers: number;

  // Прочее (временно отключаемое)
  promo: string;
  vatIncluded: boolean;
  vatRate: number;
  bundles: number;
}

// ---------- Действия стора ----------
export interface CalculatorActions {
  // Сеттеры
  setDelivery: (region: DeliveryRegion) => void;

  setTransmitters: (qty: number) => void;
  setReceivers: (qty: number) => void;
  setMicrophones: (qty: number) => void;

  setHeadphonesType: (type: HeadphonesType | null) => void;
  setHeadphonesQty: (qty: number) => void;

  setCharger: (capacity: ChargerCapacity | null) => void;

  setAudioguideQty: (qty: number) => void;
  setTriggersQty: (qty: number) => void;

  setPromo: (code: string) => void;
  setVatIncluded: (included: boolean) => void;
  setVatRate: (rate: number) => void;
  setBundles: (qty: number) => void;

  // Профиль цен
  setPriceProfile: (p: PriceProfile) => void;

  // Устаревшие действия корзины
  addProduct: (product: Product, quantity?: number) => void;
  removeProduct: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;

  setShipping: (shipping: Shipping) => void;
  setDiscount: (discount: Discount | null) => void;

  // Калькуляция/отправка
  calculateTotal: () => void;
  addToCart: () => boolean;
  clearCart: () => void;
  sendToWebhook: (webhookUrl: string) => Promise<boolean>;
}
