'use client';

import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/homepage"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-accent transition-colors mb-8"
        >
          <Icon name="ArrowLeftIcon" size={16} variant="outline" />
          Return to Home
        </Link>

        <div className="bg-card rounded-[60px] p-12 md:p-20 shadow-sm border border-border space-y-8">
          <h1 className="text-5xl md:text-7xl font-serif tracking-tight">Terms and Conditions</h1>
          
          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p className="text-lg">
              Last updated: February 4, 2026
            </p>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">1. Acceptance of Terms</h2>
              <p>
                By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use this website.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">2. Booking Services</h2>
              <p>
                All booking requests are subject to availability confirmation. A booking is not confirmed until you receive written confirmation from us. We reserve the right to decline any booking request.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">3. Payment Terms</h2>
              <p>
                Payment terms will be specified in your booking confirmation. A deposit may be required to secure your booking. Full payment is typically due before the service date unless otherwise agreed.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">4. Cancellation Policy</h2>
              <p>
                Cancellations must be made in writing. Cancellation fees may apply depending on the timing of the cancellation and the specific service booked. Please contact us for specific cancellation terms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">5. Intellectual Property</h2>
              <p>
                All content on this website, including text, graphics, logos, and images, is the property of Paragon De Laftadian and is protected by copyright laws. Unauthorized use is prohibited.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">6. Limitation of Liability</h2>
              <p>
                We shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with the use of our services or website.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">7. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the website. Your continued use of the website constitutes acceptance of the modified terms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">8. Contact Information</h2>
              <p>
                For questions about these Terms and Conditions, please contact us through our contact page.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}