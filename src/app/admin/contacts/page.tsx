'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
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

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [popupContact, setPopupContact] = useState<ContactSubmission | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const searchParams = useSearchParams();

  const supabase = createClient();

  const addToast = useCallback((type: ToastMessage['type'], message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const fetchContacts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  useEffect(() => {
    const idParam = searchParams.get('id');
    if (!idParam) return;
    // Wait for contacts to load if not yet available
    if (contacts.length === 0) return;
    const match = contacts.find((c) => c.id === idParam);
    if (match) {
      // Always close then reopen so animation triggers on every click,
      // including repeated clicks on the same contact.
      setPopupContact(null);
      setTimeout(() => setPopupContact(match), 50);
    }
  }, [searchParams, contacts]);

  const openDeleteConfirm = (id: string) => {
    setDeleteTargetId(id);
    setShowDeleteConfirm(true);
  };

  const deleteContact = async () => {
    if (!deleteTargetId) return;
    try {
      const { error } = await supabase.from('contact_submissions').delete().eq('id', deleteTargetId);
      if (error) throw error;
      if (popupContact?.id === deleteTargetId) setPopupContact(null);
      setSelectedIds((prev) => { const n = new Set(prev); n.delete(deleteTargetId); return n; });
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
      addToast('success', 'Message deleted successfully');
      fetchContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      addToast('error', 'Failed to delete message');
    }
  };

  const bulkDelete = async () => {
    try {
      const ids = Array.from(selectedIds);
      const { error } = await supabase.from('contact_submissions').delete().in('id', ids);
      if (error) throw error;
      if (popupContact && selectedIds.has(popupContact.id)) setPopupContact(null);
      setSelectedIds(new Set());
      setShowBulkDeleteConfirm(false);
      addToast('success', `${ids.length} message${ids.length > 1 ? 's' : ''} deleted`);
      fetchContacts();
    } catch (error) {
      console.error('Error bulk deleting:', error);
      addToast('error', 'Failed to delete messages');
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
    if (selectedIds.size === filteredContacts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredContacts.map((c) => c.id)));
    }
  };

  const filteredContacts = contacts.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.subject.toLowerCase().includes(q)
    );
  });

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

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
          <h1 className="text-4xl font-serif font-bold">Contact Messages</h1>
          <p className="text-muted-foreground mt-2">{contacts.length} message{contacts.length !== 1 ? 's' : ''} received</p>
        </div>
        <button
          onClick={fetchContacts}
          className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-2 text-sm"
        >
          <Icon name="ArrowPathIcon" className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Icon name="MagnifyingGlassIcon" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name, email, or subject..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 bg-primary/10 border border-primary/30 rounded-lg px-4 py-3 animate-[fadeIn_0.2s_ease-out]">
          <span className="text-sm font-medium text-primary">{selectedIds.size} selected</span>
          <button
            onClick={() => setShowBulkDeleteConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
          >
            <Icon name="TrashIcon" className="w-4 h-4" />
            Delete Selected
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors ml-auto"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Select All Row */}
      {filteredContacts.length > 0 && (
        <div className="flex items-center gap-2 px-1">
          <input
            type="checkbox"
            checked={selectedIds.size === filteredContacts.length && filteredContacts.length > 0}
            onChange={toggleSelectAll}
            className="w-4 h-4 rounded border-gray-300 text-primary cursor-pointer"
          />
          <span className="text-sm text-muted-foreground">Select all</span>
        </div>
      )}

      {/* Contact List */}
      <div className="space-y-3">
        {filteredContacts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Icon name="EnvelopeIcon" className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No contact messages found</p>
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className={`bg-white rounded-lg shadow-md p-4 border-2 transition-all ${
                selectedIds.has(contact.id) ? 'border-primary' : 'border-transparent'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.has(contact.id)}
                  onChange={() => toggleSelect(contact.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-4 h-4 mt-1 rounded border-gray-300 text-primary cursor-pointer flex-shrink-0"
                />
                <div
                  className="flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setPopupContact(contact)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold truncate">{contact.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{contact.email}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {formatDate(contact.created_at)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-primary truncate">{contact.subject}</p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{contact.message}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); openDeleteConfirm(contact.id); }}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                >
                  <Icon name="TrashIcon" className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Detail Popup */}
      {popupContact && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setPopupContact(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-[slideUp_0.3s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="text-xl font-bold">Message Details</h2>
              <button
                onClick={() => setPopupContact(null)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <Icon name="XMarkIcon" className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">From</p>
                  <p className="font-semibold">{popupContact.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Date</p>
                  <p className="font-semibold text-sm">{formatDate(popupContact.created_at)}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Email</p>
                <a href={`mailto:${popupContact.email}`} className="text-primary hover:underline font-medium">
                  {popupContact.email}
                </a>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Subject</p>
                <p className="font-semibold">{popupContact.subject}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Message</p>
                <div className="bg-accent/10 rounded-lg p-4">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{popupContact.message}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-border">
              <button
                onClick={() => setPopupContact(null)}
                className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg hover:bg-muted transition-colors text-sm font-medium"
              >
                <Icon name="ArrowLeftIcon" className="w-4 h-4" />
                Return
              </button>
              <a
                href={`mailto:${popupContact.email}?subject=Re: ${encodeURIComponent(popupContact.subject)}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
              >
                <Icon name="EnvelopeIcon" className="w-4 h-4" />
                Reply via Email
              </a>
              <button
                onClick={() => openDeleteConfirm(popupContact.id)}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
              >
                <Icon name="TrashIcon" className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Popup */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-[slideUp_0.3s_ease-out]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name="ExclamationTriangleIcon" className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold">Delete Message</h3>
            </div>
            <p className="text-muted-foreground mb-6">Are you sure you want to delete this message? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteTargetId(null); }}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={deleteContact}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirm Popup */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-[slideUp_0.3s_ease-out]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name="ExclamationTriangleIcon" className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold">Delete {selectedIds.size} Messages</h3>
            </div>
            <p className="text-muted-foreground mb-6">Are you sure you want to delete {selectedIds.size} selected message{selectedIds.size > 1 ? 's' : ''}? This action cannot be undone.</p>
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
