import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { addToWishlist, removeFromWishlist, getUserWishlistProductIds } from '../lib/auth';

interface WishlistHeartProps {
  productId: string;
  className?: string;
}

/**
 * Reusable heart button for wishlist add/remove across the app.
 * - Shows filled/unfilled based on current wishlist state.
 * - If user is logged out, opens auth flow (throws to nearest parent handler).
 * - Calls e.preventDefault / stopPropagation when clicked inside a Link.
 */
const WishlistHeart: React.FC<WishlistHeartProps> = ({
  productId,
  className = '',
}) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial state on mount
  React.useEffect(() => {
    let cancelled = false;
    const checkState = async () => {
      try {
        const ids = await getUserWishlistProductIds();
        if (!cancelled) {
          setIsInWishlist(ids.has(productId));
        }
      } catch {
        // Silently fail — UI will default to unfilled
      }
    };
    checkState();
    return () => { cancelled = true; };
  }, [productId]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);

    if (loading) return;
    setLoading(true);

    try {
      if (isInWishlist) {
        await removeFromWishlist(productId);
        setIsInWishlist(false);
      } else {
        await addToWishlist(productId);
        setIsInWishlist(true);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Có lỗi xảy ra';
      if (message.includes('authenticated')) {
        setError('Vui lòng đăng nhập để thêm vào danh sách yêu thích');
      } else {
        setError(message);
      }
      setIsInWishlist(prev => !prev); // Optimistic toggle back
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`transition-colors flex items-center justify-center ${className}`}
        title={isInWishlist ? 'Xóa khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}
        aria-label={isInWishlist ? 'Xóa khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}
      >
        <Heart
          className={`w-5 h-5 ${
            isInWishlist
              ? 'text-red-500 fill-current hover:text-red-600'
              : 'text-gray-400 hover:text-red-500'
          }`}
          fill={isInWishlist ? 'currentColor' : 'none'}
        />
      </button>
      {error && (
        <span className="text-xs text-red-600 mt-1 block">{error}</span>
      )}
    </>
  );
};

export default WishlistHeart;
