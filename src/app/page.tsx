'use client';

import { useState, useEffect } from 'react';

interface Post {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [userId, setUserId] = useState('auth');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: ''
  });

  // Auto-load posts when userId changes
  useEffect(() => {
    if (userId) {
      fetchPosts(userId);
    }
  }, [userId]);

  const fetchPosts = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/posts?userId=${userId}`);
      const result = await response.json();
      
      if (result.success) {
        setPosts(result.data);
        if (result.data.length === 0) {
          setSuccessMessage('No posts yet. Create your first post!');
        } else {
          setSuccessMessage(null);
        }
      } else {
        setError(result.error || 'Failed to load posts');
        setPosts([]);
      }
    } catch (error) {
      setError('Network error: Could not fetch posts');
      console.error('Failed to fetch:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPost.title.trim()) {
      setError('Please enter a title');
      return;
    }
    
    if (!newPost.content.trim()) {
      setError('Please enter content');
      return;
    }
    
    setCreating(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: newPost.title.trim(), 
          content: newPost.content.trim(), 
          userId 
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setPosts([result.data, ...posts]);
        setNewPost({ title: '', content: '' });
        setShowCreateForm(false);
        setSuccessMessage('Post created successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.error || 'Failed to create post');
      }
    } catch (error) {
      setError('Network error: Could not create post');
      console.error('Failed to create:', error);
    } finally {
      setCreating(false);
    }
  };

  const deletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    setDeletingId(postId);
    setError(null);
    
    try {
      const response = await fetch(`/api/posts?id=${postId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        setPosts(posts.filter(post => post.id !== postId));
        setSuccessMessage('Post deleted successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.error || 'Failed to delete post');
      }
    } catch (error) {
      setError('Network error: Could not delete post');
      console.error('Failed to delete:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>📝 Blog Posts</h1>
          <p style={styles.subtitle}>Share your thoughts with the world</p>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {/* User Info Bar */}
        <div style={styles.userBar}>
          <div style={styles.userInfo}>
            <span style={styles.userLabel}>Current User:</span>
            <span style={styles.userId}>{userId}</span>
          </div>
          <button 
            onClick={() => fetchPosts(userId)} 
            style={styles.refreshButton}
            disabled={loading}
          >
            🔄 Refresh
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div style={styles.errorMessage}>
            <span>❌</span>
            <span style={styles.messageText}>{error}</span>
            <button onClick={() => setError(null)} style={styles.closeButton}>×</button>
          </div>
        )}

        {successMessage && (
          <div style={styles.successMessage}>
            <span>✅</span>
            <span style={styles.messageText}>{successMessage}</span>
            <button onClick={() => setSuccessMessage(null)} style={styles.closeButton}>×</button>
          </div>
        )}

        {/* Create Post Button */}
        {!showCreateForm && (
          <button 
            onClick={() => setShowCreateForm(true)} 
            style={styles.createButton}
          >
            + Create New Post
          </button>
        )}

        {/* Create Post Form */}
        {showCreateForm && (
          <div style={styles.formContainer}>
            <div style={styles.formHeader}>
              <h2 style={styles.formTitle}>Create New Post</h2>
              <button 
                onClick={() => setShowCreateForm(false)} 
                style={styles.closeFormButton}
              >
                ×
              </button>
            </div>
            <form onSubmit={createPost}>
              <input
                type="text"
                placeholder="Post title..."
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                style={styles.titleInput}
                disabled={creating}
                autoFocus
              />
              <textarea
                placeholder="Write your content here..."
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                rows={6}
                style={styles.contentInput}
                disabled={creating}
              />
              <div style={styles.formButtons}>
                <button 
                  type="button" 
                  onClick={() => setShowCreateForm(false)} 
                  style={styles.cancelButton}
                  disabled={creating}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={styles.submitButton}
                  disabled={creating}
                >
                  {creating ? 'Creating...' : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Posts List */}
        <div style={styles.postsSection}>
          <h2 style={styles.postsTitle}>
            Your Posts 
            {posts.length > 0 && <span style={styles.postCount}> ({posts.length})</span>}
          </h2>
          
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p style={styles.loadingText}>Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📭</div>
              <p style={styles.emptyText}>No posts yet</p>
              <p style={styles.emptySubtext}>Click the "Create New Post" button to get started</p>
            </div>
          ) : (
            <div style={styles.postsGrid}>
              {posts.map((post) => (
                <article key={post.id} style={styles.postCard}>
                  <div style={styles.postHeader}>
                    <h3 style={styles.postTitle}>{post.title}</h3>
                    <button
                      onClick={() => deletePost(post.id)}
                      style={styles.deleteButton}
                      disabled={deletingId === post.id}
                    >
                      {deletingId === post.id ? '...' : '🗑️'}
                    </button>
                  </div>
                  <p style={styles.postContent}>{post.content}</p>
                  <div style={styles.postFooter}>
                    <span style={styles.postDate}>
                      📅 {formatDate(post.created_at)}
                    </span>
                    <span style={styles.postId}>
                      ID: {post.id.slice(0, 8)}...
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>© 2024 Blog Posts App | Built with Next.js & Supabase</p>
      </footer>
    </div>
  );
}

// Styles object
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e0e0e0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#1a1a1a',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.9rem',
    color: '#666',
    marginTop: '0.5rem',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem',
    flex: 1,
  },
  userBar: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  userLabel: {
    fontSize: '0.9rem',
    color: '#666',
  },
  userId: {
    fontWeight: 'bold',
    color: '#3b82f6',
    fontFamily: 'monospace',
  },
  refreshButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#f0f0f0',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'background-color 0.2s',
  },
  errorMessage: {
    backgroundColor: '#fee',
    border: '1px solid #fcc',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#c00',
  },
  successMessage: {
    backgroundColor: '#efe',
    border: '1px solid #cfc',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#060',
  },
  messageText: {
    flex: 1,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: 'inherit',
  },
  createButton: {
    width: '100%',
    padding: '1rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '1.5rem',
    transition: 'background-color 0.2s',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  formHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  formTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    margin: 0,
  },
  closeFormButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#999',
  },
  titleInput: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '1rem',
    marginBottom: '1rem',
  },
  contentInput: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '1rem',
    fontFamily: 'inherit',
    marginBottom: '1rem',
  },
  formButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#f0f0f0',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  submitButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  postsSection: {
    marginTop: '1rem',
  },
  postsTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  postCount: {
    fontSize: '0.9rem',
    fontWeight: 'normal',
    color: '#666',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '3rem',
  },
  spinner: {
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #3b82f6',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 1rem',
  },
  loadingText: {
    color: '#666',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  emptyText: {
    fontSize: '1.1rem',
    color: '#666',
    marginBottom: '0.5rem',
  },
  emptySubtext: {
    fontSize: '0.9rem',
    color: '#999',
  },
  postsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  postCard: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'box-shadow 0.2s',
  },
  postHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  postTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#1a1a1a',
    margin: 0,
    flex: 1,
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.25rem',
    cursor: 'pointer',
    padding: '0.25rem',
    opacity: 0.6,
    transition: 'opacity 0.2s',
  },
  postContent: {
    color: '#444',
    lineHeight: '1.5',
    marginBottom: '1rem',
    whiteSpace: 'pre-wrap',
  },
  postFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.8rem',
    color: '#999',
    paddingTop: '0.5rem',
    borderTop: '1px solid #f0f0f0',
  },
  postDate: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  postId: {
    fontFamily: 'monospace',
  },
  footer: {
    textAlign: 'center',
    padding: '2rem',
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e0e0e0',
    color: '#666',
    fontSize: '0.8rem',
  },
};

// Add keyframe animation for spinner
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}