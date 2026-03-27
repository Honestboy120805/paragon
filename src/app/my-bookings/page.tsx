'use client';

import { useState, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  service_type: string;
  event_date: string;
  event_location: string;
  message: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  cancellation_reason?: string;
  created_at: string;
}

interface TestimonialForm {
  bookingId: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  photoUrl: string;
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

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [newDate, setNewDate] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [testimonialForm, setTestimonialForm] = useState<TestimonialForm>({
    bookingId: '',
    name: '',
    role: '',
    quote: '',
    rating: 5,
    photoUrl: '',
  });
  const [testimonialSubmitted, setTestimonialSubmitted] = useState(false);
  const [submittingTestimonial, setSubmittingTestimonial] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Photo upload state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  const addToast = useCallback((type: ToastMessage['type'], message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const fetchBookings = async (userEmail: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_bookings_by_email', {
        p_email: userEmail,
      });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setEmailSubmitted(true);
      fetchBookings(email);
    }
  };

  const handleReschedule = (booking: Booking) => {
    setSelectedBooking(booking);
    setNewDate(booking.event_date);
    setShowRescheduleModal(true);
  };

  const handleRescheduleSubmit = async () => {
    if (!selectedBooking || !newDate) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ event_date: newDate })
        .eq('id', selectedBooking.id);

      if (error) throw error;

      addToast('success', 'Booking rescheduled successfully!');
      setShowRescheduleModal(false);
      setSelectedBooking(null);
      setNewDate('');
      fetchBookings(email);
    } catch (error) {
      console.error('Error rescheduling booking:', error);
      addToast('error', 'Failed to reschedule booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = (booking: Booking) => {
    setSelectedBooking(booking);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const handleCancelSubmit = async () => {
    if (!selectedBooking) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          cancellation_reason: cancelReason || 'No reason provided'
        })
        .eq('id', selectedBooking.id);

      if (error) throw error;

      addToast('success', 'Booking cancelled successfully.');
      setShowCancelModal(false);
      setSelectedBooking(null);
      setCancelReason('');
      fetchBookings(email);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      addToast('error', 'Failed to cancel booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadConfirmation = (booking: Booking) => {
    const confirmationText = `
BOOKING CONFIRMATION

Booking ID: ${booking.id}
Name: ${booking.name}
Email: ${booking.email}
Phone: ${booking.phone}
Service: ${booking.service_type}
Event Date: ${new Date(booking.event_date).toLocaleDateString()}
Location: ${booking.event_location}
Status: ${booking.status.toUpperCase()}

Message: ${booking.message || 'N/A'}

Booked on: ${new Date(booking.created_at).toLocaleString()}
    `;

    const blob = new Blob([confirmationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking-confirmation-${booking.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenTestimonialForm = (booking: Booking) => {
    setTestimonialForm({
      bookingId: booking.id,
      name: booking.name,
      role: '',
      quote: '',
      rating: 5,
      photoUrl: '',
    });
    setPhotoFile(null);
    setPhotoPreview('');
    setTestimonialSubmitted(false);
    setShowTestimonialForm(true);
  };

  const handlePhotoFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      addToast('warning', 'Please select an image file (JPG, PNG, GIF, or WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast('warning', 'Image must be smaller than 5MB.');
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, [addToast]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handlePhotoFileSelect(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handlePhotoFileSelect(file);
  };

  const uploadPhotoToStorage = async (): Promise<string> => {
    if (!photoFile) return '';
    setUploadingPhoto(true);
    try {
      const fileExt = photoFile.name.split('.').pop();
      const fileName = `testimonial-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('testimonial-photos')
        .upload(fileName, photoFile, { cacheControl: '3600', upsert: false });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('testimonial-photos')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw new Error('Failed to upload photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingTestimonial(true);
    try {
      let photoUrl = '';
      if (photoFile) {
        photoUrl = await uploadPhotoToStorage();
      }

      const { error } = await supabase.from('testimonials').insert([{
        name: testimonialForm.name,
        role: testimonialForm.role || 'Client',
        quote: testimonialForm.quote,
        rating: testimonialForm.rating,
        photo: photoUrl || null,
        booking_id: testimonialForm.bookingId,
        is_approved: false,
      }]);

      if (error) throw error;
      setTestimonialSubmitted(true);
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      addToast('error', 'Failed to submit testimonial. Please try again.');
    } finally {
      setSubmittingTestimonial(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'completed': return 'bg-green-100 text-green-800 border border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border border-red-300';
      default: return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'ClockIcon';
      case 'confirmed': return 'CheckCircleIcon';
      case 'completed': return 'CheckBadgeIcon';
      case 'cancelled': return 'XCircleIcon';
      default: return 'QuestionMarkCircleIcon';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending Review';
      case 'confirmed': return 'Confirmed';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const timelineSteps = [
    { key: 'pending', label: 'Submitted', icon: 'ClockIcon', description: 'Booking received' },
    { key: 'confirmed', label: 'Confirmed', icon: 'CheckCircleIcon', description: 'Booking approved' },
    { key: 'completed', label: 'Completed', icon: 'CheckBadgeIcon', description: 'Service delivered' },
  ];

  const getTimelineStepState = (stepKey: string, bookingStatus: string): 'completed' | 'active' | 'upcoming' => {
    if (bookingStatus === 'cancelled') return 'upcoming';
    const order = ['pending', 'confirmed', 'completed'];
    const stepIdx = order.indexOf(stepKey);
    const statusIdx = order.indexOf(bookingStatus);
    if (stepIdx < statusIdx) return 'completed';
    if (stepIdx === statusIdx) return 'active';
    return 'upcoming';
  };

  if (!emailSubmitted) {
    return (
      <div className="min-h-screen bg-background py-12 sm:py-16 md:py-20 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <Icon name="CalendarDaysIcon" className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-primary mx-auto mb-3 sm:mb-4" />
            <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-3 sm:mb-4">My Bookings</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Enter your email to view your booking status</p>
          </div>

          <form onSubmit={handleEmailSubmit} className="bg-white rounded-lg shadow-md p-5 sm:p-6 space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-bold hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
            >
              <Icon name="MagnifyingGlassIcon" className="w-4 h-4 sm:w-5 sm:h-5" />
              View My Bookings
            </button>
          </form>

          <div className="mt-5 sm:mt-6 text-center">
            <Link href="/booking" className="text-sm sm:text-base text-primary hover:underline flex items-center justify-center gap-2">
              <Icon name="PlusCircleIcon" className="w-4 h-4 sm:w-5 sm:h-5" />
              Make a New Booking
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm sm:text-base text-muted-foreground">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  const completedBookings = bookings.filter(b => b.status === 'completed');

  return (
    <div className="min-h-screen bg-background py-12 sm:py-16 md:py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-2">My Bookings</h1>
            <p className="text-sm sm:text-base text-muted-foreground">{email}</p>
          </div>
          <button
            onClick={() => setEmailSubmitted(false)}
            className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-2"
          >
            <Icon name="ArrowLeftIcon" className="w-4 h-4 sm:w-5 sm:h-5" />
            Change Email
          </button>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 sm:p-10 md:p-12 text-center">
            <Icon name="CalendarIcon" className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold mb-2">No Bookings Found</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">You don't have any bookings yet.</p>
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold hover:scale-[1.02] transition-transform"
            >
              <Icon name="PlusCircleIcon" className="w-5 h-5" />
              Make a Booking
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Card Header with status badge */}
                <div className={`px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                  booking.status === 'pending' ? 'bg-yellow-50 border-b border-yellow-200' :
                  booking.status === 'confirmed' ? 'bg-blue-50 border-b border-blue-200' :
                  booking.status === 'completed'? 'bg-green-50 border-b border-green-200' : 'bg-red-50 border-b border-red-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <Icon name={getStatusIcon(booking.status)} className={`w-6 h-6 ${
                      booking.status === 'pending' ? 'text-yellow-600' :
                      booking.status === 'confirmed' ? 'text-blue-600' :
                      booking.status === 'completed'? 'text-green-600' : 'text-red-600'
                    }`} />
                    <div>
                      <h3 className="text-lg font-bold">{booking.service_type}</h3>
                      <p className="text-xs text-muted-foreground">ID: {booking.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold capitalize ${getStatusColor(booking.status)}`}>
                    <Icon name={getStatusIcon(booking.status)} className="w-4 h-4" />
                    {getStatusLabel(booking.status)}
                  </span>
                </div>

                <div className="p-6">
                  {/* Status Timeline */}
                  {booking.status !== 'cancelled' && (
                    <div className="mb-6">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Booking Progress</p>
                      <div className="flex items-start gap-0">
                        {timelineSteps.map((step, idx) => {
                          const state = getTimelineStepState(step.key, booking.status);
                          return (
                            <div key={step.key} className="flex-1 flex flex-col items-center relative">
                              {/* Connector line */}
                              {idx < timelineSteps.length - 1 && (
                                <div className={`absolute top-4 left-1/2 w-full h-0.5 ${
                                  state === 'completed' ? 'bg-green-400' : 'bg-gray-200'
                                }`} style={{ left: '50%' }} />
                              )}
                              {/* Step circle */}
                              <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                                state === 'completed'
                                  ? 'bg-green-500 border-green-500 text-white'
                                  : state === 'active'
                                  ? booking.status === 'pending' ? 'bg-yellow-500 border-yellow-500 text-white'
                                    : booking.status === 'confirmed'? 'bg-blue-500 border-blue-500 text-white' :'bg-green-500 border-green-500 text-white' :'bg-white border-gray-300 text-gray-400'
                              }`}>
                                {state === 'completed' ? (
                                  <Icon name="CheckIcon" className="w-4 h-4" />
                                ) : (
                                  <Icon name={step.icon} className="w-4 h-4" />
                                )}
                              </div>
                              {/* Step label */}
                              <div className="mt-2 text-center px-1">
                                <p className={`text-xs font-semibold ${
                                  state === 'upcoming' ? 'text-gray-400' : 'text-foreground'
                                }`}>{step.label}</p>
                                <p className={`text-xs mt-0.5 hidden sm:block ${
                                  state === 'upcoming' ? 'text-gray-300' : 'text-muted-foreground'
                                }`}>{step.description}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Cancelled notice */}
                  {booking.status === 'cancelled' && (
                    <div className="mb-5 flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <Icon name="XCircleIcon" className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-700">This booking has been cancelled</p>
                        {booking.cancellation_reason && (
                          <p className="text-sm text-red-600 mt-0.5">Reason: {booking.cancellation_reason}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Booking details grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                    <div className="flex items-center gap-2">
                      <Icon name="UserIcon" className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{booking.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="PhoneIcon" className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{booking.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="CalendarIcon" className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{new Date(booking.event_date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="MapPinIcon" className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{booking.event_location}</span>
                    </div>
                  </div>

                  {booking.message && (
                    <div className="mb-5 p-3 bg-accent/10 rounded-lg">
                      <p className="text-sm break-words whitespace-pre-wrap max-h-28 overflow-y-auto">{booking.message}</p>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                      <>
                        <button
                          onClick={() => handleReschedule(booking)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm font-medium"
                        >
                          <Icon name="CalendarIcon" className="w-4 h-4" />
                          Reschedule
                        </button>
                        <button
                          onClick={() => handleCancel(booking)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 text-sm font-medium"
                        >
                          <Icon name="XMarkIcon" className="w-4 h-4" />
                          Cancel Booking
                        </button>
                      </>
                    )}
                    {booking.status === 'completed' && (
                      <button
                        onClick={() => handleOpenTestimonialForm(booking)}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2 text-sm font-medium"
                      >
                        <Icon name="StarIcon" className="w-4 h-4" />
                        Leave Review
                      </button>
                    )}
                    <button
                      onClick={() => downloadConfirmation(booking)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 text-sm font-medium"
                    >
                      <Icon name="ArrowDownTrayIcon" className="w-4 h-4" />
                      Download
                    </button>
                  </div>

                  <div className="text-xs text-muted-foreground mt-3">
                    Booked on {new Date(booking.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Testimonial Section */}
        {completedBookings.length > 0 && (
          <div className="mt-10 bg-white rounded-lg shadow-md p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-2">
              <Icon name="StarIcon" className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-serif font-bold">Share Your Experience</h2>
            </div>
            <p className="text-muted-foreground mb-6 text-sm">
              You have completed bookings! We'd love to hear about your experience. Your testimonial will be reviewed and displayed on our homepage.
            </p>

            {!showTestimonialForm ? (
              <button
                onClick={() => handleOpenTestimonialForm(completedBookings[0])}
                className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium flex items-center gap-2"
              >
                <Icon name="PencilSquareIcon" className="w-5 h-5" />
                Write a Testimonial
              </button>
            ) : testimonialSubmitted ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <Icon name="CheckCircleIcon" className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-green-800 mb-2">Thank You!</h3>
                <p className="text-green-700 text-sm">Your testimonial has been submitted and is pending review. It will appear on our homepage once approved.</p>
                <button
                  onClick={() => { setShowTestimonialForm(false); setTestimonialSubmitted(false); }}
                  className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                >
                  Write Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleTestimonialSubmit} className="space-y-5">
                {completedBookings.length > 1 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Booking</label>
                    <select
                      value={testimonialForm.bookingId}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, bookingId: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select a booking...</option>
                      {completedBookings.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.service_type} - {new Date(b.event_date).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Profile Photo Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Profile Photo <span className="text-muted-foreground font-normal">(Optional)</span>
                  </label>
                  <div className="flex items-start gap-4">
                    {/* Preview */}
                    <div className="flex-shrink-0">
                      {photoPreview ? (
                        <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-primary shadow-md">
                          <AppImage
                            src={photoPreview}
                            alt="Profile photo preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => { setPhotoFile(null); setPhotoPreview(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-full"
                            aria-label="Remove photo"
                          >
                            <Icon name="XMarkIcon" className="w-5 h-5 text-white" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center">
                          <Icon name="UserCircleIcon" className="w-10 h-10 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Drop Zone */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex-1 border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all text-center ${
                        isDragOver
                          ? 'border-primary bg-primary/5 scale-[1.01]'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }`}
                    >
                      <Icon name="PhotoIcon" className="w-7 h-7 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground">
                        {isDragOver ? 'Drop your photo here' : 'Drag & drop or click to upload'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG, GIF, WebP · Max 5MB</p>
                      {photoFile && (
                        <p className="text-xs text-primary mt-2 font-medium truncate">{photoFile.name}</p>
                      )}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={testimonialForm.name}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Role / Title</label>
                    <input
                      type="text"
                      value={testimonialForm.role}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, role: e.target.value })}
                      placeholder="e.g. Event Coordinator, Business Owner"
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Rating *</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setTestimonialForm({ ...testimonialForm, rating: star })}
                        className={`text-2xl transition-transform hover:scale-110 ${
                          star <= testimonialForm.rating ? 'text-yellow-500' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Your Testimonial *</label>
                  <textarea
                    required
                    value={testimonialForm.quote}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, quote: e.target.value })}
                    rows={4}
                    placeholder="Share your experience working with Mbi Roy..."
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submittingTestimonial || uploadingPhoto}
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                  >
                    {submittingTestimonial || uploadingPhoto ? (
                      <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> {uploadingPhoto ? 'Uploading photo...' : 'Submitting...'}</>
                    ) : (
                      <><Icon name="PaperAirplaneIcon" className="w-4 h-4" /> Submit Testimonial</>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTestimonialForm(false)}
                    className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Reschedule Booking</h3>
            <p className="text-muted-foreground mb-4">Select a new date for your booking</p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-muted-foreground mb-2">New Event Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRescheduleModal(false)}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRescheduleSubmit}
                disabled={isSubmitting || !newDate}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Rescheduling...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-red-600">Cancel Booking</h3>
            <p className="text-muted-foreground mb-4">Are you sure you want to cancel this booking? This action cannot be undone.</p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-muted-foreground mb-2">Reason for Cancellation (Optional)</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
                placeholder="Please let us know why you're cancelling..."
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelSubmit}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}