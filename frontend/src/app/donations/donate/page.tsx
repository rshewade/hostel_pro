"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/shadcn/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { ArrowLeft, Heart, IndianRupee } from "lucide-react";
import PublicLayout from "@/components/public/PublicLayout";
import PageHero from "@/components/public/PageHero";

const PRESET_AMOUNTS = [501, 1100, 2100, 5100, 11000];

export default function DonatePage() {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  return (
    <PublicLayout>
      <PageHero
        title={t('Donate Online', 'ऑनलाइन दान करें')}
        subtitle={t(
          'Enter your details and the amount you wish to contribute.',
          'अपना विवरण और वह राशि दर्ज करें जो आप दान करना चाहते हैं।'
        )}
      >
        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
          <Heart className="h-8 w-8 text-accent" />
        </div>
      </PageHero>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            <Card className="bg-card border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="font-heading text-2xl">
                  {t('Donation Details', 'दान विवरण')}
                </CardTitle>
                <CardDescription>
                  {t(
                    'All donations are eligible for tax benefits under Section 80G.',
                    'सभी दान धारा 80जी के तहत कर लाभ के लिए पात्र हैं।'
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <div className="space-y-2">
                    <Label htmlFor="donor-name">{t('Full Name', 'पूरा नाम')}</Label>
                    <Input
                      id="donor-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('Enter your full name', 'अपना पूरा नाम दर्ज करें')}
                      autoComplete="name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="donor-amount">{t('Amount (₹)', 'राशि (₹)')}</Label>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_AMOUNTS.map((preset) => (
                        <Button
                          key={preset}
                          type="button"
                          size="sm"
                          variant={amount === String(preset) ? "default" : "outline"}
                          onClick={() => setAmount(String(preset))}
                        >
                          ₹{preset.toLocaleString('en-IN')}
                        </Button>
                      ))}
                    </div>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="donor-amount"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={t('Enter other amount', 'अन्य राशि दर्ज करें')}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  {/* Payment gateway to be integrated; button intentionally does nothing for now */}
                  <Button type="submit" size="lg" className="w-full gap-2">
                    <Heart className="h-4 w-4" />
                    {t('Proceed to Pay', 'भुगतान के लिए आगे बढ़ें')}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="text-center mt-6">
              <Link
                href="/donations"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('Back to Donations', 'दान पृष्ठ पर वापस जाएं')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
