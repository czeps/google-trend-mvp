import { trends, posts, postTrends } from '@/data/seed';
import { Post, Trend, PostTrend } from './types';

export async function fetchTrends(): Promise<Trend[]> {
  console.log('📊 Fetching trends from local data...');
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 100));

  const activeTrends = trends.filter(trend => trend.is_active);
  console.log('✅ Trends fetched:', activeTrends.length);
  return activeTrends;
}

export async function fetchPosts(): Promise<Post[]> {
  console.log('📄 Fetching posts from local data...');
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 100));

  console.log('✅ Posts fetched:', posts.length);
  return posts;
}

export async function fetchPostTrends(): Promise<PostTrend[]> {
  console.log('🔗 Fetching post trends from local data...');
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 100));

  console.log('✅ Post trends fetched:', postTrends.length);
  return postTrends;
}

export async function fetchAllData(): Promise<{
  trends: Trend[];
  posts: Post[];
  postTrends: PostTrend[];
}> {
  console.log('🔄 Starting to fetch data from local seed...');

  const [trendsData, postsData, postTrendsData] = await Promise.all([
    fetchTrends(),
    fetchPosts(),
    fetchPostTrends(),
  ]);

  console.log('✅ Data fetched successfully:', {
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