import { create } from 'zustand';
import { calculatorConfig } from '../data/products';
import type { CalculatorState, CalculatorActions, DeliveryRegion, HeadphonesType, ChargerCapacity, Product, Shipping, Discount } from '../types';

// Интерфейс для интеграции с webhook
interface WebhookData {
  delivery: string;
  receivers: number;
  transmitters: number;
  microphones: number;
  headphones: {
    type: string | null;
    quantity: number;
  };
  charger: number | null;
  audioguides: number;
  triggers: number;
  // promo: string; // временно отключено
  // vatIncluded: boolean; // временно отключено
  // vatRate: number; // временно отключено
  // bundles: number; // временно отключено
  total: number;
  timestamp: string;
}

// Функция отправки webhook
export const sendToWebhook = async (webhookUrl: string, data: WebhookData): Promise<boolean> => {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Calculator-Widget/1.0'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Webhook error:', error);
    return false;
  }
};

// Специальный формат для CRM/Bitrix24
export const formatForCRM = (data: WebhookData) => {
  return {
    title: `Заявка на комплект - ${new Date().toLocaleDateString('ru-RU')}`,
    fields: {
      'UF_CRM_DELIVERY': data.delivery,
      'UF_CRM_RECEIVERS': data.receivers,
      'UF_CRM_TRANSMITTERS': data.transmitters,
      'UF_CRM_MICROPHONES': data.microphones,
      'UF_CRM_HEADPHONES_TYPE': data.headphones.type || 'Не выбрано',
      'UF_CRM_HEADPHONES_QTY': data.headphones.quantity,
      'UF_CRM_CHARGER': data.charger || 'Не выбрано',
      'UF_CRM_AUDIOGUIDES': data.audioguides,
      'UF_CRM_TRIGGERS': data.triggers,
      // 'UF_CRM_PROMO': data.promo || 'Не указан', // временно отключено
      // 'UF_CRM_VAT_INCLUDED': data.vatIncluded ? 'Да' : 'Нет', // временно отключено
      // 'UF_CRM_VAT_RATE': data.vatRate, // временно отключено
      // 'UF_CRM_BUNDLES': data.bundles, // временно отключено
      'UF_CRM_TOTAL': data.total,
      'UF_CRM_CURRENCY': 'RUB'
    }
  };
};

