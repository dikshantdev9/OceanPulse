import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2Icon, LoaderCircleIcon, MailIcon } from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [state, setState] = useState<'idle' | 'loading' | 'sent'>('idle');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Enter the work email linked to your account.');
      return;
    }
    setError(undefined);
    setState('loading');
    window.setTimeout(() => setState('sent'), 900);
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We'll email a single-use reset link to the address linked to your organisation."
      footer={
      <>
          Remembered it?{' '}
          <Link to="/login" className="font-semibold text-tide-500 hover:text-tide-400">
            Back to sign in
          </Link>
        </>
      }>
      
      {state === 'sent' ?
      <div className="rounded-2xl border border-signal-low/25 bg-signal-low/[0.07] p-6 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-signal-low/15 text-signal-low">
            <CheckCircle2Icon className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-sm font-semibold text-ink-100">Reset link sent</h2>
          <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-ink-400">
            Check <span className="font-mono text-ink-200">{email}</span> for a link valid for 30
            minutes. Contact your administrator if it doesn't arrive.
          </p>
          <ButtonLink to="/login" variant="secondary" size="sm" className="mt-5">
            Return to sign in
          </ButtonLink>
        </div> :

      <form onSubmit={submit} className="space-y-5" noValidate>
          <Input
          label="Work email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
          icon={<MailIcon className="h-4 w-4" />}
          placeholder="you@agency.gov" />
        
          <Button type="submit" size="lg" className="w-full" disabled={state === 'loading'}>
            {state === 'loading' ?
          <>
                <LoaderCircleIcon className="h-4 w-4 animate-spin" />
                Sending link…
              </> :

          'Send reset link'
          }
          </Button>
        </form>
      }
    </AuthLayout>);

}