'use client';

import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function PrivacyPage() {
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
          <h1 className="text-5xl md:text-7xl font-serif tracking-tight">Privacy Policy</h1>
          
          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p className="text-lg">
              Last updated: February 4, 2026
            </p>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">1. Information We Collect</h2>
              <p>
                We collect information you provide directly to us when you book services, contact us, or interact with our website. This may include your name, email address, phone number, and any other information you choose to provide.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">2. How We Use Your Information</h2>
              <p>
                We use the information we collect to provide, maintain, and improve our services, to process your bookings, to communicate with you, and to comply with legal obligations.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">3. Information Sharing</h2>
              <p>
                We do not share your personal information with third parties except as necessary to provide our services, comply with the law, or protect our rights.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">4. Data Security</h2>
              <p>
                We take reasonable measures to protect your personal information from unauthorized access, use, or disclosure. However, no internet transmission is completely secure.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">5. Your Rights</h2>
              <p>
                You have the right to access, correct, or delete your personal information. To exercise these rights, please contact us using the information provided on our contact page.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">6. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us through our contact page.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}