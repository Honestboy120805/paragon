import { createServerSupabase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import { postsRatelimit, createPostRatelimit } from '@/lib/rate-limit';

// Helper function to get client IP
function getClientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    return xff.split(',')[0];
  }
  return request.headers.get('x-real-ip') || 'anonymous';
}

// GET /api/posts?userId=123
export async function GET(request: Request) {
  // ✅ RATE LIMITING GOES HERE - AT THE START OF YOUR API FUNCTION
  const ip = getClientIp(request);
  const { success, limit, reset, remaining } = await postsRatelimit.limit(ip);
  
  // If rate limit exceeded, return 429 error
  if (!success) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Too many requests. Please try again later.' 
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': new Date(reset).toISOString(),
        }
      }
    );
  }
  
  // Continue with your normal API logic
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }
    
    const supabase = createServerSupabase();
    
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Add rate limit headers to successful response
    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
        }
      }
    );
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST /api/posts
export async function POST(request: Request) {
  // ✅ RATE LIMITING FOR CREATE POST - STRICTER LIMITS
  const ip = getClientIp(request);
  const { success, limit, reset, remaining } = await createPostRatelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Too many posts created. Please wait a moment.' 
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': new Date(reset).toISOString(),
        }
      }
    );
  }
  
  // Continue with your normal POST logic
  try {
    const body = await request.json();
    const { title, content, userId } = body;
    
    if (!title || !content || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const supabase = createServerSupabase();
    
    const { data, error } = await supabase
      .from('posts')
      .insert([{ title, content, user_id: userId }])
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json(
      { success: true, data },
      {
        status: 201,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
        }
      }
    );
  } catch (error) {
    console.error('Create error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create post' },
      { status: 500 }
    );
  }
}

// DELETE /api/posts?id=123
export async function DELETE(request: Request) {
  // ✅ RATE LIMITING FOR DELETE
  const ip = getClientIp(request);
  const { success, limit, reset, remaining } = await postsRatelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      { status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': new Date(reset).toISOString(),
        }
      }
    );
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('id');
    
    if (!postId) {
      return NextResponse.json(
        { success: false, error: 'Post ID is required' },
        { status: 400 }
      );
    }
    
    const supabase = createServerSupabase();
    
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);
    
    if (error) throw error;
    
    return NextResponse.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}