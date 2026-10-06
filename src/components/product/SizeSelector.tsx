import { ProductVariant } from '../../types';
import { useCurrency } from '../../context/CurrencyContext';
import { getVariantDisplayDimensions } from '../../utils/dimensionHelper';

interface SizeSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant;
  onSelectVariant: (variant: ProductVariant) => void;
  onRequestCustomSize: () => void;
}

export const SizeSelector: React.FC<SizeSelectorProps> = ({
  variants,
  selectedVariant,
  onSelectVariant,
  onRequestCustomSize,
}) => {
  const { formatPrice } = useCurrency();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-atelier-softblack uppercase tracking-wider text-[11px]">
          Select Dimensions
        </span>
        <button
          type="button"
          onClick={onRequestCustomSize}
          className="text-atelier-darkbrown hover:text-atelier-softblack underline text-[11px] tracking-wider transition-colors"
        >
          Need a custom size?
        </button>
      </div>

      {/* Grid of size options */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {variants.map((variant) => {
          const isSelected = variant.id === selectedVariant.id;
          const isSoldOut = variant.inventory === 0 && !variant.productionTimeWeeks;
          const { primary, secondary } = getVariantDisplayDimensions(variant);

          return (
            <button
              key={variant.id}
              type="button"
              disabled={isSoldOut}
              onClick={() => onSelectVariant(variant)}
              className={`p-2.5 sm:p-3 text-left border transition-all relative ${
                isSelected
                  ? 'border-atelier-softblack bg-atelier-cream/80 ring-1 ring-atelier-softblack'
                  : 'border-atelier-parchment hover:border-atelier-taupe bg-atelier-ivory'
              } ${isSoldOut ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="font-medium text-xs text-atelier-softblack">
                {primary}
              </div>
              {secondary ? (
                <div className="text-[10px] text-atelier-taupe truncate">
                  {secondary}
                </div>
              ) : null}
              <div className="mt-1.5 flex flex-wrap items-baseline justify-between gap-1">
                <span className="font-sans text-xs sm:text-sm text-atelier-softblack font-medium">
                  {formatPrice(variant.priceUSD)}
                </span>
                {variant.inventory === 1 && (
                  <span className="text-[10px] text-amber-900 font-medium bg-amber-50 px-1 py-0.5 rounded-sm">1 left</span>
                )}
                {variant.inventory === 0 && (
                  <span className="text-[10px] text-atelier-taupe font-normal">Made to order</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
