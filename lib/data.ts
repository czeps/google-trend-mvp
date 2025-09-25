import { supabase } from './supabase';
import { Post, Trend, PostTrend } from './types';

export async function fetchTrends(): Promise<Trend[]> {
  console.log('📊 Fetching trends...');
  const { data, error } = await supabase
    .from('trends')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching trends:', error);
    return [];
  }

  console.log('✅ Trends fetched:', data?.length || 0);
  return data || [];
}

export async function fetchPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }

  return data || [];
}

export async function fetchPostTrends(): Promise<PostTrend[]> {
  const { data, error } = await supabase
    .from('post_trends')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching post trends:', error);
    return [];
  }

  return data || [];
}

export async function fetchAllData(): Promise<{
  trends: Trend[];
  posts: Post[];
  postTrends: PostTrend[];
}> {
  console.log('🔄 Starting to fetch data from Supabase...');

  const [trends, posts, postTrends] = await Promise.all([
    fetchTrends(),
    fetchPosts(),
    fetchPostTrends(),
  ]);

  console.log('✅ Data fetched successfully:', {
    trendsCount: trends.length,
    postsCount: posts.length,
    postTrendsCount: postTrends.length
  });

  return { trends, posts, postTrends };
}

// Function to test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('trends')
      .select('count(*)', { count: 'exact' });

    if (error) {
      console.error('Connection test failed:', error);
      return false;
    }

    console.log('Connection successful. Trends count:', data);
    return true;
  } catch (error) {
    console.error('Connection test error:', error);
    return false;
  }
}