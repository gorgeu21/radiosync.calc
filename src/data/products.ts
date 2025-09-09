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
    description: 'Комфортные наушники',
    image: '/images/headphones-premium.jpg'
  }
];

// ---------- Конфиг калькулятора ----------
export const calculatorConfig: CalculatorConfig = {
  // НДС по умолчанию
  currency: 'RUB',
  vatRateDefault: 0,

  // Фолбэк (базовый прайс, если профиль не найден)
  sku: {
    transmitter: { sku: 'TX', name: 'Передатчик', unitPrice: 5100 },
    receiver: { sku: 'RX', name: 'Приёмник', unitPrice: 1200 },
    microphone: { sku: 'MIC', name: 'Микрофон', unitPrice: 2000 },

    // === ИЗМЕНЕНО: только два варианта по смыслу, третий ключ оставлен для совместимости типов ===
    headphones: {
      in_ear: { sku: 'HP-IN', name: 'Одноразовые', unitPrice: 30 },
      on_ear: { sku: 'HP-ON', name: 'Многоразовые', unitPrice: 480 },
    },

    charger: {
      10: { sku: 'CH-10', name: 'Беспроводной микрофон', unitPrice: 3610 },
      20: { sku: 'CH-20', name: 'Докстанция для зарядки (25 слотов)', unitPrice: 14200 },
      30: { sku: 'CH-30', name: 'Кейс с зарядкой (32 слота)', unitPrice: 21900 },
      40: { sku: 'CH-40', name: 'Кейс с зарядкой (40 слотов)', unitPrice: 62000 },
      50: { sku: 'CH-50', name: 'Кейс с зарядкой (45 слотов)', unitPrice: 62000 },
      60: { sku: 'CH-60', name: 'Кейс транспортировочный (60 слотов)', unitPrice: 8800 },
      70: { sku: 'CH-70', name: 'Сумка для комплектов', unitPrice: 6500 }
    }
  },

  // Разные цены по вкладкам
  priceByTab: {
    radioguide: {
      transmitter: { sku: 'TX', name: 'Передатчик', unitPrice: 5100 },
      receiver: { sku: 'RX', name: 'Приёмник', unitPrice: 1200 },
      microphone: { sku: 'MIC', name: 'Микрофон', unitPrice: 2000 },

      // === ИЗМЕНЕНО ===
      headphones: {
        in_ear: { sku: 'HP-IN', name: 'Одноразовые', unitPrice: 30 },
        on_ear: { sku: 'HP-ON', name: 'Многоразовые', unitPrice: 480 },
      },

      charger: {
        10: { sku: 'CH-10', name: 'Беспроводной микрофон', unitPrice: 3610 },
        20: { sku: 'CH-20', name: 'Докстанция для зарядки (25 слотов)', unitPrice: 14200 },
        30: { sku: 'CH-30', name: 'Кейс с зарядкой (32 слота)', unitPrice: 21900 },
        40: { sku: 'CH-40', name: 'Кейс с зарядкой (40 слотов)', unitPrice: 62000 },
        50: { sku: 'CH-50', name: 'Кейс с зарядкой (45 слотов)', unitPrice: 62000 },
        60: { sku: 'CH-60', name: 'Кейс транспортировочный (60 слотов)', unitPrice: 8800 },
        70: { sku: 'CH-70', name: 'Сумка для комплектов', unitPrice: 6500 }
      }
    },

    audioguide: {
      transmitter: { sku: 'TX', name: 'Аудиогид', unitPrice: 11500 },
      receiver: { sku: 'RX', name: 'Триггер', unitPrice: 5000 },
      microphone: { sku: 'MIC', name: 'Микрофон', unitPrice: 1800 },

      // === ИЗМЕНЕНО ===
      headphones: {
        in_ear: { sku: 'HP-IN', name: 'Одноразовые', unitPrice: 30 },
        on_ear: { sku: 'HP-ON', name: 'Многоразовые', unitPrice: 480 },
      },

      charger: {
        10: { sku: 'CH-10', name: 'Беспроводной микрофон', unitPrice: 3610 },
        20: { sku: 'CH-20', name: 'Докстанция для зарядки (25 слотов)', unitPrice: 14200 },
        30: { sku: 'CH-30', name: 'Кейс с зарядкой (32 слота)', unitPrice: 21900 },
        40: { sku: 'CH-40', name: 'Кейс с зарядкой (40 слотов)', unitPrice: 62000 },
        50: { sku: 'CH-50', name: 'Кейс с зарядкой (45 слотов)', unitPrice: 62000 },
        60: { sku: 'CH-60', name: 'Кейс транспортировочный (60 слотов)', unitPrice: 8800 },
        70: { sku: 'CH-70', name: 'Сумка для комплектов', unitPrice: 6500 }
      }
    },

    uniguide: {
      transmitter: { sku: 'TX', name: 'Передатчик', unitPrice: 16400 },
      receiver: { sku: 'RX', name: 'Приёмник', unitPrice: 8200 },
      microphone: { sku: 'MIC', name: 'Микрофон', unitPrice: 2000 },

      // === ИЗМЕНЕНО ===
      headphones: {
        in_ear: { sku: 'HP-IN', name: 'Одноразовые', unitPrice: 30 },
        on_ear: { sku: 'HP-ON', name: 'Многоразовые', unitPrice: 480 },
      },

      charger: {
        10: { sku: 'CH-10', name: 'Беспроводной микрофон', unitPrice: 3610 },
        20: { sku: 'CH-20', name: 'Докстанция для зарядки (25 слотов)', unitPrice: 14200 },
        30: { sku: 'CH-30', name: 'Кейс с зарядкой (32 слота)', unitPrice: 21900 },
        40: { sku: 'CH-40', name: 'Кейс с зарядкой (40 слотов)', unitPrice: 62000 },
        50: { sku: 'CH-50', name: 'Кейс с зарядкой (45 слотов)', unitPrice: 62000 },
        60: { sku: 'CH-60', name: 'Кейс транспортировочный (60 слотов)', unitPrice: 8800 },
        70: { sku: 'CH-70', name: 'Сумка для комплектов', unitPrice: 6500 }
      }
    }
  },

  // Скидки от объёма (пример)
  volumeDiscounts: [
    { thresholdQty: 10, percentage: 3 },
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
