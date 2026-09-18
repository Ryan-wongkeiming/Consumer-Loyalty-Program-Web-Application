import React from 'react';
import { Check } from 'lucide-react';
import { BundleTier, formatPrice, getBundleMultiplier } from '../data/pricing';
import { Product } from '../data/products';

interface BundleSelectorProps {
  product: Product;
  tiers: BundleTier[];
  selectedQuantity: number;
  onSelect: (quantity: number) => void;
  isSubscription: boolean;
  subscriptionMultiplier: number;
}

const BundleSelector: React.FC<BundleSelectorProps> = ({
  product,
  tiers,
  selectedQuantity,
  onSelect,
  isSubscription,
  subscriptionMultiplier,
}) => {
  // Single-unit baseline (no bundle discount)
  const baseUnit = product.price;
  const effectiveUnit = isSubscription
    ? Math.round(baseUnit * subscriptionMultiplier)
    : baseUnit;

  return (
    <div className="bg-gradient-to-br from-green-50 to-teal-50 border border-green-200 rounded-xl p-4 lg:p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm sm:text-base lg:text-lg text-gray-900">
          Mua nhiều – Tiết kiệm nhiều
        </h3>
        <span className="text-xs sm:text-sm text-carehub-teal font-medium">
          Ưu đãi theo số lượng
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
        {/* 1 unit baseline */}
        <button
          onClick={() => onSelect(1)}
          className={`relative rounded-lg border-2 p-3 sm:p-4 text-left transition-all ${
            selectedQuantity === 1
              ? 'border-carehub-teal bg-white shadow-md'
              : 'border-gray-200 bg-white hover:border-carehub-teal/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-sm sm:text-base text-gray-900">1 hộp</span>
            {selectedQuantity === 1 && (
              <Check className="w-4 h-4 text-carehub-teal" />
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-500">Giá tiêu chuẩn</p>
          <p className="font-bold text-sm sm:text-base text-gray-900 mt-1">
            {formatPrice(effectiveUnit)}
          </p>
        </button>

        {tiers.map(tier => {
          const tierUnit = isSubscription
            ? Math.round(baseUnit * subscriptionMultiplier * (1 - tier.discountPercent / 100))
            : Math.round(baseUnit * (1 - tier.discountPercent / 100));
          const selected = selectedQuantity === tier.quantity;
          return (
            <button
              key={tier.quantity}
              onClick={() => onSelect(tier.quantity)}
              className={`relative rounded-lg border-2 p-3 sm:p-4 text-left transition-all ${
                selected
                  ? 'border-carehub-teal bg-white shadow-md'
                  : 'border-gray-200 bg-white hover:border-carehub-teal/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm sm:text-base text-gray-900">
                  {tier.quantity} hộp
                </span>
                {selected && <Check className="w-4 h-4 text-carehub-teal" />}
              </div>
              <span className="inline-block bg-green-100 text-green-800 px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-semibold">
                {tier.label}
              </span>
              <p className="font-bold text-sm sm:text-base text-carehub-teal mt-1">
                {formatPrice(tierUnit * tier.quantity)}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-400 line-through">
                {formatPrice(baseUnit * tier.quantity)}
              </p>
            </button>
          );
        })}
      </div>

      <p className="text-[10px] sm:text-xs text-gray-500 mt-3">
        Giảm giá cộng dồn với Đăng ký &amp; Tiết kiệm. Tổng tiết kiệm tính theo giá gốc.
      </p>
    </div>
  );
};

export default BundleSelector;