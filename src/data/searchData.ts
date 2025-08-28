export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'Product' | 'Article' | 'Topic';
  category: string;
  url: string;
  image: string;
  price?: number;
  originalPrice?: number;
  rating?: number;
  reviews?: number;
  author?: string;
  readTime?: string;
  publishDate?: string;
}

// Import data from existing sources
import { getProducts } from './products';
import { getArticles } from './articles';
import { getTopics } from './topics';

// Get all search data including products from Supabase
const getAllSearchData = async (): Promise<SearchResult[]> => {
  try {
    const [products, articles, topics] = await Promise.all([
      getProducts(),
      getArticles(),
      getTopics()
    ]);
    
    // Convert products to search results
    const productSearchResults: SearchResult[] = products.map(product => ({
      id: product.id,
      title: product.name,
      description: product.description,
      type: 'Product' as const,
      category: product.category,
      url: `/product/${product.id}`,
      image: product.image,
      price: product.price,
      originalPrice: product.originalPrice,
      rating: product.rating,
      reviews: product.reviews
    }));

    // Convert articles to search results
    const articleSearchResults: SearchResult[] = articles.map(article => ({
      id: article.id,
      title: article.title,
      description: article.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
      type: 'Article' as const,
      category: article.category,
      url: `/womens-health/article/${article.id}`,
      image: article.image,
      author: article.author,
      readTime: article.read_time,
      publishDate: article.publish_date
    }));

    // Convert topics to search results
    const topicSearchResults: SearchResult[] = topics.map(topic => ({
      id: topic.id,
      title: topic.title,
      description: topic.overview.substring(0, 200) + '...',
      type: 'Topic' as const,
      category: topic.category,
      url: `/womens-health/topic/${topic.id}`,
      image: topic.image,
      author: 'Health Team',
      readTime: '8 min read',
      publishDate: topic.publish_date
    }));

    // Combine all search data
    return [
      ...productSearchResults,
      ...articleSearchResults,
      ...topicSearchResults
    ];
  } catch (error) {
    console.error('Error getting search data:', error);
    return []; // Return empty array if all data sources fail
  }
};

// Search function
export const searchSiteContent = async (query: string): Promise<SearchResult[]> => {
  if (!query.trim()) return [];
  
  const searchTerm = query.toLowerCase().trim();
  const allSearchData = await getAllSearchData();
  
  return allSearchData.filter(item => {
    const titleMatch = item.title.toLowerCase().includes(searchTerm);
    const descriptionMatch = item.description.toLowerCase().includes(searchTerm);
    const categoryMatch = item.category.toLowerCase().includes(searchTerm);
    const authorMatch = item.author?.toLowerCase().includes(searchTerm) || false;
    
    return titleMatch || descriptionMatch || categoryMatch || authorMatch;
  });
};

// Get search suggestions (for autocomplete)
const getSearchSuggestions = async (query: string, limit: number = 5): Promise<string[]> => {
  if (!query.trim()) return [];
  
  const searchTerm = query.toLowerCase().trim();
  const suggestions = new Set<string>();
  const allSearchData = await getAllSearchData();
  
  allSearchData.forEach(item => {
    // Add title suggestions
    if (item.title.toLowerCase().includes(searchTerm)) {
      suggestions.add(item.title);
    }
    
    // Add category suggestions
    if (item.category.toLowerCase().includes(searchTerm)) {
      suggestions.add(item.category);
    }
    
    // Add author suggestions
    if (item.author && item.author.toLowerCase().includes(searchTerm)) {
      suggestions.add(item.author);
    }
  });
  
  return Array.from(suggestions).slice(0, limit);
};