import React, { useState, useEffect } from 'react';
import useCalculatorStore from '../store/calculatorStore';
import { calculatorConfig } from '../data/products';
import RadioGuideTab from './RadioGuideTab';
import AudioGuideTab from './AudioGuideTab';
import HeadphonesTab from './HeadphonesTab';
import UniGuideTab from './UniGuideTab';
import OrderModal from './OrderModal';
// import WebhookModal from './WebhookModal';
import { MdKeyboardArrowRight } from 'react-icons/md';
import { TiArrowSortedDown } from 'react-icons/ti';

const Calculator: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  // const [webhookUrl, setWebhookUrl] = useState('');
  // const [showWebhookForm, setShowWebhookForm] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: '+7'
  });

  // НОВОЕ: берём экшен для установки профиля цен
  const setPriceProfile = useCalculatorStore(s => s.setPriceProfile);

  // Маппинг: индекс вкладки → профиль цен
  const tabToProfile = (tab: number) =>
    tab === 0 ? 'radioguide'
      : tab === 1 ? 'audioguide'
        : tab === 2 ? 'uniguide'
          : 'radioguide';

  // НОВОЕ: при смене вкладки — обновляем профиль цен в сторе
  useEffect(() => {
    setPriceProfile(tabToProfile(activeTab));
  }, [activeTab, setPriceProfile]);

  const {
    // inputs
    select_delivery,
    input_rc,
    input_tr,
    input_mic,
    select_headphones,
    qty_headphones,
    select_charger,
    input_audioguide,
    input_triggers,
    // promo,
    // vatIncluded, // временно отключено
    // vatRate, // временно отключено
    // bundles, // временно отключено
    // totals
    total,
    subtotal,
    // promoDiscountAmount, // временно отключено
    shippingCost,
    // vatAmount, // временно отключено
    // setters
    setDelivery,
    setReceivers,
    setTransmitters,
    setMicrophones,
    setHeadphonesType,
    setHeadphonesQty,
    setCharger,
    setAudioguideQty,
    setTriggersQty,
    // setPromo,
    // setVatIncluded, // временно отключено
    // setVatRate, // временно отключено
    // setBundles,
    // actions
    clearCart,
    // sendToWebhook,
    addToCart
  } = useCalculatorStore();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(price);
  };

  // const handleWebhookSubmit = async () => {
  //   if (!webhookUrl.trim()) {
  //     alert('Пожалуйста, введите URL webhook');
  //     return;
  //   }

  //   try {
  //     await sendToWebhook(webhookUrl);
  //     alert('Заявка успешно отправлена!');
  //     setShowWebhookForm(false);
  //     setWebhookUrl('');
  //   } catch (error) {
  //     console.error('Webhook error:', error);
  //     alert('Произошла ошибка при отправке заявки.');
  //   }
  // };

  const handleOrderSubmit = () => {
    if (!userInfo.name.trim()) {
      alert('Пожалуйста, введите ваше имя');
      return;
    }

    if (!userInfo.email.trim() || !userInfo.email.includes('@')) {
      alert('Пожалуйста, введите корректный email');
      return;
    }

    const phoneNumber = userInfo.phone.replace(/^\+\d+/, '');
    if (phoneNumber.length < 10) {
      alert('Пожалуйста, введите корректный номер телефона');
      return;
    }

    // Bu yerda buyurtmani yuborish logikasi
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
        // bundles // временно отключено
      }
    });

    alert('Заказ успешно оформлен!');
    setShowOrderModal(false);
    setUserInfo({ name: '', email: '', phone: '+7' });
  };

  const handleAddToCart = () => {
    try {
      addToCart();
      setShowOrderModal(true);
    } catch (error) {
      console.error('Ошибка корзины:', error);
      alert('Произошла ошибка при добавлении в корзину');
    }
  };

  // ВСПОМОГАТЕЛЬНО: получаем набор цен для активной вкладки (профиль)
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
        name: `Наушники (${skuSet.headphones[select_headphones].name})`,
        sku: 'radiosync-h',
        quantity: qty_headphones,
        price: skuSet.headphones[select_headphones].unitPrice,
        image: '🎧'
      });
    }

    if (select_charger) {
      items.push({
        id: 'charger',
        name: `Зарядное устройство на ${select_charger}`,
        sku: 'radiosync-c',
        quantity: 1,
        price: skuSet.charger[select_charger].unitPrice,
        image: '🔌'
      });
    }

    // Аудиогид считаем как приёмник профиля
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

    // Триггер считаем как передатчик профиля
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
      case 'transmitter':
        setTransmitters(newQuantity);
        break;
      case 'receiver':
        setReceivers(newQuantity);
        break;
      case 'microphone':
        setMicrophones(newQuantity);
        break;
      case 'headphones':
        setHeadphonesQty(newQuantity);
        break;
      case 'charger':
        // Зарядное устройство может быть только 1 штука
        break;
      case 'audioguide':
        setAudioguideQty(newQuantity);
        break;
      case 'trigger':
        setTriggersQty(newQuantity);
        break;
    }
  };

  const removeItem = (itemId: string) => {
    switch (itemId) {
      case 'transmitter':
        setTransmitters(0);
        break;
      case 'receiver':
        setReceivers(0);
        break;
      case 'microphone':
        setMicrophones(0);
        break;
      case 'headphones':
        setHeadphonesQty(0);
        setHeadphonesType(null);
        break;
      case 'charger':
        setCharger(null);
        break;
      case 'audioguide':
        setAudioguideQty(0);
        break;
      case 'trigger':
        setTriggersQty(0);
        break;
    }
  };

  const tabs = [
    {
      id: 0,
      name: 'Радиогид',
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
      component: (
        <HeadphonesTab
          select_headphones={select_headphones}
          qty_headphones={qty_headphones}
          setHeadphonesType={setHeadphonesType}
          setHeadphonesQty={setHeadphonesQty}
        />
      )
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 lg:pt-[100px] overflow-x-hidden">
      <h1 className="hidden mdl:block text-[38px] leading-12 font-semibold mb-6">
        Соберите свой комплект <br /> оборудования
      </h1>
      <div className="flex flex-col mdl:flex-row items-start justify-center gap-8 md:gap-14">
        {/* Левая форма */}
        <div className="space-y-8 w-full mx-auto">
          <h1 className="mdl:hidden text-[38px] font-semibold mb-8">
            Соберите свой комплект <br /> оборудования
          </h1>
          <div>
            <h2 className="text-lg font-semibold mb-3">Выберите продукт</h2>

            {/* Tab Navigation */}
            <nav className="flex items-center justify-start gap-3 flex-wrap">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); clearCart(); }}
                  className={`relative py-2 px-1 font-medium text-sm h-14 w-full xxs:max-w-[199px] rounded-2xl cursor-pointer ${activeTab === tab.id
                    ? 'bg-custom-gradient text-white'
                    : 'bg-[#e5ebee]'
                    }`}
                >
                  {tab.name}
                  {/* tooltip */}
                  <span className={`absolute flex items-center justify-center cursor-pointer size-4 ${activeTab !== tab.id ? 'bg-custom-gradient text-white' : 'bg-white text-[#359AD7]'} rounded-full top-2 right-4 z-10 group`}>
                    <MdKeyboardArrowRight className='text-lg' />

                    {/* Tooltip */}
                    <div className="absolute min-w=[165px] w-full invisible opacity-0 group-hover:visible group-hover:opacity-100 bg-custom-gradient text-white text-xs rounded-md px-2 py-1 text-left transition-all duration-200 ease-in-out z-20 -right-5 -top-1 transform translate-x-full">
                      Функции автоматической работы без гида и ручного управления
                    </div>
                  </span>
                </button>
              ))}
            </nav>

            {/* Tab Content */}
            <div className="mt-4">
              <div className=' mb-3'>
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
                  {/* Custom arrow */}
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <TiArrowSortedDown />
                  </div>
                </div>
              </div>
              {tabs[activeTab].component}
            </div>
          </div>

          {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            ...
          </div> */}

          <div className="flex gap-3 flex-wrap">
            <button onClick={clearCart} className="h-10 px-6 rounded-lg border border-gray-300 hover:bg-gray-50 cursor-pointer">
              Сбросить
            </button>
          </div>

          {/* Webhook Modal */}
          {/* <WebhookModal ... /> */}

          {/* Order Modal */}
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
            {/* Selected items list */}
            <div className="space-y-6 mb-6">
              {getOrderItems().map((item, index) => (
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
            {/* Price breakdown */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Подытог:</span>
                <span>{formatPrice(subtotal || 0)}</span>
              </div>

              {/* Промокод - временно отключено */}
              {/* {promoDiscountAmount > 0 && (...)} */}

              {shippingCost > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Доставка:</span>
                  <span>{formatPrice(shippingCost)}</span>
                </div>
              )}

              {/* НДС - временно отключено */}
              {/* {vatAmount > 0 && (...)} */}

              <hr className="border-gray-200" />
            </div>
            {/* Total */}
            <div className="mb-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-800">Итого</span>
                <span className="text-3xl font-bold text-primary-600">{formatPrice(total)}</span>
              </div>
              {/* Комплекты - временно отключено */}
              {/* {bundles > 1 && (...)} */}
            </div>

            {/* Action buttons */}
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
