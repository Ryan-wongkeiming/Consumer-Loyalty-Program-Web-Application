import { supabase } from '../lib/supabaseClient';

export interface Article {
  id: string;
  title: string;
  content: string;
  image: string;
  author: string;
  publish_date: string;
  read_time: string;
  category: string;
  tags: string[];
}

// Fetch articles from Supabase
const fetchArticles = async (): Promise<Article[]> => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('publish_date', { ascending: false });

    if (error) {
      console.error('Error fetching articles:', error);
      return [];
    }

    return data.map(article => ({
      id: article.id,
      title: article.title,
      content: article.content,
      image: article.image || '',
      author: article.author || 'Blackmores Team',
      publish_date: article.publish_date || new Date().toISOString().split('T')[0],
      read_time: article.read_time || '5 min read',
      category: article.category || "Women's health",
      tags: article.tags || []
    }));
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
};

// Cache for articles to avoid repeated API calls
let articlesCache: Article[] | null = null;

// Get articles with caching
export const getArticles = async (): Promise<Article[]> => {
  if (articlesCache) {
    return articlesCache;
  }
  
  articlesCache = await fetchArticles();
  return articlesCache;
};

// Get single article by ID
export const getArticleById = async (id: string): Promise<Article | null> => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      title: data.title,
      content: data.content,
      image: data.image || '',
      author: data.author || 'Blackmores Team',
      publish_date: data.publish_date || new Date().toISOString().split('T')[0],
      read_time: data.read_time || '5 min read',
      category: data.category || "Women's health",
      tags: data.tags || []
    };
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
};

// Clear cache function (useful for admin operations)
const clearArticlesCache = () => {
  articlesCache = null;
};