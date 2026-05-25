import React, { useState, useEffect } from 'react';
import useCalculatorStore from '../store/calculatorStore';
import { calculatorConfig } from '../data/products';
import RadioGuideTab from './RadioGuideTab';
import AudioGuideTab from './AudioGuideTab';
import HeadphonesTab from './HeadphonesTab';
import UniGuideTab from './UniGuideTab';
import OrderModal from './OrderModal';
import { MdQuestionMark } from 'react-icons/md';
import { TiArrowSortedDown } from 'react-icons/ti';

const Calculator: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: '' // ← без префикса +7, пользователь вводит номер целиком
  });

  const setPriceProfile = useCalculatorStore(s => s.setPriceProfile);

  const tabToProfile = (tab: number) =>
    tab === 0 ? 'radioguide'
      : tab === 1 ? 'audioguide'
        : tab === 2 ? 'uniguide'
          : 'radioguide';

  useEffect(() => {
    setPriceProfile(tabToProfile(activeTab));
  }, [activeTab, setPriceProfile]);

  const {
    select_delivery,
    input_rc,
    input_tr,
    input_mic,
    select_headphones,
    qty_headphones,
    select_charger,
    input_audioguide,
    input_triggers,
    total,
    shippingCost,
    setDelivery,
    setReceivers,
    setTransmitters,
    setMicrophones,
    setHeadphonesType,
    setHeadphonesQty,
    setCharger,
    setAudioguideQty,
    setTriggersQty,
    clearCart,
    addToCart
  } = useCalculatorStore();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(price);

  // onSubmit, который вызывается ИЗ OrderModal после своей валидации и postMessage в Tilda
  const handleOrderSubmit = () => {
    try {
      console.log('Order submitted:', {
        userInfo,
        order: {
          delivery: select_delivery,
          receivers: input_rc,
          transmitters: input_tr,
          microphones: input_mic,
          headphones: { type: select_headphones, quantity: qty_headphones },
          charger: select_charger,
          audioguides: input_audioguide,
          triggers: input_triggers,
          total
        }
      });
    } finally {
      setShowOrderModal(false);
      setUserInfo({ name: '', email: '', phone: '' }); // ← чистим форму
      // clearCart(); // если хотите очищать корзину после заявки — раскомментируйте
    }
  };

  const handleAddToCart = () => {
    try {
      addToCart();
      setShowOrderModal(true);
    } catch (error) {
      console.error('Ошибка корзины:', error);
    }
  };

  const getSkuSetForActiveTab = () => {
    const key = tabToProfile(activeTab);
    const cfg: any = calculatorConfig as any;
    const priceByTab = cfg.priceByTab as Record<string, any> | undefined;
    return (priceByTab && priceByTab[key]) ? priceByTab[key] : cfg.sku;
  };

  const getOrderItems = () => {
    const items: Array<{
      id: string;
      name: string;
      sku: string;
      quantity: number;
      price: number;
      image: string;
    }> = [];
    const skuSet = getSkuSetForActiveTab();

    if (input_tr > 0) {
      items.push({
        id: 'transmitter',
        name: 'Передатчик',
        sku: 'radiosync-x',
        quantity: input_tr,
        price: skuSet.transmitter.unitPrice,
        image: '🔴'
      });
    }
    if (input_rc > 0) {
      items.push({
        id: 'receiver',
        name: 'Приёмник',
        sku: 'radiosync-r',
        quantity: input_rc,
        price: skuSet.receiver.unitPrice,
        image: '🔵'
      });
    }
    if (input_mic > 0) {
      items.push({
        id: 'microphone',
        name: 'Микрофон',
        sku: 'radiosync-m',
        quantity: input_mic,
        price: skuSet.microphone.unitPrice,
        image: '🎤'
      });
    }
    if (select_headphones && qty_headphones > 0) {
      items.push({
        id: 'headphones',
        name: `Наушники ${skuSet.headphones[select_headphones].name}`,
        sku: 'radiosync-h',
        quantity: qty_headphones,
        price: skuSet.headphones[select_headphones].unitPrice,
        image: '🎧'
      });
    }
    if (select_charger) {
      const cfg = skuSet.charger[select_charger];
      const chargerName = cfg?.name ?? `Аксессуар ${select_charger}`;

      items.push({
        id: 'charger',
        name: chargerName,
        sku: cfg?.sku ?? 'radiosync-c',
        quantity: 1,
        price: cfg.unitPrice,
        image: '🔌'
      });
    }
    if (input_audioguide > 0) {
      items.push({
        id: 'audioguide',
        name: 'Аудиогид',
        sku: 'radiosync-ag',
        quantity: input_audioguide,
        price: skuSet.receiver.unitPrice,
        image: '🎧'
      });
    }
    if (input_triggers > 0) {
      items.push({
        id: 'trigger',
        name: 'Триггер',
        sku: 'radiosync-t',
        quantity: input_triggers,
        price: skuSet.transmitter.unitPrice,
        image: '🔴'
      });
    }
    return items;
  };

  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    switch (itemId) {
      case 'transmitter': setTransmitters(newQuantity); break;
      case 'receiver': setReceivers(newQuantity); break;
      case 'microphone': setMicrophones(newQuantity); break;
      case 'headphones': setHeadphonesQty(newQuantity); break;
      case 'audioguide': setAudioguideQty(newQuantity); break;
      case 'trigger': setTriggersQty(newQuantity); break;
    }
  };

  const removeItem = (itemId: string) => {
    switch (itemId) {
      case 'transmitter': setTransmitters(0); break;
      case 'receiver': setReceivers(0); break;
      case 'microphone': setMicrophones(0); break;
      case 'headphones': setHeadphonesQty(0); setHeadphonesType(null); break;
      case 'charger': setCharger(null); break;
      case 'audioguide': setAudioguideQty(0); break;
      case 'trigger': setTriggersQty(0); break;
    }
  };

  const tabs = [
    {
      id: 0,
      name: 'Радиогид',
      tooltip: 'Беспроводная передача звука для групповых экскурсий.',
      component: (
        <RadioGuideTab
          input_rc={input_rc}
          input_tr={input_tr}
          select_headphones={select_headphones}
          qty_headphones={qty_headphones}
          select_charger={select_charger}
          setReceivers={setReceivers}
          setTransmitters={setTransmitters}
          setHeadphonesType={setHeadphonesType}
          setHeadphonesQty={setHeadphonesQty}
          setCharger={setCharger}
          calculatorConfig={calculatorConfig}
        />
      )
    },
    {
      id: 1,
      name: 'Аудиогид',
      tooltip: 'Самостоятельные экскурсии без гида.',
      component: (
        <AudioGuideTab
          input_audioguide={input_audioguide}
          input_triggers={input_triggers}
          select_headphones={select_headphones}
          qty_headphones={qty_headphones}
          select_charger={select_charger}
          setAudioguideQty={setAudioguideQty}
          setTriggersQty={setTriggersQty}
          setHeadphonesType={setHeadphonesType}
          setHeadphonesQty={setHeadphonesQty}
          setCharger={setCharger}
        />
      )
    },
    {
      id: 2,
      name: 'Юнигид',
      tooltip: '2 в 1: сочетание живых экскурсий с гидом и заранее записанных аудиодорожек.',
      component: (
        <UniGuideTab
          input_rc={input_rc}
          input_tr={input_tr}
          select_headphones={select_headphones}
          qty_headphones={qty_headphones}
          select_charger={select_charger}
          setReceivers={setReceivers}
          setTransmitters={setTransmitters}
          setHeadphonesType={setHeadphonesType}
          setHeadphonesQty={setHeadphonesQty}
          setCharger={setCharger}
          calculatorConfig={calculatorConfig}
        />
      )
    },
    {
      id: 3,
      name: 'Наушники',
      tooltip: 'Одноразовые или многоразовые наушники для разных типов экскурсий.',
      component: (
        <HeadphonesTab
          select_headphones={select_headphones}
          qty_headphones={qty_headphones}
          setHeadphonesType={setHeadphonesType}
          setHeadphonesQty={setHeadphonesQty}
        />
      )
    }
  ] as const;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 lg:pt-[100px] overflow-x-hidden">
      <h1 className="hidden mdl:block text-[38px] leading-12 font-semibold mb-6">
        Соберите свой комплект <br /> оборудования
      </h1>
      <div className="flex flex-col mdl:flex-row items-start justify-center gap-8 mdl:gap-14">
        {/* Левая форма */}
        <div className="space-y-8 w-full mx-auto">
          <h1 className="mdl:hidden text-[38px] font-semibold mb-8">
            Соберите свой комплект <br /> оборудования
          </h1>
          <div>
            <h2 className="text-lg font-semibold mb-3">Выберите продукт</h2>
            <nav className="flex items-center justify-start gap-3 flex-wrap">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); clearCart(); }}
                  className={`relative py-2 px-4 font-medium text-sm h-14 w-full xxs:max-w-[199px] rounded-2xl cursor-pointer text-left
                    ${activeTab === tab.id ? 'bg-custom-gradient text-white' : 'bg-[#e5ebee] text-black'}`}
                >
                  <span className="pr-8 block">{tab.name}</span>
                  <span
                    className={`absolute group flex items-center justify-center cursor-pointer size-5
                      ${activeTab !== tab.id ? 'bg-custom-gradient text-white' : 'bg-white text-[#359AD7]'}
                      rounded-full top-2 right-3 z-10`}
                  >
                    <MdQuestionMark className="text-sm" />
                    <div
                      className="absolute left-full top-1/2 -translate-y-1/2 ml-2 min-w-[180px] max-w-xs
                        bg-custom-gradient text-white text-xs rounded-md px-2 py-1 text-left shadow-lg
                        z-50 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 ease-in-out"
                    >
                      {tab.tooltip}
                    </div>
                  </span>
                </button>
              ))}
            </nav>

            {/* Поля активной вкладки */}
            <div className="mt-4">
              {tabs[activeTab].component}
            </div>

            {/* Доставка — ПЕРЕНЕСЕНО ВНИЗ, под все поля вкладки */}
            <div className="mt-4">
              <div className="mb-3">
                <h3 className="md:text-lg font-semibold mb-1">Доставка</h3>
                <div className="relative w-full">
                  <select
                    value={select_delivery}
                    onChange={(e) => setDelivery(e.target.value as any)}
                    className="w-full h-10 rounded-lg outline-none border border-black px-3 appearance-none text-xs pr-10"
                  >
                    <option value="moscow">Москва</option>
                    <option value="rf">Другая РФ</option>
                    <option value="world">Другая страна</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <TiArrowSortedDown />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex gap-3 flex-wrap">
            <button onClick={clearCart} className="h-10 px-6 rounded-lg border border-gray-300 hover:bg-gray-50 cursor-pointer">
              Сбросить
            </button>
          </div>

          {/* Модалка оформления */}
          <OrderModal
            isOpen={showOrderModal}
            onClose={() => setShowOrderModal(false)}
            orderItems={getOrderItems()}
            userInfo={userInfo}
            onUserInfoChange={setUserInfo}
            onUpdateQuantity={updateItemQuantity}
            onRemoveItem={removeItem}
            onSubmit={handleOrderSubmit}
            formatPrice={formatPrice}
            orderTotal={total}
          />
        </div>

        {/* Правая сводка */}
        <div className="mdl:max-w-[344px] w-full">
          <div className="lg:sticky lg:top-6 border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
            <div className="text-xl font-semibold mb-6 text-gray-800">Ваш комплект</div>
            <div className="space-y-6 mb-6">
              {getOrderItems().map((item, index) => (
                <div key={item.id} className="text-gray-800">
                  <div className="text-sm text-gray-600">
                    {index + 1}. {item.name} ({item.quantity} шт):
                  </div>
                  <div className="pl-3 text-sm text-gray-600">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            {shippingCost > 0 && (
              <div className="flex justify-between text-sm text-gray-600 mb-3">
                <span>Доставка:</span>
                <span>{formatPrice(shippingCost)}</span>
              </div>
            )}
            <hr className="border-gray-200 mb-3" />
            <div className="mb-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-800">Итого от</span>
                <span className="text-3xl font-bold text-primary-600">{formatPrice(total)}</span>
              </div>
              <p className="text-xs text-gray-500 text-right mt-1">
                Примерная цена без учета скидок и акций
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setShowOrderModal(true)}
                className="w-full h-10 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
              >
                ОФОРМИТЬ ЗАКАЗ
              </button>
              <button
                onClick={handleAddToCart}
                className="w-full h-10 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition-colors"
              >
                Заказать
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
