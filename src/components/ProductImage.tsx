import React, { useState } from 'react';

/**
 * ProductImage — responsive product image with:
 *  - lazy loading (mobile data savings)
 *  - graceful fallback when the source 404s (brand CDNs change/block)
 *  - bumps Shopify/CDN `&width=500` → `&width=800` for retina screens
 *
 * Usage:
 *   <ProductImage src={product.image} alt={product.name} className="w-full h-full object-cover" />
 * Optionally pass aspectClass to wrap in a fixed-ratio div:
 *   <ProductImage ... aspectClass="aspect-square" />
 */
interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectClass?: string; // wraps the img in <div className={aspectClass}>
  eager?: boolean; // skip lazy loading (e.g. above-the-fold hero)
  fallbackClassName?: string; // extra classes when the image failed
}

const DEFAULT_FALLBACK =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
      <rect width="100%" height="100%" fill="#e5e7eb"/>
      <text x="50%" y="50%" fill="#9ca3af" font-size="16" text-anchor="middle" dominant-baseline="middle">CareHub</text>
    </svg>`
  );

const upgradeWidth = (url: string): string => {
  // Shopify CDN URLs support dynamic resizing: &width=500 → &width=800
  if (url.includes('cdn.shopify.com') || url.includes('/cdn/shop/')) {
    return url.replace(/&width=\d+/, '&width=800');
  }
  return url;
};

const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  className = '',
  aspectClass,
  eager = false,
  fallbackClassName = '',
}) => {
  const [failed, setFailed] = useState(false);

  const finalSrc = failed ? DEFAULT_FALLBACK : upgradeWidth(src);
  const img = (
    <img
      src={finalSrc}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      onError={() => setFailed(true)}
      className={`${className} ${failed ? fallbackClassName : ''}`}
    />
  );

  return aspectClass ? <div className={aspectClass}>{img}</div> : img;
};

export default ProductImage;