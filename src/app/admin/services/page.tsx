'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface Service {
  id: string;
  title: string;
  category: 'music' | 'comedy' | 'animation' | 'coaching';
  description: string;
  features: string[];
  pricing: string;
  image_url: string;
  video_url: string;
  is_active: boolean;
  display_order: number;
}

interface DropZoneProps {
  accept: string;
  label: string;
  file: File | null;
  previewUrl: string;
  onFileSelect: (file: File) => void;
  onClear: () => void;
  isVideo?: boolean;
}

function DropZone({ accept, label, file, previewUrl, onFileSelect, onClear, isVideo }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) onFileSelect(droppedFile);
  }, [onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) onFileSelect(selected);
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      {previewUrl ? (
        <div className="relative rounded-lg overflow-hidden border border-muted-foreground/20">
          {isVideo ? (
            <video src={previewUrl} className="w-full h-40 object-cover" controls />
          ) : (
            <img src={previewUrl} alt="Preview" className="w-full h-40 object-cover" />
          )}
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors text-xs font-bold"
          >
            ✕
          </button>
          <p className="text-xs text-muted-foreground px-3 py-1 bg-white/90 truncate">{file?.name}</p>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5' :'border-muted-foreground/30 hover:border-primary hover:bg-accent/5'
          }`}
        >
          <div className="flex flex-col items-center space-y-2">
            <Icon name={isVideo ? 'FilmIcon' : 'PhotoIcon'} className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-primary">Click to upload</span> or drag & drop
            </p>
            <p className="text-xs text-muted-foreground">
              {isVideo ? 'MP4, WebM, MOV up to 50MB' : 'PNG, JPG, GIF, WebP up to 50MB'}
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    category: 'music',
    description: '',
    features: '',
    pricing: '',
    is_active: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState('');
  // Keep existing URLs when editing
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [existingVideoUrl, setExistingVideoUrl] = useState('');

  const supabase = createClient();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('service-media')
      .upload(fileName, file, { cacheControl: '3600', upsert: false });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('service-media')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleVideoSelect = (file: File) => {
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      const featuresArray = formData.features.split('\n').filter(f => f.trim());

      let imageUrl = existingImageUrl;
      let videoUrl = existingVideoUrl;

      if (imageFile) {
        setUploadProgress('Uploading image...');
        imageUrl = await uploadFile(imageFile, 'images');
      }

      if (videoFile) {
        setUploadProgress('Uploading video...');
        videoUrl = await uploadFile(videoFile, 'videos');
      }

      setUploadProgress('Saving service...');

      if (editingId) {
        const { error } = await supabase
          .from('services')
          .update({
            ...formData,
            features: featuresArray,
            image_url: imageUrl,
            video_url: videoUrl,
          })
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('services').insert([{
          ...formData,
          features: featuresArray,
          image_url: imageUrl,
          video_url: videoUrl,
          display_order: services.length,
        }]);
        if (error) throw error;
      }

      resetForm();
      fetchServices();
    } catch (error: any) {
      console.error('Error saving service:', error);
      alert(`Failed to save service: ${error.message}`);
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  const editService = (service: Service) => {
    setFormData({
      title: service.title,
      category: service.category,
      description: service.description,
      features: service.features.join('\n'),
      pricing: service.pricing,
      is_active: service.is_active,
    });
    setExistingImageUrl(service.image_url || '');
    setExistingVideoUrl(service.video_url || '');
    setImagePreview(service.image_url || '');
    setVideoPreview(service.video_url || '');
    setEditingId(service.id);
    setShowForm(true);
  };

  const deleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      if (error) throw error;
      fetchServices();
    } catch (error) {
      console.error('Error updating service:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'music',
      description: '',
      features: '',
      pricing: '',
      is_active: true,
    });
    setImageFile(null);
    setImagePreview('');
    setVideoFile(null);
    setVideoPreview('');
    setExistingImageUrl('');
    setExistingVideoUrl('');
    setEditingId(null);
    setShowForm(false);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-serif font-bold">Services</h1>
          <p className="text-muted-foreground mt-2">Manage service offerings</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
        >
          <Icon name="PlusIcon" className="w-5 h-5" />
          <span>Add Service</span>
        </button>
      </div>

      {/* Service Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">{editingId ? 'Edit Service' : 'Add New Service'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
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
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-4 py-2 border border-muted-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
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
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-muted-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Features (one per line)</label>
              <textarea
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                className="w-full px-4 py-2 border border-muted-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows={5}
                placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Pricing</label>
              <input
                type="text"
                required
                value={formData.pricing}
                onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
                className="w-full px-4 py-2 border border-muted-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="From $2,500"
              />
            </div>

            {/* Drag & Drop File Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DropZone
                accept="image/jpeg,image/png,image/gif,image/webp"
                label="Service Image"
                file={imageFile}
                previewUrl={imagePreview}
                onFileSelect={handleImageSelect}
                onClear={() => { setImageFile(null); setImagePreview(''); setExistingImageUrl(''); }}
              />
              <DropZone
                accept="video/mp4,video/webm,video/ogg,video/quicktime"
                label="Service Video (optional)"
                file={videoFile}
                previewUrl={videoPreview}
                onFileSelect={handleVideoSelect}
                onClear={() => { setVideoFile(null); setVideoPreview(''); setExistingVideoUrl(''); }}
                isVideo
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-primary border-muted-foreground/20 rounded focus:ring-primary"
              />
              <label htmlFor="active" className="text-sm font-medium">Active Service</label>
            </div>

            {uploadProgress && (
              <div className="flex items-center space-x-2 text-sm text-primary">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span>{uploadProgress}</span>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={uploading}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Saving...' : editingId ? 'Update Service' : 'Add Service'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border border-muted-foreground/20 rounded-lg hover:bg-accent/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Services List */}
      <div className="space-y-4">
        {services.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <Icon name="BriefcaseIcon" className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No services found</p>
          </div>
        ) : (
          services.map((service) => (
            <div key={service.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex gap-6">
                {service.image_url && (
                  <div className="w-48 h-32 flex-shrink-0 bg-accent/10 rounded-lg overflow-hidden">
                    <AppImage
                      src={service.image_url}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold">{service.title}</h3>
                      <span className="inline-block mt-1 px-3 py-1 bg-accent text-primary rounded-full text-xs font-bold uppercase">
                        {service.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        service.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {service.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-4">{service.description}</p>

                  {service.features.length > 0 && (
                    <ul className="mb-4 space-y-1">
                      {service.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="text-sm flex items-start space-x-2">
                          <Icon name="CheckIcon" className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <p className="font-bold text-lg mb-4">{service.pricing}</p>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => editService(service)}
                      className="px-4 py-2 border border-muted-foreground/20 rounded-lg hover:bg-accent/10 transition-colors text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleActive(service.id, service.is_active)}
                      className="px-4 py-2 border border-muted-foreground/20 rounded-lg hover:bg-accent/10 transition-colors text-sm"
                    >
                      {service.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => deleteService(service.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}