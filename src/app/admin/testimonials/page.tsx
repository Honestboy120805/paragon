'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  photo: string;
  quote: string;
  rating: number;
  is_approved: boolean;
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

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
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
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_approved: !currentStatus })
        .eq('id', id);
      if (error) throw error;
      addToast('success', currentStatus ? 'Testimonial unapproved' : 'Testimonial approved');
      fetchTestimonials();
    } catch (error) {
      console.error('Error updating testimonial:', error);
      addToast('error', 'Failed to update testimonial');
    }
  };

  const openDeleteConfirm = (id: string) => {
    setDeleteTargetId(id);
    setShowDeleteConfirm(true);
  };

  const deleteTestimonial = async () => {
    if (!deleteTargetId) return;
    try {
      const { error } = await supabase.from('testimonials').delete().eq('id', deleteTargetId);
      if (error) throw error;
      setSelectedIds((prev) => { const n = new Set(prev); n.delete(deleteTargetId); return n; });
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
      addToast('success', 'Testimonial deleted');
      fetchTestimonials();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      addToast('error', 'Failed to delete testimonial');
    }
  };

  const bulkDelete = async () => {
    try {
      const ids = Array.from(selectedIds);
      const { error } = await supabase.from('testimonials').delete().in('id', ids);
      if (error) throw error;
      setSelectedIds(new Set());
      setShowBulkDeleteConfirm(false);
      addToast('success', `${ids.length} testimonial${ids.length > 1 ? 's' : ''} deleted`);
      fetchTestimonials();
    } catch (error) {
      console.error('Error bulk deleting:', error);
      addToast('error', 'Failed to delete testimonials');
    }
  };

  const bulkApprove = async (approve: boolean) => {
    try {
      const ids = Array.from(selectedIds);
      const { error } = await supabase.from('testimonials').update({ is_approved: approve }).in('id', ids);
      if (error) throw error;
      setSelectedIds(new Set());
      addToast('success', `${ids.length} testimonial${ids.length > 1 ? 's' : ''} ${approve ? 'approved' : 'unapproved'}`);
      fetchTestimonials();
    } catch (error) {
      console.error('Error bulk updating:', error);
      addToast('error', 'Failed to update testimonials');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((t) => t.id)));
    }
  };

  const filtered = testimonials.filter(t => {
    if (filter === 'pending') return !t.is_approved;
    if (filter === 'approved') return t.is_approved;
    return true;
  });

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-500' : 'text-gray-300'}>★</span>
    ));

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

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-serif font-bold">Testimonials</h1>
          <p className="text-muted-foreground mt-2">Manage and approve customer testimonials</p>
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === f ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Select All Row */}
      {filtered.length > 0 && (
        <div className="flex items-center gap-2 px-1">
          <input
            type="checkbox"
            checked={selectedIds.size === filtered.length && filtered.length > 0}
            onChange={toggleSelectAll}
            className="w-4 h-4 rounded border-gray-300 text-primary cursor-pointer"
          />
          <span className="text-sm text-muted-foreground">Select all</span>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 bg-primary/10 border border-primary/30 rounded-lg px-4 py-3 animate-[fadeIn_0.2s_ease-out]">
          <span className="text-sm font-medium text-primary">{selectedIds.size} selected</span>
          <button
            onClick={() => bulkApprove(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
          >
            <Icon name="CheckCircleIcon" className="w-4 h-4" />
            Approve
          </button>
          <button
            onClick={() => bulkApprove(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm"
          >
            <Icon name="XCircleIcon" className="w-4 h-4" />
            Unapprove
          </button>
          <button
            onClick={() => setShowBulkDeleteConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
          >
            <Icon name="TrashIcon" className="w-4 h-4" />
            Delete
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors ml-auto"
          >
            Clear
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow-md p-12 text-center">
            <Icon name="StarIcon" className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No testimonials found</p>
          </div>
        ) : (
          filtered.map(t => (
            <div
              key={t.id}
              className={`bg-white rounded-lg shadow-md p-6 border-l-4 transition-all ${
                t.is_approved ? 'border-green-500' : 'border-yellow-500'
              } ${selectedIds.has(t.id) ? 'ring-2 ring-primary/50' : ''}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(t.id)}
                    onChange={() => toggleSelect(t.id)}
                    className="w-4 h-4 rounded border-gray-300 text-primary cursor-pointer flex-shrink-0"
                  />
                  {t.photo ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                      <AppImage src={t.photo} alt={t.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon name="UserIcon" className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                    <div className="flex text-sm">{renderStars(t.rating)}</div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  t.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {t.is_approved ? 'Approved' : 'Pending'}
                </span>
              </div>

              <p className="text-sm text-muted-foreground italic mb-4 line-clamp-3">"{t.quote}"</p>

              <div className="flex gap-2">
                <button
                  onClick={() => toggleApproval(t.id, t.is_approved)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    t.is_approved
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  {t.is_approved ? 'Unapprove' : 'Approve'}
                </button>
                <button
                  onClick={() => openDeleteConfirm(t.id)}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  <Icon name="TrashIcon" className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirm Popup */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-[slideUp_0.3s_ease-out]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name="ExclamationTriangleIcon" className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold">Delete Testimonial</h3>
            </div>
            <p className="text-muted-foreground mb-6">Are you sure you want to delete this testimonial? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteTargetId(null); }}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={deleteTestimonial}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirm */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-[slideUp_0.3s_ease-out]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name="ExclamationTriangleIcon" className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold">Delete {selectedIds.size} Testimonials</h3>
            </div>
            <p className="text-muted-foreground mb-6">Are you sure you want to delete {selectedIds.size} selected testimonial{selectedIds.size > 1 ? 's' : ''}? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={bulkDelete}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
