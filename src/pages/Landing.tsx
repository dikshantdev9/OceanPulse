import React from 'react';
import { ArrowRightIcon } from 'lucide-react';
import { Hero } from '../components/landing/Hero';
import { HowItWorks } from '../components/landing/HowItWorks';
import { Impact } from '../components/landing/Impact';
import { LandingNav } from '../components/landing/LandingNav';
import { SiteFooter } from '../components/landing/SiteFooter';
import { TechStack } from '../components/landing/TechStack';
import { PipelineFlow } from '../components/PipelineFlow';
import { ButtonLink } from '../components/ui/Button';

export function Landing() {
  return (
    <div className="ocean-field min-h-screen w-full bg-abyss-950">
      <LandingNav />
      <main>
        <Hero />
        <HowItWorks />

        <section className="border-b border-white/[0.06] py-20 sm:py-24">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-tide-500">
                  Processing pipeline
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-[38px]">
                  What happens between a satellite pass and an alert
                </h2>
                <p className="mt-4 text-base leading-relaxed text-ink-400">
                  Seven stages run automatically per scene. The highlight below follows a live scene
                  through the pipeline.
                </p>
              </div>
              <ButtonLink to="/app/detection" variant="secondary">
                Open detection console
                <ArrowRightIcon className="h-4 w-4" />
              </ButtonLink>
            </div>
            <div className="mt-10 rounded-3xl border border-white/[0.07] bg-abyss-900/50 p-5">
              <PipelineFlow />
            </div>
          </div>
        </section>

        <TechStack />
        <Impact />

        <section className="py-20 sm:py-24">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <div className="relative overflow-hidden rounded-3xl border border-tide-500/20 bg-abyss-900/70 px-6 py-12 text-center sm:px-12">
              <div className="grid-field absolute inset-0 opacity-30" aria-hidden="true" />
              <div className="relative">
                <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-[38px]">
                  Detect. Track. Protect the ocean.
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-base text-ink-300">
                  Step into the monitoring console with a live demo dataset from the Arabian Sea.
                </p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <ButtonLink to="/app" size="lg">
                    Explore dashboard
                    <ArrowRightIcon className="h-4 w-4" />
                  </ButtonLink>
                  <ButtonLink to="/signup" variant="secondary" size="lg">
                    Create an account
                  </ButtonLink>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>);

}