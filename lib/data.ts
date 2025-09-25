import { supabase } from './supabase';
import { trends, posts, postTrends } from '@/data/seed';
import { Post, Trend, PostTrend } from './types';

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
};

export async function fetchTrends(): Promise<Trend[]> {
  if (isSupabaseConfigured()) {
    console.log('📊 Fetching trends from Supabase...');
    try {
      const { data, error } = await supabase
        .from('trends')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching trends from Supabase:', error);
        throw error;
      }

      console.log('✅ Trends fetched from Supabase:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Supabase fetch failed, falling back to local data:', error);
      return trends.filter(trend => trend.is_active);
    }
  } else {
    console.log('📊 Fetching trends from local data (Supabase not configured)...');
    return trends.filter(trend => trend.is_active);
  }
}

export async function fetchPosts(): Promise<Post[]> {
  if (isSupabaseConfigured()) {
    console.log('📄 Fetching posts from Supabase...');
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching posts from Supabase:', error);
        throw error;
      }

      console.log('✅ Posts fetched from Supabase:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Supabase fetch failed, falling back to local data:', error);
      return posts;
    }
  } else {
    console.log('📄 Fetching posts from local data (Supabase not configured)...');
    return posts;
  }
}

export async function fetchPostTrends(): Promise<PostTrend[]> {
  if (isSupabaseConfigured()) {
    console.log('🔗 Fetching post trends from Supabase...');
    try {
      const { data, error } = await supabase
        .from('post_trends')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching post trends from Supabase:', error);
        throw error;
      }

      console.log('✅ Post trends fetched from Supabase:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Supabase fetch failed, falling back to local data:', error);
      return postTrends;
    }
  } else {
    console.log('🔗 Fetching post trends from local data (Supabase not configured)...');
    return postTrends;
  }
}

export async function fetchAllData(): Promise<{
  trends: Trend[];
  posts: Post[];
  postTrends: PostTrend[];
}> {
  const dataSource = isSupabaseConfigured() ? 'Supabase' : 'local seed data';
  console.log(`🔄 Starting to fetch data from ${dataSource}...`);

  const [trendsData, postsData, postTrendsData] = await Promise.all([
    fetchTrends(),
    fetchPosts(),
    fetchPostTrends(),
  ]);

  console.log(`✅ Data fetched successfully from ${dataSource}:`, {
    trendsCount: trendsData.length,
    postsCount: postsData.length,
    postTrendsCount: postTrendsData.length
  });

  return {
    trends: trendsData,
    posts: postsData,
    postTrends: postTrendsData
  };
}

// Function to test database connection
export async function testConnection(): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.log('Supabase not configured, using local data');
    return false;
  }

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