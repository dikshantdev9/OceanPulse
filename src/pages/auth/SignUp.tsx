import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  EyeIcon,
  EyeOffIcon,
  LoaderCircleIcon,
  LockIcon,
  MailIcon,
  UserIcon,
} from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { RolePicker, type Role } from '../../components/auth/RolePicker';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { useAuth } from '../../context/AuthContext';

export function SignUp() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('researcher');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setSuccessMessage(null);

    const next: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) {
      next.name = 'Please enter your full name (at least 2 characters).';
    }

    if (!email.trim()) {
      next.email = 'Please enter your email address.';
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      next.email = 'Please enter a valid work email address.';
    }

    if (!password) {
      next.password = 'Please enter a password.';
    } else if (password.length < 6) {
      next.password = 'Password must be at least 6 characters.';
    }

    if (!confirmPassword) {
      next.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      next.confirmPassword = 'Passwords do not match.';
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });

      setSuccessMessage('Account created successfully. Redirecting to dashboard…');
      window.setTimeout(() => {
        navigate('/app', { replace: true });
      }, 600);
    } catch (err: unknown) {
      setLoading(false);
      const errObj = err as { message?: string; status?: number };
      if (errObj.status === 409) {
        setGeneralError('An account with this email address already exists.');
      } else {
        setGeneralError(errObj.message || 'Registration failed. Please check your details.');
      }
    }
  };

  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="Join the OceanPulse maritime surveillance network to monitor vessels and spills."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-tide-500 hover:text-tide-400">
            Sign In
          </Link>
        </>
      }
    >
      {generalError && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-sm text-red-200 shadow-sm">
          <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <p className="flex-1 font-semibold">{generalError}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-sm text-emerald-200 shadow-sm">
          <CheckCircle2Icon className="h-4 w-4 shrink-0 text-emerald-400" />
          <p className="font-semibold">{successMessage}</p>
        </div>
      )}

      <form onSubmit={submit} className="space-y-4" noValidate>
        <Input
          label="Full Name"
          name="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          icon={<UserIcon className="h-4 w-4" />}
          placeholder="Anjali Kulkarni"
          disabled={loading}
        />

        <Input
          label="Email Address"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          icon={<MailIcon className="h-4 w-4" />}
          placeholder="anjali@maritime.gov"
          disabled={loading}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="relative">
            <Input
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              icon={<LockIcon className="h-4 w-4" />}
              placeholder="••••••••"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3.5 top-[38px] text-ink-500 transition-colors hover:text-ink-200"
            >
              {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </button>
          </div>

          <div className="relative">
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              icon={<LockIcon className="h-4 w-4" />}
              placeholder="••••••••"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((p) => !p)}
              className="absolute right-3.5 top-[38px] text-ink-500 transition-colors hover:text-ink-200"
            >
              {showConfirmPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="pt-1">
          <RolePicker value={role} onChange={setRole} />
        </div>

        <Button type="submit" size="lg" className="w-full mt-2" disabled={loading}>
          {loading ? (
            <>
              <LoaderCircleIcon className="h-4 w-4 animate-spin" />
              Creating account…
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}