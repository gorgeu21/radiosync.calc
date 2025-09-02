import type { Product, CalculatorConfig } from '../types';

// ---------- Демонстрационный список товаров (если у вас он используется в UI) ----------
export const products: Product[] = [
  {
    id: 'rg-001',
    name: 'Radiohid Professional',
    price: 15000,
    category: 'radioguide',
    description: 'Профессиональный комплект радиогида',
    image: '/images/radioguide-pro.jpg'
  },
  {
    id: 'rg-002',
    name: 'Radiohid Standard',
    price: 12000,
    category: 'radioguide',
    description: 'Стандартный комплект радиогида',
    image: '/images/radioguide-std.jpg'
  },
  {
    id: 'ag-001',
    name: 'Audioguide Pro',
    price: 14000,
    category: 'audioguide',
    description: 'Профессиональный комплект аудиогида',
    image: '/images/audioguide-pro.jpg'
  },
  {
    id: 'ag-002',
    name: 'Audioguide Basic',
    price: 9000,
    category: 'audioguide',
    description: 'Базовый комплект аудиогида',
    image: '/images/audioguide-basic.jpg'
  },
  {
    id: 'acc-001',
    name: 'Наушники Premium',
    price: 2500,
    category: 'accessory',
    description: 'Премиальные наушники',
    image: '/images/headphones-premium.jpg'
  }
];

// ---------- Конфиг калькулятора с разными прайс-профилями ----------
export const calculatorConfig: CalculatorConfig = {
  currency: 'RUB',
  vatRateDefault: 20,

  // Фолбэк (базовый прайс, если профиль не найден)
  sku: {
    transmitter: { sku: 'TX', name: 'Передатчик', unitPrice: 5100 },
    receiver: { sku: 'RX', name: 'Приёмник', unitPrice: 1200 },
    microphone: { sku: 'MIC', name: 'Микрофон', unitPrice: 2000 },
    headphones: {
      in_ear: { sku: 'HP-IN', name: 'Наушники (Многоразовые)', unitPrice: 500 },
      on_ear: { sku: 'HP-ON', name: 'Наушники (Одноразовые)', unitPrice: 30 },
      over_ear: { sku: 'HP-OV', name: 'Наушники (полноразмерные)', unitPrice: 2000 }
    },
    charger: {
      10: { sku: 'CH-10', name: 'Зарядное устройство на 10', unitPrice: 8000 },
      20: { sku: 'CH-20', name: 'Зарядное устройство на 20', unitPrice: 15000 },
      30: { sku: 'CH-30', name: 'Зарядное устройство на 30', unitPrice: 21000 }
    }
  },

  // Разные цены по вкладкам
  priceByTab: {
    radioguide: {
      transmitter: { sku: 'TX', name: 'Передатчик', unitPrice: 5100 },
      receiver: { sku: 'RX', name: 'Приёмник', unitPrice: 1200 },
      microphone: { sku: 'MIC', name: 'Микрофон', unitPrice: 2000 },
      headphones: {
        in_ear: { sku: 'HP-IN', name: 'Наушники (Одноразовые)', unitPrice: 30 },
        on_ear: { sku: 'HP-ON', name: 'Наушники (Многоразовые)', unitPrice: 500 },
        over_ear: { sku: 'HP-OV', name: 'Наушники (полноразмерные)', unitPrice: 1900 }
      },
      charger: {
        10: { sku: 'CH-10', name: 'Зарядное устройство на 10', unitPrice: 8000 },
        20: { sku: 'CH-20', name: 'Зарядное устройство на 20', unitPrice: 15000 },
        30: { sku: 'CH-30', name: 'Зарядное устройство на 30', unitPrice: 21000 }
      }
    },

    audioguide: {
      transmitter: { sku: 'TX', name: 'Аудиогид', unitPrice: 11500 },
      receiver: { sku: 'RX', name: 'Триггер', unitPrice: 5000 },
      microphone: { sku: 'MIC', name: 'Микрофон', unitPrice: 1800 },
      headphones: {
        in_ear: { sku: 'HP-IN', name: 'Наушники (вкладыши)', unitPrice: 650 },
        on_ear: { sku: 'HP-ON', name: 'Наушники (накладные)', unitPrice: 1100 },
        over_ear: { sku: 'HP-OV', name: 'Наушники (полноразмерные)', unitPrice: 1900 }
      },
      charger: {
        10: { sku: 'CH-10', name: 'Зарядное устройство на 10', unitPrice: 7900 },
        20: { sku: 'CH-20', name: 'Зарядное устройство на 20', unitPrice: 14800 },
        30: { sku: 'CH-30', name: 'Зарядное устройство на 30', unitPrice: 20800 }
      }
    },

    uniguide: {
      transmitter: { sku: 'TX', name: 'Передатчик', unitPrice: 16400 },
      receiver: { sku: 'RX', name: 'Приёмник', unitPrice: 8200 },
      microphone: { sku: 'MIC', name: 'Микрофон', unitPrice: 2000 },
      headphones: {
        in_ear: { sku: 'HP-IN', name: 'Наушники (вкладыши)', unitPrice: 700 },
        on_ear: { sku: 'HP-ON', name: 'Наушники (накладные)', unitPrice: 1200 },
        over_ear: { sku: 'HP-OV', name: 'Наушники (полноразмерные)', unitPrice: 2000 }
      },
      charger: {
        10: { sku: 'CH-10', name: 'Зарядное устройство на 10', unitPrice: 8000 },
        20: { sku: 'CH-20', name: 'Зарядное устройство на 20', unitPrice: 15000 },
        30: { sku: 'CH-30', name: 'Зарядное устройство на 30', unitPrice: 21000 }
      }
    }
  },

  // Скидки за объём
  volumeDiscounts: [
    { thresholdQty: 20, percentage: 5 },
    { thresholdQty: 50, percentage: 10 },
    { thresholdQty: 100, percentage: 15 }
  ],

  // Доставка по регионам
  shipping: {
    moscow: 0,
    rf: 0,
    world: 0
  },

  // Промо-правила (если будете включать)
  promos: [
    { code: 'WELCOME10', type: 'percentage', value: 10, stackWithVolume: true },
    { code: 'FIX5000', type: 'fixed', value: 5000, minAmount: 30000, stackWithVolume: false }
  ]
};