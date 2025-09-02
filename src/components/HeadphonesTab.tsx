import React from 'react';
import type { HeadphonesType } from '../types';
import { TiArrowSortedDown } from 'react-icons/ti';

interface HeadphonesTabProps {
  select_headphones: HeadphonesType | null;
  qty_headphones: number;
  setHeadphonesType: (value: HeadphonesType | null) => void;
  setHeadphonesQty: (value: number) => void;
}

const HeadphonesTab: React.FC<HeadphonesTabProps> = ({
  select_headphones,
  qty_headphones,
  setHeadphonesType,
  setHeadphonesQty
}) => {
  return (
    <div className="space-y-6">
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 items-end gap-3">
          <div>
            <div className="md:text-lg font-semibold mb-1">Тип наушников</div>
            <div className="relative w-full">
              <select
                value={select_headphones ?? ''}
                onChange={(e) =>
                  setHeadphonesType(e.target.value ? (e.target.value as HeadphonesType) : null)
                }
                className="w-full text-xs h-10 rounded-lg outline-none border border-black px-3 appearance-none pr-10"
              >
                <option value="">Не выбрано</option>
                {/* ключи оставляем прежние (in_ear / on_ear), подписываем по-новому */}
                <option value="in_ear">Одноразовые</option>
                <option value="on_ear">Многоразовые</option>
              </select>
              {/* Custom arrow */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <TiArrowSortedDown />
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center h-10 border border-black rounded-lg overflow-hidden">
              <input
                type="text"
                value={qty_headphones === 0 ? '' : qty_headphones}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    setHeadphonesQty(Number(e.target.value));
                  }
                }}
                className="flex-1 text-xs border-none outline-none px-5"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeadphonesTab;
