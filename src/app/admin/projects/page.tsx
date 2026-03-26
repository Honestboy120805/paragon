'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  project_date: string;
  image_url: string;
  is_featured: boolean;
  display_order: number;
}

interface DropZoneProps {
  file: File | null;
  previewUrl: string;
  onFileSelect: (file: File) => void;
  onClear: () => void;
}

function ImageDropZone({ file, previewUrl, onFileSelect, onClear }: DropZoneProps) {
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
      <label className="block text-sm font-medium mb-2">Project Image</label>
      {previewUrl ? (
        <div className="relative rounded-lg overflow-hidden border border-muted-foreground/20">
          <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover" />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors text-xs font-bold"
          >
            ✕
          </button>
          <p className="text-xs text-muted-foreground px-3 py-1 bg-white/90 truncate">{file?.name || 'Current image'}</p>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5' :'border-muted-foreground/30 hover:border-primary hover:bg-accent/5'
          }`}
        >
          <div className="flex flex-col items-center space-y-2">
            <Icon name="PhotoIcon" className="w-10 h-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-primary">Click to upload</span> or drag & drop
            </p>
            <p className="text-xs text-muted-foreground">PNG, JPG, GIF, WebP up to 50MB</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Music',
    project_date: '',
    is_featured: true,
    display_order: 0,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [existingImageUrl, setExistingImageUrl] = useState('');

  const supabase = createClient();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `projects/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
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

  const handleImageClear = () => {
    setImageFile(null);
    setImagePreview('');
    setExistingImageUrl('');
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', category: 'Music', project_date: '', is_featured: true, display_order: 0 });
    setImageFile(null);
    setImagePreview('');
    setExistingImageUrl('');
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const handleEdit = (project: Project) => {
    setFormData({
      title: project.title,
      description: project.description || '',
      category: project.category,
      project_date: project.project_date || '',
      is_featured: project.is_featured,
      display_order: project.display_order,
    });
    setExistingImageUrl(project.image_url || '');
    setImagePreview(project.image_url || '');
    setImageFile(null);
    setEditingId(project.id);
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Project title is required.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      let imageUrl = existingImageUrl;
      if (imageFile) {
        setUploadProgress('Uploading image...');
        imageUrl = await uploadImage(imageFile);
      }
      setUploadProgress('Saving project...');
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        project_date: formData.project_date || null,
        image_url: imageUrl,
        is_featured: formData.is_featured,
        display_order: formData.display_order,
      };
      if (editingId) {
        const { error } = await supabase.from('projects').update(payload).eq('id', editingId);
        if (error) throw error;
        setSuccess('Project updated successfully!');
      } else {
        const { error } = await supabase.from('projects').insert([payload]);
        if (error) throw error;
        setSuccess('Project added successfully!');
      }
      await fetchProjects();
      resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save project.';
      setError(message);
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      setProjects(prev => prev.filter(p => p.id !== id));
      setDeleteConfirmId(null);
      setSuccess('Project deleted.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete project.';
      setError(message);
    }
  };

  const categories = ['Music', 'Comedy', 'Animation', 'Events', 'Coaching', 'Other'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage projects shown in the Recent Projects section on the homepage.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <Icon name="PlusIcon" className="w-4 h-4" />
            Add Project
          </button>
        )}
      </div>

      {/* Alerts */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">{success}</div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-5">{editingId ? 'Edit Project' : 'Add New Project'}</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Project Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Summer Concert 2024"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Project Date</label>
                <input
                  type="date"
                  value={formData.project_date}
                  onChange={e => setFormData(prev => ({ ...prev, project_date: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                />
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Display Order</label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={e => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                  min={0}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the project..."
                rows={3}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background resize-none"
              />
            </div>

            {/* Image Upload */}
            <ImageDropZone
              file={imageFile}
              previewUrl={imagePreview}
              onFileSelect={handleImageSelect}
              onClear={handleImageClear}
            />

            {/* Featured toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, is_featured: !prev.is_featured }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.is_featured ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.is_featured ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <label className="text-sm font-medium">Show on homepage</label>
            </div>

            {/* Upload progress */}
            {uploading && uploadProgress && (
              <div className="flex items-center gap-2 text-sm text-primary">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                {uploadProgress}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={uploading}
                className="bg-primary text-primary-foreground px-5 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-60"
              >
                {uploading ? 'Saving...' : editingId ? 'Update Project' : 'Add Project'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="border border-border px-5 py-2 rounded-lg hover:bg-accent transition-colors text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Icon name="PhotoIcon" className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No projects yet</p>
          <p className="text-sm mt-1">Add your first project to display it on the homepage.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map(project => (
            <div key={project.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Image */}
              <div className="relative aspect-[4/3] bg-muted">
                {project.image_url ? (
                  <AppImage
                    src={project.image_url}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon name="PhotoIcon" className="w-10 h-10 text-muted-foreground/40" />
                  </div>
                )}
                {/* Featured badge */}
                {project.is_featured && (
                  <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                    Featured
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm leading-tight line-clamp-1">{project.title}</h3>
                  <span className="shrink-0 bg-accent text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                    {project.category}
                  </span>
                </div>
                {project.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
                )}
                {project.project_date && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(project.project_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleEdit(project)}
                    className="flex-1 flex items-center justify-center gap-1.5 border border-border rounded-lg py-1.5 text-xs font-medium hover:bg-accent transition-colors"
                  >
                    <Icon name="PencilIcon" className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  {deleteConfirmId === project.id ? (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="flex-1 bg-red-500 text-white rounded-lg py-1.5 px-2 text-xs font-medium hover:bg-red-600 transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="flex-1 border border-border rounded-lg py-1.5 px-2 text-xs font-medium hover:bg-accent transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(project.id)}
                      className="flex items-center justify-center gap-1.5 border border-red-200 text-red-500 rounded-lg py-1.5 px-3 text-xs font-medium hover:bg-red-50 transition-colors"
                    >
                      <Icon name="TrashIcon" className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
