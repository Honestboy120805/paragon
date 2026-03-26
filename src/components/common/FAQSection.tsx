'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title?: string;
  subtitle?: string;
}

export default function FAQSection({ title = 'Frequently Asked Questions', subtitle = 'Find answers to common questions about our services' }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const faqs: FAQItem[] = [
    {
      id: 'faq_pricing',
      question: 'How is pricing determined for services?',
      answer: 'Pricing varies based on the service type, event duration, location, and specific requirements. Music shows start from $2,500, comedy shows from $1,800, animation projects from $1,200, and coaching sessions from $200. Contact us for a detailed quote tailored to your needs.'
    },
    {
      id: 'faq_booking_process',
      question: 'What is the booking process?',
      answer: 'Simply fill out our booking form with your event details, preferred date, and service type. We\'ll review your request and respond within 24 hours to confirm availability. Once confirmed, we\'ll send a contract and invoice to secure your booking.'
    },
    {
      id: 'faq_advance_booking',
      question: 'How far in advance should I book?',
      answer: 'We recommend booking at least 4-6 weeks in advance to ensure availability, especially for peak seasons and weekends. However, we can accommodate last-minute bookings based on our schedule.'
    },
    {
      id: 'faq_deposit',
      question: 'Is a deposit required?',
      answer: 'Yes, a 50% deposit is required to secure your booking date. The remaining balance is due 7 days before the event. We accept various payment methods including credit cards, bank transfers, and digital payments.'
    },
    {
      id: 'faq_cancellation',
      question: 'What is your cancellation policy?',
      answer: 'If you cancel more than 30 days before the event, you’ll get a full refund, but we’ll keep 10% as a processing fee, If you cancel between 15 and 29 days before the event, you’ll get back half of what you paid, If you cancel less than 14 days before the event, we can’t offer a refund, but we can help you reschedule if there’s availability. or reserve your money for your next booking'
    },
    {
      id: 'faq_reschedule',
      question: 'Can I reschedule my booking?',
      answer: 'Yes, you can reschedule your booking up to 14 days before the event date, subject to availability. Rescheduling requests made less than 14 days before may incur additional fees. Contact us as soon as possible to discuss rescheduling options.'
    },
    {
      id: 'faq_refunds',
      question: 'How do refunds work?',
      answer: 'Refunds are processed according to our cancellation policy. Approved refunds are returned to the original payment method within 7-10 business days. Processing fees may apply depending on when the cancellation is made.'
    },
    {
      id: 'faq_travel',
      question: 'Do you travel for events?',
      answer: 'Yes, we travel for events! Travel fees may apply for locations outside our local area. These fees cover transportation, accommodation, and travel time. We\'ll provide a detailed quote including all travel costs upfront.'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="max-w-4xl mx-auto px-4 py-12 sm:py-16 md:py-20">
      <div className="text-center mb-10 sm:mb-12 md:mb-16 space-y-4">
        <span className="bg-accent text-primary px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider inline-block">
          FAQ
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif tracking-tight">{title}</h2>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={faq.id}
            className="bg-card rounded-2xl sm:rounded-3xl border border-border overflow-hidden transition-all duration-300 hover:shadow-md"
            style={isHydrated ? { animationDelay: `${index * 0.1}s` } : {}}
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full px-6 sm:px-8 py-5 sm:py-6 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
              aria-expanded={openIndex === index}
            >
              <span className="text-base sm:text-lg font-bold pr-4">{faq.question}</span>
              <Icon
                name="ChevronDownIcon"
                size={20}
                variant="outline"
                className={`flex-shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''} sm:w-6 sm:h-6`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div className="px-6 sm:px-8 pb-5 sm:pb-6 pt-2">
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 sm:mt-12 text-center">
        <p className="text-sm sm:text-base text-muted-foreground mb-4">
          Still have questions?
        </p>
        <a
          href="/contact"
          className="inline-block bg-primary text-primary-foreground px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-xs sm:text-sm hover:scale-105 transition-transform"
        >
          Contact Us
        </a>
      </div>
    </section>
  );
}