const useCalculatorStore = create<CalculatorState & CalculatorActions>((set, get) => {
  // Инициализация вычислений при создании store
  const store = {
  // Устаревшие поля
  selectedProducts: [],
  shipping: null,
  discount: null,
  subtotal: 0,
  // volumeDiscountAmount: 0,
  promoDiscountAmount: 0,
  discountAmount: 0,
  vatAmount: 0,
  shippingCost: 0,

  // Новые поля
  select_delivery: 'moscow' as DeliveryRegion,
  input_tr: 0,
  input_rc: 0,
  input_mic: 0,
  select_headphones: null,
  qty_headphones: 0,
  select_charger: null,
  // New fields for different tabs
  input_audioguide: 0,
  input_triggers: 0,
  promo: '',
  vatIncluded: false,
  vatRate: 20,
  bundles: 1,
  total: 0,

  // Сеттеры с вычислением в реальном времени
  setDelivery: (region: DeliveryRegion) => {
    set({ select_delivery: region });
    get().calculateTotal();
  },
  setTransmitters: (qty: number) => {
    set({ input_tr: qty });
    get().calculateTotal();
  },
  setReceivers: (qty: number) => {
    set({ input_rc: qty });
    get().calculateTotal();
  },
  setMicrophones: (qty: number) => {
    set({ input_mic: qty });
    get().calculateTotal();
  },
  setHeadphonesType: (type: HeadphonesType | null) => {
    set({ select_headphones: type });
    get().calculateTotal();
  },
  setHeadphonesQty: (qty: number) => {
    set({ qty_headphones: qty });
    get().calculateTotal();
  },
  setCharger: (capacity: ChargerCapacity | null) => {
    set({ select_charger: capacity });
    get().calculateTotal();
  },
  setAudioguideQty: (qty: number) => {
    set({ input_audioguide: qty });
    get().calculateTotal();
  },
  setTriggersQty: (qty: number) => {
    set({ input_triggers: qty });
    get().calculateTotal();
  },
  setPromo: (code: string) => {
    set({ promo: code });
    get().calculateTotal();
  },
  setVatIncluded: (included: boolean) => {
    set({ vatIncluded: included });
    get().calculateTotal();
  },
  setVatRate: (rate: number) => {
    set({ vatRate: rate });
    get().calculateTotal();
  },
  setBundles: (qty: number) => {
    set({ bundles: qty });
    get().calculateTotal();
  },

  // Устаревшие действия
  addProduct: (product: Product, quantity = 1) => {
    const { selectedProducts } = get();
    const existingProduct = selectedProducts.find(item => item.product.id === product.id);
    
    if (existingProduct) {
      set({
        selectedProducts: selectedProducts.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      });
    } else {
      set({
        selectedProducts: [...selectedProducts, { product, quantity }]
      });
    }
  },

  removeProduct: (productId: string) => {
    const { selectedProducts } = get();
    set({
      selectedProducts: selectedProducts.filter(item => item.product.id !== productId)
    });
  },

  updateQuantity: (productId: string, quantity: number) => {
    const { selectedProducts } = get();
    set({
      selectedProducts: selectedProducts.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    });
  },

  setShipping: (shipping: Shipping) => set({ shipping }),
  setDiscount: (discount: Discount | null) => set({ discount }),

  // Новые действия
  calculateTotal: () => {
    const state = get();
    const { input_rc, input_tr, input_mic, qty_headphones, select_charger, input_audioguide, input_triggers } = state;
    
    // Основной расчёт цены
    let subtotal = 0;
    
    // Передатчики
    subtotal += input_tr * calculatorConfig.sku.transmitter.unitPrice;
    
    // Приёмники
    subtotal += input_rc * calculatorConfig.sku.receiver.unitPrice;
    
    // Микрофоны
    subtotal += input_mic * calculatorConfig.sku.microphone.unitPrice;
    
    // Наушники
    if (state.select_headphones) {
      subtotal += qty_headphones * calculatorConfig.sku.headphones[state.select_headphones].unitPrice;
    }
    
    // Зарядное устройство
    if (select_charger) {
      subtotal += calculatorConfig.sku.charger[select_charger].unitPrice;
    }
    
    // Аудиогиды
    subtotal += input_audioguide * calculatorConfig.sku.receiver.unitPrice;
    
    // Триггеры
    subtotal += input_triggers * calculatorConfig.sku.transmitter.unitPrice;
    
    // Комплекты - временно отключено
    // subtotal *= bundles;
    
    // Доставка
    const shippingCost = calculatorConfig.shipping[state.select_delivery];
    
    // Объёмная скидка
    const totalDevices = input_rc + input_tr + input_mic + qty_headphones + input_audioguide + input_triggers;
    let volumeDiscount = 0;
    
    for (const rule of calculatorConfig.volumeDiscounts) {
      if (totalDevices >= rule.thresholdQty) {
        volumeDiscount = Math.max(volumeDiscount, rule.percentage);
      }
    }
    
    // const volumeDiscountAmount = (subtotal * volumeDiscount) / 100;
    
    // Промокод скидка - временно отключено
    // let promoDiscount = 0;
    // if (state.promo) {
    //   const promoRule = calculatorConfig.promos.find(p => p.code === state.promo);
    //   if (promoRule && subtotal >= (promoRule.minAmount || 0)) {
    //     if (promoRule.type === 'percentage') {
    //       promoDiscount = (subtotal * promoRule.value) / 100;
    //     } else {
    //       promoDiscount = promoRule.value;
    //     }
    //   }
    // }
    
    // Общая скидка - без промокода
    // const discountAmount = volumeDiscountAmount;
    const discountedSubtotal = subtotal;
    
    // НДС - временно отключено
    // let vatAmount = 0;
    // if (vatIncluded) {
    //   vatAmount = (discountedSubtotal * vatRate) / (100 + vatRate);
    // } else {
    //   vatAmount = (discountedSubtotal * vatRate) / 100;
    // }
    
    // Итоговая сумма - без НДС
    const total = discountedSubtotal + shippingCost;
    
    set({
      subtotal,
      // volumeDiscountAmount,
      // promoDiscountAmount: promoDiscount, // временно отключено
      // discountAmount,
      // vatAmount, // временно отключено
      shippingCost,
      total
    });
  },

  addToCart: () => {
    const state = get();
    state.calculateTotal();
    
    // Создаём массив CartItem для корзины
    const cartItems = [];
    
    if (state.input_tr > 0) {
      cartItems.push({
        product: {
          id: 'transmitter',
          name: 'Передатчик',
          price: calculatorConfig.sku.transmitter.unitPrice,
          category: 'radioguide' as const
        },
        quantity: state.input_tr
      });
    }
    
    if (state.input_rc > 0) {
      cartItems.push({
        product: {
          id: 'receiver',
          name: 'Приёмник',
          price: calculatorConfig.sku.receiver.unitPrice,
          category: 'radioguide' as const
        },
        quantity: state.input_rc
      });
    }
    
    if (state.input_mic > 0) {
      cartItems.push({
        product: {
          id: 'microphone',
          name: 'Микрофон',
          price: calculatorConfig.sku.microphone.unitPrice,
          category: 'radioguide' as const
        },
        quantity: state.input_mic
      });
    }
    
    if (state.select_headphones && state.qty_headphones > 0) {
      cartItems.push({
        product: {
          id: 'headphones',
          name: `Наушники (${calculatorConfig.sku.headphones[state.select_headphones].name})`,
          price: calculatorConfig.sku.headphones[state.select_headphones].unitPrice,
          category: 'accessory' as const
        },
        quantity: state.qty_headphones
      });
    }
    
    if (state.select_charger) {
      cartItems.push({
        product: {
          id: 'charger',
          name: `Зарядное устройство на ${state.select_charger}`,
          price: calculatorConfig.sku.charger[state.select_charger].unitPrice,
          category: 'accessory' as const
        },
        quantity: 1
      });
    }
    
    // Add audioguide items
    if (state.input_audioguide > 0) {
      cartItems.push({
        product: {
          id: 'audioguide',
          name: 'Аудиогид',
          price: calculatorConfig.sku.receiver.unitPrice, // Using receiver price as base
          category: 'audioguide' as const
        },
        quantity: state.input_audioguide
      });
    }
    
    // Add trigger items
    if (state.input_triggers > 0) {
      cartItems.push({
        product: {
          id: 'trigger',
          name: 'Триггер',
          price: calculatorConfig.sku.transmitter.unitPrice, // Using transmitter price as base
          category: 'audioguide' as const
        },
        quantity: state.input_triggers
      });
    }
    
    // Логируем добавление в корзину
    console.log('Добавлено в корзину:', cartItems);
    
    // Здесь можно добавить логику для сохранения в localStorage
    // или отправки на сервер
    
    return true;
  },

  // Очистка корзины
  clearCart: () => {
    // Очистка локального состояния
    set({
      selectedProducts: [],
      input_tr: 0,
      input_rc: 0,
      input_mic: 0,
      select_headphones: null,
      qty_headphones: 0,
      select_charger: null,
      input_audioguide: 0,
      input_triggers: 0,
      // promo: '', // временно отключено
      // bundles: 1, // временно отключено
      subtotal: 0,
      // volumeDiscountAmount: 0,
      // promoDiscountAmount: 0, // временно отключено
      discountAmount: 0,
      // vatAmount: 0, // временно отключено
      shippingCost: 0,
      total: 0
    });
  },

  sendToWebhook: async (webhookUrl: string) => {
    const state = get();
    state.calculateTotal();
    
    const webhookData: WebhookData = {
      delivery: state.select_delivery,
      receivers: state.input_rc,
      transmitters: state.input_tr,
      microphones: state.input_mic,
      headphones: {
        type: state.select_headphones,
        quantity: state.qty_headphones
      },
      charger: state.select_charger,
      audioguides: state.input_audioguide,
      triggers: state.input_triggers,
      // promo: state.promo, // временно отключено
      // vatIncluded: state.vatIncluded, // временно отключено
      // vatRate: state.vatRate, // временно отключено
      // bundles: state.bundles, // временно отключено
      total: state.total,
      timestamp: new Date().toISOString()
    };
    
    return await sendToWebhook(webhookUrl, webhookData);
  }
  };

  // Начальные вычисления
  setTimeout(() => {
    store.calculateTotal();
  }, 0);

  return store;
});

export default useCalculatorStore;
