'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface MediaItem {
  id: string;
  title: string;
  description: string;
  media_type: 'image' | 'video';
  url: string;
  thumbnail_url: string;
  category: string;
  is_featured: boolean;
  display_order: number;
  created_at: string;
}

interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'warning';
  message: string;
}

function Toast({ toasts, onRemove }: { toasts: ToastMessage[]; onRemove: (id: number) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium pointer-events-auto
            animate-[slideInRight_0.3s_ease-out]
            ${toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-yellow-600'}`}
        >
          <Icon
            name={toast.type === 'success' ? 'CheckCircleIcon' : toast.type === 'error' ? 'XCircleIcon' : 'ExclamationTriangleIcon'}
            className="w-5 h-5 flex-shrink-0"
          />
          <span>{toast.message}</span>
          <button onClick={() => onRemove(toast.id)} className="ml-2 hover:opacity-75">
            <Icon name="XMarkIcon" className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    media_type: 'image\' as \'image\' | \'video',
    category: 'general',
    is_featured: false,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; url: string } | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const addToast = useCallback((type: ToastMessage['type'], message: string) => {
  const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const { data, error } = await supabase
        .from('media_gallery')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setMedia(data || []);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'thumbnail') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'main') {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      // Auto-detect media type
      if (file.type.startsWith('video/')) {
        setFormData(prev => ({ ...prev, media_type: 'video' }));
      } else {
        setFormData(prev => ({ ...prev, media_type: 'image' }));
      }
    } else {
      setSelectedThumbnail(file);
    }
  };

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('media-uploads')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('media-uploads')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      addToast('warning', 'Please select a file to upload');
      return;
    }

    setUploading(true);
    try {
      setUploadProgress('Uploading file...');
      const fileUrl = await uploadFile(selectedFile, formData.media_type === 'video' ? 'videos' : 'images');

      let thumbnailUrl = fileUrl;
      if (selectedThumbnail) {
        setUploadProgress('Uploading thumbnail...');
        thumbnailUrl = await uploadFile(selectedThumbnail, 'thumbnails');
      } else if (formData.media_type === 'video') {
        thumbnailUrl = '';
      }

      setUploadProgress('Saving to database...');
      const { error } = await supabase.from('media_gallery').insert([{
        title: formData.title,
        description: formData.description,
        media_type: formData.media_type,
        category: formData.category,
        url: fileUrl,
        thumbnail_url: thumbnailUrl,
        is_featured: formData.is_featured,
        display_order: media.length,
      }]);

      if (error) throw error;

      resetForm();
      fetchMedia();
      addToast('success', 'Media uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading media:', error);
      addToast('error', `Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      media_type: 'image',
      category: 'general',
      is_featured: false,
    });
    setSelectedFile(null);
    setSelectedThumbnail(null);
    setPreviewUrl('');
    setShowAddForm(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
  };

    const deleteMedia = async () => {
    if (!deleteTarget) return;
    const { id, url } = deleteTarget;
    setDeleteTarget(null);
    try {
      if (url.includes('media-uploads')) {
        const path = url.split('/media-uploads/')[1];
        if (path) {
          await supabase.storage.from('media-uploads').remove([path]);
        }
      }
      const { error } = await supabase.from('media_gallery').delete().eq('id', id);
      if (error) throw error;
      fetchMedia();
      addToast('success', 'Media item deleted successfully!');
    } catch (error) {
      console.error('Error deleting media:', error);
      addToast('error', 'Failed to delete media item.');
    }
  };

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('media_gallery')
        .update({ is_featured: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      fetchMedia();
    } catch (error) {
      console.error('Error updating media:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

            <Toast toasts={toasts} onRemove={removeToast} />

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Icon name="TrashIcon" className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Delete Media</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">Are you sure you want to delete this media item?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-muted-foreground/20 rounded-lg hover:bg-accent/10 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={deleteMedia}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-serif font-bold">Media Gallery</h1>
          <p className="text-muted-foreground mt-2">Upload and manage images and videos</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
        >
          <Icon name="PlusIcon" className="w-5 h-5" />
          <span>Upload Media</span>
        </button>
      </div>

      {/* Upload Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Upload New Media</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-muted-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-muted-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="general">General</option>
                  <option value="music">Music</option>
                  <option value="comedy">Comedy</option>
                  <option value="animation">Animation</option>
                  <option value="coaching">Coaching</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-muted-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows={2}
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Media File * (Image or Video)</label>
              <div
                className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <div className="space-y-2">
                    {formData.media_type === 'image' ? (
                      <img src={previewUrl} alt="Preview" className="max-h-40 mx-auto rounded-lg object-contain" />
                    ) : (
                      <video src={previewUrl} className="max-h-40 mx-auto rounded-lg" controls />
                    )}
                    <p className="text-sm text-muted-foreground">{selectedFile?.name}</p>
                    <p className="text-xs text-primary">Click to change file</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Icon name="CloudArrowUpIcon" className="w-10 h-10 text-muted-foreground mx-auto" />
                    <p className="text-sm font-medium">Click to upload image or video</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG, GIF, MP4, MOV, WebM supported</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={(e) => handleFileSelect(e, 'main')}
                className="hidden"
              />
            </div>

            {/* Thumbnail for videos */}
            {formData.media_type === 'video' && (
              <div>
                <label className="block text-sm font-medium mb-2">Video Thumbnail (Optional)</label>
                <div
                  className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => thumbnailInputRef.current?.click()}
                >
                  {selectedThumbnail ? (
                    <p className="text-sm text-muted-foreground">{selectedThumbnail.name} ✓</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Click to upload thumbnail image</p>
                  )}
                </div>
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, 'thumbnail')}
                  className="hidden"
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="w-4 h-4 text-primary border-muted-foreground/20 rounded focus:ring-primary"
              />
              <label htmlFor="featured" className="text-sm font-medium">Featured Item</label>
            </div>

            {uploadProgress && (
              <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 px-4 py-2 rounded-lg">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                {uploadProgress}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploading ? (
                  <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Uploading...</>
                ) : (
                  <><Icon name="CloudArrowUpIcon" className="w-4 h-4" /> Upload Media</>
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={uploading}
                className="px-6 py-2 border border-muted-foreground/20 rounded-lg hover:bg-accent/10 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {media.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-md">
            <Icon name="PhotoIcon" className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No media items found. Upload your first media file!</p>
          </div>
        ) : (
          media.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative aspect-video bg-accent/10">
                {item.media_type === 'image' ? (
                  <AppImage
                    src={item.thumbnail_url || item.url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900">
                    {item.thumbnail_url ? (
                      <AppImage src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover opacity-70" />
                    ) : null}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icon name="PlayIcon" className="w-12 h-12 text-white" />
                    </div>
                  </div>
                )}
                {item.is_featured && (
                  <span className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold">
                    Featured
                  </span>
                )}
                {item.category && item.category !== 'general' && (
                  <span className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded text-xs font-bold capitalize">
                    {item.category}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground mb-1 capitalize">{item.media_type}</p>
                {item.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{item.description}</p>
                )}
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleFeatured(item.id, item.is_featured)}
                    className="flex-1 px-3 py-2 border border-muted-foreground/20 rounded-lg hover:bg-accent/10 transition-colors text-sm"
                  >
                    {item.is_featured ? 'Unfeature' : 'Feature'}
                  </button>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    <Icon name="EyeIcon" className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => setDeleteTarget({ id: item.id, url: item.url })}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                  >
                    <Icon name="TrashIcon" className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}