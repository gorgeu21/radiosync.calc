import React from "react";

interface OrderItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  image: string;
}

interface UserInfo {
  name: string;
  email: string;
  phone: string; // хранит ввод пользователя
}

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderItems: OrderItem[];
  userInfo: UserInfo;
  onUserInfoChange: (userInfo: UserInfo) => void;
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onSubmit: () => void;
  formatPrice: (price: number) => string;
  orderTotal: number;
}

/** Нормализуем телефон для отправки/валидации: оставляем + (если первый) и цифры */
function normalizePhone(raw: string): string {
  const cleaned = (raw || "").replace(/[^\d+]/g, "");
  // только один плюс и только в начале
  return cleaned.replace(/(?!^)\+/g, "");
}

/** Мягкая проверка: + опционально, 7–15 цифр */
function isValidPhone(raw: string): boolean {
  const p = normalizePhone(raw);
  return /^\+?\d{7,15}$/.test(p);
}

const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  orderItems,
  userInfo,
  onUserInfoChange,
  onSubmit,
  formatPrice,
  orderTotal,
}) => {
  if (!isOpen) return null;

  const [consent, setConsent] = React.useState(false);
  const [phoneError, setPhoneError] = React.useState<string>("");

  // Красивый текст корзины для поля "order" в Tilda
  const orderText = React.useMemo(
    () =>
      orderItems
        .map(
          (x, i) =>
            `${i + 1}) ${x.name} x${x.quantity} — ${x.price} ₽ = ${x.price * x.quantity
            } ₽`
        )
        .join("\n"),
    [orderItems]
  );

  /** Отправляем данные в страницу Tilda (родителя/верхний фрейм) */
  const sendToTilda = () => {
    const normalizedPhone = normalizePhone(userInfo.phone);

    const payload = {
      // Имена полей ДОЛЖНЫ совпадать с переменными формы Tilda (BF502N): name, email, phone, order, total, orderjson
      name: userInfo.name ?? "",
      email: userInfo.email ?? "",
      phone: normalizedPhone,
      order: orderText,
      total: orderTotal ?? 0,
      orderjson: JSON.stringify({
        items: orderItems.map((i) => ({
          id: i.id,
          sku: i.sku,
          name: i.name,
          qty: i.quantity,
          price: i.price,
          sum: i.price * i.quantity,
        })),
        total: orderTotal ?? 0,
        phone_raw: userInfo.phone,
        phone_normalized: normalizedPhone,
        source: typeof window !== "undefined" ? window.location.href : "",
      }),
    };

    try {
      const msg = { type: "RS_ORDER_SUBMIT", payload };
      if (window.parent) window.parent.postMessage(msg, "*");
      if (window.top && window.top !== window.parent) {
        window.top.postMessage(msg, "*");
      }
    } catch (e) {
      console.warn("postMessage failed", e);
    }
  };

  const handleClose = () => {
    onClose();
    setConsent(false);
    setPhoneError("");
    onUserInfoChange({ name: "", email: "", phone: "" });
  };

  const handleSubmitClick = () => {
    if (orderItems.length === 0) return;

    // валидация телефона перед отправкой
    if (!isValidPhone(userInfo.phone)) {
      setPhoneError("Проверьте номер: допустимы только + и 7–15 цифр.");
      return;
    }
    setPhoneError("");
    if (!consent) return;

    // 1) Отправка данных в Tilda через postMessage
    sendToTilda();
    // 2) Ваша внутренняя логика (если нужна)
    onSubmit();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="grid md:grid-cols-2 gap-4 bg-white rounded-xl max-w-[99%] lg:max-w-3/4 xl:max-w-[936px]  w-full sm:mx-4 max-h-[90vh] py-12 px-6 lg:px-12 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Левая колонка: контактные данные */}
        <div className="max-w-[349px] mx-auto md:mx-0 w-full">
          <h3 className="text-lg font-semibold mb-4">Контактная информация</h3>
          <div className="space-y-4">
            {/* Имя */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ваше имя
              </label>
              <input
                type="text"
                value={userInfo.name}
                onChange={(e) =>
                  onUserInfoChange({ ...userInfo, name: e.target.value })
                }
                placeholder="Введите имя"
                className="w-full h-10 rounded-lg outline-none border border-black px-3"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ваш Email
              </label>
              <input
                type="email"
                value={userInfo.email}
                onChange={(e) =>
                  onUserInfoChange({ ...userInfo, email: e.target.value })
                }
                placeholder="Введите Email"
                className="w-full h-10 rounded-lg outline-none border border-black px-3"
              />
            </div>

            {/* Телефон */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ваш телефон
              </label>
              <input
                type="tel"
                name="phone"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+79991234567"
                value={userInfo.phone}
                onChange={(e) => {
                  // Разрешим только один плюс в начале; пробелы/скобки/дефисы не запрещаем
                  const v = e.target.value.replace(/(?!^)\+/g, "");
                  onUserInfoChange({ ...userInfo, phone: v });
                  if (phoneError) setPhoneError("");
                }}
                className="w-full h-10 border border-black rounded-lg px-3 outline-none"
              />
              {phoneError && (
                <p className="mt-1 text-xs text-red-600">{phoneError}</p>
              )}

              {/* Чекбокс согласия */}
              <label className="mt-3 flex items-start gap-2 select-none">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 h-4 w-4 border border-black rounded"
                />
                <span className="text-sm text-gray-600 leading-5">
                  Я соглашаюсь с{" "}
                  <a
                    href="https://radiosync.ru/privacypolicy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    политикой обработки персональных данных
                  </a>
                  .
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Правая колонка: корзина и отправка */}
        <div className="max-w-[346px] w-full mx-auto md:border rounded-2xl md:p-4">
          <div className="text-xl font-semibold mb-6 text-gray-800">
            Ваш комплект
          </div>

          {/* Состав заказа */}
          <div className="space-y-6 mb-6">
            {orderItems.map((item, index) => (
              <div key={item.id} className="text-gray-800">
                <div className="text-sm text-gray-600">
                  {index + 1}. {item.name} x{item.quantity}:
                </div>
                <div className="pl-3 text-sm text-gray-600">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          {/* Итого */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Итого от:</span>
              <span>{formatPrice(orderTotal || 0)}</span>
            </div>
            <hr className="border-gray-200" />
          </div>

          {/* Отправка */}
          <button
            onClick={handleSubmitClick}
            disabled={orderItems.length === 0 || !consent}
            className="w-full h-10 bg-custom-gradient cursor-pointer text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {orderItems.length === 0
              ? "Корзина пуста"
              : !consent
                ? "Подтвердите согласие"
                : "Отправить"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
