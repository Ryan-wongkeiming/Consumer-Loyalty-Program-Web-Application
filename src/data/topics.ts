import { supabase } from '../lib/supabaseClient';

export interface Topic {
  id: string;
  title: string;
  overview: string;
  symptoms: string[];
  causes: string[];
  natural_therapies: string[];
  diet_and_lifestyle: string[];
  important_notes: string[];
  image: string;
  category: string;
  publish_date: string;
}

// Fetch topics from Supabase
const fetchTopics = async (): Promise<Topic[]> => {
  try {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .order('publish_date', { ascending: false });

    if (error) {
      console.error('Error fetching topics:', error);
      return [];
    }

    return data.map(topic => ({
      id: topic.id,
      title: topic.title,
      overview: topic.overview,
      symptoms: topic.symptoms || [],
      causes: topic.causes || [],
      natural_therapies: topic.natural_therapies || [],
      diet_and_lifestyle: topic.diet_and_lifestyle || [],
      important_notes: topic.important_notes || [],
      image: topic.image || '',
      category: topic.category || "Women's health",
      publish_date: topic.publish_date || new Date().toISOString().split('T')[0]
    }));
  } catch (error) {
    console.error('Error fetching topics:', error);
    return [];
  }
};

// Cache for topics to avoid repeated API calls
let topicsCache: Topic[] | null = null;

// Get topics with caching
export const getTopics = async (): Promise<Topic[]> => {
  if (topicsCache) {
    return topicsCache;
  }
  
  topicsCache = await fetchTopics();
  return topicsCache;
};

// Get single topic by ID
export const getTopicById = async (id: string): Promise<Topic | null> => {
  try {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Error fetching topic:', error);
      return null;
    }

    return {
      id: data.id,
      title: data.title,
      overview: data.overview,
      symptoms: data.symptoms || [],
      causes: data.causes || [],
      natural_therapies: data.natural_therapies || [],
      diet_and_lifestyle: data.diet_and_lifestyle || [],
      important_notes: data.important_notes || [],
      image: data.image || '',
      category: data.category || "Women's health",
      publish_date: data.publish_date || new Date().toISOString().split('T')[0]
    };
  } catch (error) {
    console.error('Error fetching topic:', error);
    return null;
  }
};

// Clear cache function (useful for admin operations)
const clearTopicsCache = () => {
  topicsCache = null;
};