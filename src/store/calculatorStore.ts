import { create } from 'zustand';
import { calculatorConfig } from '../data/products';
import type {
  CalculatorState,
  CalculatorActions,
  DeliveryRegion,
  HeadphonesType,
  ChargerCapacity,
  Product,
  Shipping,
  Discount
} from '../types';

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
      UF_CRM_DELIVERY: data.delivery,
      UF_CRM_RECEIVERS: data.receivers,
      UF_CRM_TRANSMITTERS: data.transmitters,
      UF_CRM_MICROPHONES: data.microphones,
      UF_CRM_HEADPHONES_TYPE: data.headphones.type || 'Не выбрано',
      UF_CRM_HEADPHONES_QTY: data.headphones.quantity,
      UF_CRM_CHARGER: data.charger || 'Не выбрано',
      UF_CRM_AUDIOGUIDES: data.audioguides,
      UF_CRM_TRIGGERS: data.triggers,
      // UF_CRM_PROMO: data.promo || 'Не указан', // временно отключено
      // UF_CRM_VAT_INCLUDED: data.vatIncluded ? 'Да' : 'Нет', // временно отключено
      // UF_CRM_VAT_RATE: data.vatRate, // временно отключено
      // UF_CRM_BUNDLES: data.bundles, // временно отключено
      UF_CRM_TOTAL: data.total,
      UF_CRM_CURRENCY: 'RUB'
    }
  };
};

