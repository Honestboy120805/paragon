'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface FormData {
  service: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  termsAccepted: boolean;
}

interface FieldErrors {
  service?: string;
  date?: string;
  time?: string;
  name?: string;
  email?: string;
  phone?: string;
  termsAccepted?: string;
}

export default function BookingForm() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    service: '',
    date: '',
    time: '',
    name: '',
    email: '',
    phone: '',
    message: '',
    termsAccepted: false,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const services = [
    { id: 'booking_music', value: 'Music', label: 'Music Show' },
    { id: 'booking_animation', value: 'Animation', label: 'Animation Project' },
    { id: 'booking_comedy', value: 'Comedy', label: 'Comedy Show' },
    { id: 'booking_coaching', value: 'Coaching', label: 'Comedy Coaching' },
  ];

  const timeSlots = [
    { id: 'time_morning', value: '09:00-12:00', label: 'Morning' },
    { id: 'time_afternoon', value: '12:00-17:00', label: 'Afternoon' },
    { id: 'time_evening', value: '17:00-21:00', label: 'Evening' },
    { id: 'time_night', value: '21:00-00:00', label: 'Night' },
  ];

  useEffect(() => {
    if (isHydrated && formData.service) {
      const selectedService = services.find((s) => s.value === formData.service);
    }
  }, [formData.service, isHydrated]);

  const validateField = (name: string, value: any): string | undefined => {
    switch (name) {
      case 'service':
        return !value ? 'Please select a service' : undefined;
      case 'date':
        if (!value) return 'Please select a date';
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate < today ? 'Date cannot be in the past' : undefined;
      case 'time':
        return !value ? 'Please select a time slot' : undefined;
      case 'name':
        if (!value) return 'Name is required';
        return value.length < 2 ? 'Name must be at least 2 characters' : undefined;
      case 'email':
        if (!value) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? 'Please enter a valid email address' : undefined;
      case 'phone':
        if (!value) return 'Phone number is required';
        const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
        return !phoneRegex.test(value.replace(/\s/g, '')) ? 'Please enter a valid phone number' : undefined;
      case 'termsAccepted':
        return !value ? 'You must accept the terms and conditions' : undefined;
      default:
        return undefined;
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Validate on change if field was touched
    if (touched[name]) {
      const error = validateField(name, newValue);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name as keyof FormData]);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const supabase = (await import('@/lib/supabase/client')).createClient();

      // Use SECURITY DEFINER RPC function to bypass RLS for anonymous booking submissions
      const { data: bookingId, error } = await supabase.rpc('submit_booking', {
        p_name: formData.name,
        p_email: formData.email,
        p_phone: formData.phone,
        p_service_type: formData.service,
        p_event_date: formData.date,
        p_event_location: formData.time ? `Time: ${formData.time}` : 'TBD',
        p_message: formData.message || null,
      });

      if (error) throw error;

      // Send admin notification email
      try {
        await fetch('/api/notify-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'admin_new_booking',
            booking: {
              id: bookingId,
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              service_type: services.find((s) => s.value === formData.service)?.label || formData.service,
              event_date: formData.date,
              event_location: formData.time
                ? timeSlots.find((t) => t.value === formData.time)?.label || formData.time
                : 'TBD',
              message: formData.message,
            },
          }),
        });
      } catch (adminEmailError) {
        console.error('Admin notification email error:', adminEmailError);
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      service: '',
      date: '',
      time: '',
      name: '',
      email: '',
      phone: '',
      message: '',
      termsAccepted: false,
    });
    setErrors({});
    setTouched({});
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <div className="bg-success text-success-foreground rounded-[60px] p-12 md:p-20 text-center space-y-8 animate-fade-in">
        <div className="w-20 h-20 bg-success-foreground rounded-full flex items-center justify-center mx-auto animate-scale-in">
          <Icon name="CheckCircleIcon" size={48} variant="solid" className="text-success" />
        </div>
        <h2 className="text-4xl md:text-6xl font-serif tracking-tight">Booking Received!</h2>
        <p className="text-lg max-w-2xl mx-auto">
          Thank you for your booking request. I'll review the details and get back to you within 24
          hours to confirm availability and finalize arrangements.
        </p>
        <button
          onClick={resetForm}
          className="bg-success-foreground text-success px-10 py-4 rounded-full font-bold text-sm hover:scale-105 transition-transform"
        >
          Book Another Service
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-[60px] p-12 md:p-20 shadow-sm border border-border space-y-12">
      {/* Service Selection */}
      <div className="space-y-4">
        <label className="block text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Select Service *
        </label>
        <select
          name="service"
          value={formData.service}
          onChange={handleChange}
          onBlur={() => handleBlur('service')}
          className={`w-full px-6 py-4 rounded-2xl border bg-input text-foreground font-medium focus:outline-none focus:ring-2 transition-all ${
            errors.service && touched.service
              ? 'border-red-500 focus:ring-red-500' :'border-border focus:ring-accent'
          }`}
        >
          <option value="">Choose a service...</option>
          {services.map((service) => (
            <option key={service.id} value={service.value}>
              {service.label}
            </option>
          ))}
        </select>
        {errors.service && touched.service && (
          <p className="text-red-500 text-sm flex items-center gap-2">
            <Icon name="ExclamationCircleIcon" size={16} variant="solid" />
            {errors.service}
          </p>
        )}
      </div>

      {/* Date & Time */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="block text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Preferred Date *
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            onBlur={() => handleBlur('date')}
            className={`w-full px-6 py-4 rounded-2xl border bg-input text-foreground font-medium focus:outline-none focus:ring-2 transition-all ${
              errors.date && touched.date
                ? 'border-red-500 focus:ring-red-500' :'border-border focus:ring-accent'
            }`}
          />
          {errors.date && touched.date && (
            <p className="text-red-500 text-sm flex items-center gap-2">
              <Icon name="ExclamationCircleIcon" size={16} variant="solid" />
              {errors.date}
            </p>
          )}
        </div>
        <div className="space-y-4">
          <label className="block text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Preferred Time *
          </label>
          <select
            name="time"
            value={formData.time}
            onChange={handleChange}
            onBlur={() => handleBlur('time')}
            className={`w-full px-6 py-4 rounded-2xl border bg-input text-foreground font-medium focus:outline-none focus:ring-2 transition-all ${
              errors.time && touched.time
                ? 'border-red-500 focus:ring-red-500' :'border-border focus:ring-accent'
            }`}
          >
            <option value="">Choose time slot...</option>
            {timeSlots.map((slot) => (
              <option key={slot.id} value={slot.value}>
                {slot.label}
              </option>
            ))}
          </select>
          {errors.time && touched.time && (
            <p className="text-red-500 text-sm flex items-center gap-2">
              <Icon name="ExclamationCircleIcon" size={16} variant="solid" />
              {errors.time}
            </p>
          )}
        </div>
      </div>

      {/* Client Details */}
      <div className="space-y-8">
        <div className="space-y-4">
          <label className="block text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={() => handleBlur('name')}
            placeholder="John Doe"
            className={`w-full px-6 py-4 rounded-2xl border bg-input text-foreground font-medium focus:outline-none focus:ring-2 transition-all ${
              errors.name && touched.name
                ? 'border-red-500 focus:ring-red-500' :'border-border focus:ring-accent'
            }`}
          />
          {errors.name && touched.name && (
            <p className="text-red-500 text-sm flex items-center gap-2">
              <Icon name="ExclamationCircleIcon" size={16} variant="solid" />
              {errors.name}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="block text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => handleBlur('email')}
              placeholder="john@example.com"
              className={`w-full px-6 py-4 rounded-2xl border bg-input text-foreground font-medium focus:outline-none focus:ring-2 transition-all ${
                errors.email && touched.email
                  ? 'border-red-500 focus:ring-red-500' :'border-border focus:ring-accent'
              }`}
            />
            {errors.email && touched.email && (
              <p className="text-red-500 text-sm flex items-center gap-2">
                <Icon name="ExclamationCircleIcon" size={16} variant="solid" />
                {errors.email}
              </p>
            )}
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={() => handleBlur('phone')}
              placeholder="+1 (641) 954-2429"
              className={`w-full px-6 py-4 rounded-2xl border bg-input text-foreground font-medium focus:outline-none focus:ring-2 transition-all ${
                errors.phone && touched.phone
                  ? 'border-red-500 focus:ring-red-500' :'border-border focus:ring-accent'
              }`}
            />
            {errors.phone && touched.phone && (
              <p className="text-red-500 text-sm flex items-center gap-2">
                <Icon name="ExclamationCircleIcon" size={16} variant="solid" />
                {errors.phone}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Additional Details
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={6}
            placeholder="Tell me about your event, special requirements, or any questions you have..."
            className="w-full px-6 py-4 rounded-2xl border border-border bg-input text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-accent transition-all resize-none"
          />
        </div>
      </div>

      {/* Terms */}
      <div className="space-y-2">
        <div className="flex items-start gap-4">
          <input
            type="checkbox"
            name="termsAccepted"
            checked={formData.termsAccepted}
            onChange={handleChange}
            onBlur={() => handleBlur('termsAccepted')}
            className={`mt-1 w-5 h-5 rounded border text-accent focus:ring-accent ${
              errors.termsAccepted && touched.termsAccepted ? 'border-red-500' : 'border-border'
            }`}
          />
          <label className="text-sm text-muted-foreground">
            I agree to the terms and conditions and understand that this is a booking request subject
            to availability confirmation.
          </label>
        </div>
        {errors.termsAccepted && touched.termsAccepted && (
          <p className="text-red-500 text-sm flex items-center gap-2 ml-9">
            <Icon name="ExclamationCircleIcon" size={16} variant="solid" />
            {errors.termsAccepted}
          </p>
        )}
      </div>

      {/* Submit Button */}
      {submitError && (
        <p className="text-red-500 text-sm flex items-center gap-2 mb-3">
          <Icon name="ExclamationCircleIcon" size={16} variant="solid" />
          {submitError}
        </p>
      )}
      <button
        type="submit"
        disabled={isSubmitting || !formData.termsAccepted}
        className="w-full bg-primary text-primary-foreground px-10 py-5 rounded-full font-bold text-lg hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-foreground"></div>
            <span>Submitting Booking...</span>
          </>
        ) : (
          <>
            <Icon name="CalendarIcon" size={24} />
            <span>Submit Booking Request</span>
          </>
        )}
      </button>
    </form>
  );
}