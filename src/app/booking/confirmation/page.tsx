'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Icon from '@/components/ui/AppIcon';

function BookingConfirmationContent() {
  const searchParams = useSearchParams();

  const confirmationNumber = searchParams.get('ref') || 'N/A';
  const name = searchParams.get('name') || '';
  const email = searchParams.get('email') || '';
  const service = searchParams.get('service') || '';
  const serviceLabel = searchParams.get('serviceLabel') || service;
  const date = searchParams.get('date') || '';
  const timeSlot = searchParams.get('time') || '';
  const price = searchParams.get('price') || '';

  const formattedDate = date
    ? new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const nextSteps = [
    {
      id: 'step_review',
      icon: 'ClipboardDocumentCheckIcon',
      title: 'Review Your Request',
      description: 'Your booking request is being reviewed. Expect a response within 24 hours.',
    },
    {
      id: 'step_confirm',
      icon: 'EnvelopeIcon',
      title: 'Confirmation Email',
      description: `A confirmation will be sent to ${email || 'your email'} once availability is verified.`,
    },
    {
      id: 'step_finalize',
      icon: 'CurrencyDollarIcon',
      title: 'Finalize Details',
      description: 'We\'ll discuss final pricing, logistics, and any special requirements.',
    },
    {
      id: 'step_ready',
      icon: 'StarIcon',
      title: 'Get Ready!',
      description: 'Once confirmed, you\'ll receive all the details needed for your event.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 sm:pt-28 md:pt-32 px-4 pb-20 sm:pb-28 md:pb-32">
        <div className="max-w-3xl mx-auto space-y-10">

          {/* Success Banner */}
          <div className="bg-success text-success-foreground rounded-[40px] p-10 md:p-14 text-center space-y-6">
            <div className="w-20 h-20 bg-success-foreground rounded-full flex items-center justify-center mx-auto">
              <Icon name="CheckCircleIcon" size={48} variant="solid" className="text-success" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-serif tracking-tight">Booking Received!</h1>
              <p className="text-base md:text-lg opacity-90 max-w-xl mx-auto">
                Thank you{name ? `, ${name}` : ''}! Your booking request has been submitted successfully.
                I'll review the details and get back to you within 24 hours.
              </p>
            </div>
            <div className="inline-block bg-success-foreground/20 border border-success-foreground/30 rounded-2xl px-8 py-4">
              <p className="text-xs font-bold uppercase tracking-widest opacity-75 mb-1">Confirmation Number</p>
              <p className="text-2xl font-mono font-bold tracking-wider">{confirmationNumber}</p>
            </div>
          </div>

          {/* Booking Details */}
          <div className="bg-card border border-border rounded-[40px] p-8 md:p-12 space-y-8">
            <h2 className="text-2xl font-serif font-bold">Booking Summary</h2>
            <div className="divide-y divide-border">
              {serviceLabel && (
                <div className="flex items-center justify-between py-4 gap-4">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Icon name="SparklesIcon" size={20} variant="outline" />
                    <span className="text-sm font-bold uppercase tracking-widest">Service</span>
                  </div>
                  <span className="font-semibold text-right">{serviceLabel}</span>
                </div>
              )}
              {formattedDate && (
                <div className="flex items-center justify-between py-4 gap-4">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Icon name="CalendarIcon" size={20} variant="outline" />
                    <span className="text-sm font-bold uppercase tracking-widest">Date</span>
                  </div>
                  <span className="font-semibold text-right">{formattedDate}</span>
                </div>
              )}
              {timeSlot && (
                <div className="flex items-center justify-between py-4 gap-4">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Icon name="ClockIcon" size={20} variant="outline" />
                    <span className="text-sm font-bold uppercase tracking-widest">Time</span>
                  </div>
                  <span className="font-semibold text-right">{timeSlot}</span>
                </div>
              )}
              {price && (
                <div className="flex items-center justify-between py-4 gap-4">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Icon name="CurrencyDollarIcon" size={20} variant="outline" />
                    <span className="text-sm font-bold uppercase tracking-widest">Estimated Price</span>
                  </div>
                  <span className="font-semibold text-right">{price}</span>
                </div>
              )}
              {name && (
                <div className="flex items-center justify-between py-4 gap-4">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Icon name="UserIcon" size={20} variant="outline" />
                    <span className="text-sm font-bold uppercase tracking-widest">Name</span>
                  </div>
                  <span className="font-semibold text-right">{name}</span>
                </div>
              )}
              {email && (
                <div className="flex items-center justify-between py-4 gap-4">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Icon name="EnvelopeIcon" size={20} variant="outline" />
                    <span className="text-sm font-bold uppercase tracking-widest">Email</span>
                  </div>
                  <span className="font-semibold text-right break-all">{email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-card border border-border rounded-[40px] p-8 md:p-12 space-y-8">
            <h2 className="text-2xl font-serif font-bold">What Happens Next?</h2>
            <div className="space-y-6">
              {nextSteps.map((step, index) => (
                <div key={step.id} className="flex items-start gap-5">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center">
                      <Icon name={step.icon} size={22} variant="outline" className="text-primary" />
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary text-primary-foreground rounded-full text-[10px] font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                  </div>
                  <div className="space-y-1 pt-1">
                    <h3 className="font-bold text-base">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/booking"
              className="flex-1 bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold text-sm text-center hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
            >
              <Icon name="CalendarIcon" size={18} variant="solid" />
              Book Another Service
            </Link>
            <Link
              href="/my-bookings"
              className="flex-1 bg-card border border-border text-foreground px-8 py-4 rounded-full font-bold text-sm text-center hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
            >
              <Icon name="ClipboardDocumentListIcon" size={18} variant="outline" />
              View My Bookings
            </Link>
            <Link
              href="/homepage"
              className="flex-1 bg-card border border-border text-foreground px-8 py-4 rounded-full font-bold text-sm text-center hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
            >
              <Icon name="HomeIcon" size={18} variant="outline" />
              Back to Home
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <BookingConfirmationContent />
    </Suspense>
  );
}