const useCalculatorStore = create<CalculatorState & CalculatorActions>((set, get) => {
  // Инициализация вычислений при создании store
  const store = {
    // Устаревшие поля
    selectedProducts: [],
    shipping: null as Shipping | null,
    discount: null as Discount | null,
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
    select_headphones: null as HeadphonesType | null,
    qty_headphones: 0,
    select_charger: null as ChargerCapacity | null,

    // Профиль цен по вкладкам (radioguide | audioguide | uniguide)
    priceProfile: 'radioguide' as 'radioguide' | 'audioguide' | 'uniguide',

    // Поля для вкладки "Аудиогиды" и др.
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

    // НОВОЕ: смена профиля цен (вкладка → профиль)
    setPriceProfile: (p: 'radioguide' | 'audioguide' | 'uniguide') => {
      set({ priceProfile: p });
      get().calculateTotal();
    },

    // Устаревшие действия
    addProduct: (product: Product, quantity = 1) => {
      const { selectedProducts } = get();
      const existingProduct = selectedProducts.find(item => item.product.id === product.id);

      if (existingProduct) {
        set({
          selectedProducts: selectedProducts.map(item =>
            item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
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
          item.product.id === productId ? { ...item, quantity } : item
        )
      });
    },

    setShipping: (shipping: Shipping) => set({ shipping }),
    setDiscount: (discount: Discount | null) => set({ discount }),

    // Новые действия
    calculateTotal: () => {
      const state = get();
      const {
        input_rc,
        input_tr,
        input_mic,
        qty_headphones,
        select_headphones,
        select_charger,
        input_audioguide,
        input_triggers,
        select_delivery,
        priceProfile
      } = state;

      // Выбираем набор цен по активному профилю; фолбэк — базовый sku
      const skuSet =
        (calculatorConfig as any).priceByTab?.[priceProfile] ?? calculatorConfig.sku;

      // Основной расчёт цены
      let subtotal = 0;

      // Передатчики
      subtotal += (input_tr || 0) * skuSet.transmitter.unitPrice;

      // Приёмники
      subtotal += (input_rc || 0) * skuSet.receiver.unitPrice;

      // Микрофоны
      subtotal += (input_mic || 0) * skuSet.microphone.unitPrice;

      // Наушники
      if (select_headphones) {
        subtotal += (qty_headphones || 0) * skuSet.headphones[select_headphones].unitPrice;
      }

      // Зарядное устройство
      if (select_charger) {
        subtotal += skuSet.charger[select_charger].unitPrice;
      }

      // Аудиогиды (по вашей логике — как RX)
      subtotal += (input_audioguide || 0) * skuSet.receiver.unitPrice;

      // Триггеры (по вашей логике — как TX)
      subtotal += (input_triggers || 0) * skuSet.transmitter.unitPrice;

      // Доставка
      const shippingCost = calculatorConfig.shipping[select_delivery];

      // Объёмная скидка
      const totalDevices =
        (input_rc || 0) +
        (input_tr || 0) +
        (input_mic || 0) +
        (qty_headphones || 0) +
        (input_audioguide || 0) +
        (input_triggers || 0);

      let volumeDiscount = 0;
      for (const rule of calculatorConfig.volumeDiscounts) {
        if (totalDevices >= rule.thresholdQty) {
          volumeDiscount = Math.max(volumeDiscount, rule.percentage);
        }
      }

      // Если решите вернуть скидку — раскомментируйте и примените:
      // const volumeDiscountAmount = (subtotal * volumeDiscount) / 100;
      // const discountedSubtotal = subtotal - volumeDiscountAmount;

      const discountedSubtotal = subtotal; // сейчас без скидки

      // Итоговая сумма - без НДС (НДС отключён)
      const total = discountedSubtotal + shippingCost;

      set({
        subtotal,
        // volumeDiscountAmount,
        // promoDiscountAmount: 0, // временно отключено
        // discountAmount: volumeDiscountAmount, // если будете считать
        // vatAmount: 0, // временно отключено
        shippingCost,
        total
      });
    },

    addToCart: () => {
      const state = get();
      state.calculateTotal();

      // Выбираем набор цен по активному профилю; фолбэк — базовый sku
      const skuSet =
        (calculatorConfig as any).priceByTab?.[state.priceProfile] ?? calculatorConfig.sku;

      // Создаём массив CartItem для корзины
      const cartItems: Array<{ product: Product; quantity: number }> = [];

      if (state.input_tr > 0) {
        cartItems.push({
          product: {
            id: 'transmitter',
            name: 'Передатчик',
            price: skuSet.transmitter.unitPrice,
            category: 'radioguide'
          },
          quantity: state.input_tr
        });
      }

      if (state.input_rc > 0) {
        cartItems.push({
          product: {
            id: 'receiver',
            name: 'Приёмник',
            price: skuSet.receiver.unitPrice,
            category: 'radioguide'
          },
          quantity: state.input_rc
        });
      }

      if (state.input_mic > 0) {
        cartItems.push({
          product: {
            id: 'microphone',
            name: 'Микрофон',
            price: skuSet.microphone.unitPrice,
            category: 'radioguide'
          },
          quantity: state.input_mic
        });
      }

      if (state.select_headphones && state.qty_headphones > 0) {
        cartItems.push({
          product: {
            id: 'headphones',
            name: `Наушники (${skuSet.headphones[state.select_headphones].name})`,
            price: skuSet.headphones[state.select_headphones].unitPrice,
            category: 'accessory'
          },
          quantity: state.qty_headphones
        });
      }

      if (state.select_charger) {
        cartItems.push({
          product: {
            id: 'charger',
            name: `Зарядное устройство на ${state.select_charger}`,
            price: skuSet.charger[state.select_charger].unitPrice,
            category: 'accessory'
          },
          quantity: 1
        });
      }

      // Аудиогиды — считаем как RX профиля
      if (state.input_audioguide > 0) {
        cartItems.push({
          product: {
            id: 'audioguide',
            name: 'Аудиогид',
            price: skuSet.receiver.unitPrice,
            category: 'audioguide'
          },
          quantity: state.input_audioguide
        });
      }

      // Триггеры — считаем как TX профиля
      if (state.input_triggers > 0) {
        cartItems.push({
          product: {
            id: 'trigger',
            name: 'Триггер',
            price: skuSet.transmitter.unitPrice,
            category: 'audioguide'
          },
          quantity: state.input_triggers
        });
      }

      // Логируем добавление в корзину
      console.log('Добавлено в корзину:', cartItems);

      // Здесь можно добавить логику для сохранения в localStorage или отправки на сервер
      return true;
    },

    // Очистка корзины
    clearCart: () => {
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
