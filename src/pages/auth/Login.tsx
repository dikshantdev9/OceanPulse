import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  EyeIcon,
  EyeOffIcon,
  KeyRoundIcon,
  LoaderCircleIcon,
  LockIcon,
  MailIcon,
  SparklesIcon,
} from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { useAuth } from '../../context/AuthContext';
import { DEMO_CREDENTIALS } from '../../services/authService';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isDemoMode, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect immediately
  React.useEffect(() => {
    if (isAuthenticated) {
      const destination = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/app';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleFillDemo = () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setErrors({});
    setGeneralError(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setSuccessMessage(null);

    const next: typeof errors = {};
    if (!email.trim()) {
      next.email = 'Please enter your email.';
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      next.email = 'Please enter a valid email address.';
    }

    if (!password) {
      next.password = 'Please enter your password.';
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);

    try {
      await login(email.trim(), password);
      setSuccessMessage('Login successful');

      const destination = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/app';

      // Brief delay to display the success state smoothly before redirection
      window.setTimeout(() => {
        navigate(destination, { replace: true });
      }, 500);
    } catch (err: unknown) {
      setLoading(false);
      const errObj = err as { message?: string; status?: number };
      if (errObj.status === 401) {
        setGeneralError('Invalid email or password');
      } else {
        setGeneralError(errObj.message || 'Invalid email or password');
      }
    }
  };

  return (
    <AuthLayout
      title="Welcome Back to OceanPulse"
      subtitle="Sign in to access your ocean intelligence dashboard."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-semibold text-tide-500 hover:text-tide-400">
            Create Account
          </Link>
        </>
      }
    >
      {/* Demo Mode Notice & Quick Autofill */}
      {isDemoMode && (
        <div className="mb-5 rounded-2xl border border-amber-500/25 bg-amber-500/[0.08] p-3.5 backdrop-blur-md">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300">
                🟡 DEMO MODE
              </span>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-400/15 px-2.5 py-1 text-xs font-semibold text-amber-200 transition-colors hover:bg-amber-400/25"
            >
              <SparklesIcon className="h-3.5 w-3.5" />
              Auto-fill Demo
            </button>
          </div>
          <p className="mt-1.5 text-xs text-amber-200/80">
            Preconfigured demo: <code className="font-mono text-amber-100">{DEMO_CREDENTIALS.email}</code> / <code className="font-mono text-amber-100">{DEMO_CREDENTIALS.password}</code>
          </p>
        </div>
      )}

      {/* General Error Banner */}
      {generalError && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-sm text-red-200 shadow-sm">
          <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <div className="flex-1">
            <p className="font-semibold text-red-200">{generalError}</p>
          </div>
        </div>
      )}

      {/* Success Banner */}
      {successMessage && (
        <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-sm text-emerald-200 shadow-sm">
          <CheckCircle2Icon className="h-4 w-4 shrink-0 text-emerald-400" />
          <p className="font-semibold text-emerald-200">{successMessage}</p>
        </div>
      )}

      <form onSubmit={submit} className="space-y-5" noValidate>
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          icon={<MailIcon className="h-4 w-4" />}
          placeholder="you@agency.gov or demo@oceanpulse.ai"
          disabled={loading}
        />

        <div className="relative">
          <Input
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            icon={<LockIcon className="h-4 w-4" />}
            placeholder="••••••••"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3.5 top-[38px] text-ink-500 transition-colors hover:text-ink-200"
          >
            {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-[13px] font-medium text-ink-400">
            <input
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-white/20 bg-abyss-900 accent-tide-500"
            />
            Keep me signed in
          </label>
          <Link
            to="/forgot-password"
            className="text-[13px] font-semibold text-tide-500 hover:text-tide-400"
          >
            Forgot Password?
          </Link>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <LoaderCircleIcon className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}