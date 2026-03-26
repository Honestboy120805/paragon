'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface FieldErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export default function ContactForm() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (!value) return 'Name is required';
        return value.length < 2 ? 'Name must be at least 2 characters' : undefined;
      case 'email':
        if (!value) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? 'Please enter a valid email address' : undefined;
      case 'subject':
        return !value ? 'Please select a subject' : undefined;
      case 'message':
        if (!value) return 'Message is required';
        return value.length < 10 ? 'Message must be at least 10 characters' : undefined;
      default:
        return undefined;
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate on change if field was touched
    if (touched[name]) {
      const error = validateField(name, value);
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
    
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    setTouched(allTouched);

    // Validate all fields
    const newErrors: FieldErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof FormData]);
      if (error) newErrors[key as keyof FieldErrors] = error;
    });

    setErrors(newErrors);

    // If there are errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const supabase = createClient();
      
      // Insert contact submission via SECURITY DEFINER function to bypass RLS
      const { data: submissionId, error: insertError } = await supabase
        .rpc('submit_contact_form', {
          p_name: formData.name,
          p_email: formData.email,
          p_subject: formData.subject,
          p_message: formData.message,
          p_phone: formData.phone || null,
        });

      if (insertError) throw insertError;

      // Send admin notification email
      try {
        await fetch('/api/notify-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'admin_new_contact', contact: formData }),
        });
      } catch (adminEmailError) {
        console.error('Admin contact notification error:', adminEmailError);
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      alert('Failed to submit contact form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
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
        <h2 className="text-4xl md:text-6xl font-serif tracking-tight">Message Sent!</h2>
        <p className="text-lg max-w-2xl mx-auto">
          Thank you for reaching out. I'll get back to you within 24 hours.
        </p>
        <button
          onClick={resetForm}
          className="bg-success-foreground text-success px-10 py-4 rounded-full font-bold text-sm hover:scale-105 transition-transform"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-[60px] p-12 md:p-20 shadow-sm border border-border space-y-8">
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
          className={`w-full px-3 py-2 sm:px-6 sm:py-4 rounded-2xl border bg-input text-foreground font-medium focus:outline-none focus:ring-2 transition-all ${
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
          placeholder="+1 (555) 000-0000"
          className={`w-full px-3 py-2 sm:px-6 sm:py-4 rounded-2xl border bg-input text-foreground font-medium focus:outline-none focus:ring-2 transition-all ${
            errors.phone && touched.phone
              ? 'border-red-500 focus:ring-red-500' :'border-border focus:ring-accent'
          }`}
        />
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Subject *
        </label>
        <select
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          onBlur={() => handleBlur('subject')}
          className={`w-full px-6 py-4 rounded-2xl border bg-input text-foreground font-medium focus:outline-none focus:ring-2 transition-all ${
            errors.subject && touched.subject
              ? 'border-red-500 focus:ring-red-500' :'border-border focus:ring-accent'
          }`}
        >
          <option value="">Select a subject...</option>
          <option value="booking">Booking Inquiry</option>
          <option value="collaboration">Collaboration</option>
          <option value="general">General Question</option>
          <option value="coaching">Coaching Information</option>
        </select>
        {errors.subject && touched.subject && (
          <p className="text-red-500 text-sm flex items-center gap-2">
            <Icon name="ExclamationCircleIcon" size={16} variant="solid" />
            {errors.subject}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Message *
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          onBlur={() => handleBlur('message')}
          rows={8}
          placeholder="Tell me about your inquiry..."
          className={`w-full px-6 py-4 rounded-2xl border bg-input text-foreground font-medium focus:outline-none focus:ring-2 transition-all resize-none ${
            errors.message && touched.message
              ? 'border-red-500 focus:ring-red-500' :'border-border focus:ring-accent'
          }`}
        />
        {errors.message && touched.message && (
          <p className="text-red-500 text-sm flex items-center gap-2">
            <Icon name="ExclamationCircleIcon" size={16} variant="solid" />
            {errors.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary text-primary-foreground px-10 py-5 rounded-full font-bold text-lg hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-foreground"></div>
            <span>Sending Message...</span>
          </>
        ) : (
          <>
            <Icon name="PaperAirplaneIcon" size={24} />
            <span>Send Message</span>
          </>
        )}
      </button>
    </form>
  );
}