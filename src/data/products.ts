import { supabase } from '../lib/supabaseClient';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[]; // Array of image URLs for gallery
  category: string;
  benefits: string[];
  ingredients: string[];
  dosage: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  isSubscription?: boolean;
  // New filter properties
  genderAgeCategories?: string[];
  productIngredients?: string[];
  healthGoals?: string[];
}

// Fetch products from Supabase
const fetchProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('in_stock', true);

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return data.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      originalPrice: product.original_price,
      image: product.image || '',
      images: product.images || [],
      category: product.category || '',
      benefits: product.benefits || [],
      ingredients: product.ingredients || [],
      dosage: product.dosage || '',
      rating: product.rating || 0,
      reviews: product.reviews || 0,
      inStock: product.in_stock,
      isSubscription: product.is_subscription,
      genderAgeCategories: product.gender_age_categories || [],
      productIngredients: product.product_ingredients || [],
      healthGoals: product.health_goals || []
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

// Cache for products to avoid repeated API calls
let productsCache: Product[] | null = null;

// Get products with caching
export const getProducts = async (): Promise<Product[]> => {
  if (productsCache) {
    return productsCache;
  }
  
  productsCache = await fetchProducts();
  return productsCache;
};

// Legacy export for backward compatibility - now fetches from Supabase
const products: Product[] = [];

// Initialize products cache on module load
getProducts().then(data => {
  products.splice(0, products.length, ...data);
});

export const categories = [
  'All Products',
  'Subscription Service',
  'Vitamins',
  'Fish Oil',
  'Multivitamins',
  'Minerals',
  'Herbs',
  'Probiotics',
  'Infant Formula'
];

export const genderAgeOptions = [
  'All',
  'Women\'s',
  'Men\'s',
  'Kids',
  'Infant Formula'
];

export const ingredientOptions = [
  'All',
  'Fish Oil & Omega 3',
  'Halal Certified',
  'Iron',
  'Magnesium',
  'Probiotics',
  'Vitamin C',
  'Vitamin D',
  'Vitamin E',
  'Vegan Certified',
  'Zinc'
];

export const healthGoalOptions = [
  'All',
  'Brain Health',
  'Cold, Flu & Immunity',
  'Digestive Health',
  'Energy',
  'Eye Health',
  'General Health',
  'Heart Health',
  'Joints, Bones & Muscles',
  'Multivitamins',
  'Preconception, Pregnancy & Breastfeeding',
  'Nails, Hair & Skin',
  'Sleep & Stress'
];