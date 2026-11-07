import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Leaf, KeyRound, Loader2, ArrowRight } from 'lucide-react';

const API = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!token) {
      setStatus('error');
      setMessage('Missing reset token. Please request a new password reset link.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch(`${API}/api/v1/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || 'Something went wrong. Please try again.');
      }

      setStatus('success');
      setMessage('Password successfully reset! Redirecting to login...');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2500);

    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Could not reach the server.');
    }
  }

  // Handle Invalid/Missing Token State
  if (!token) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-10 rounded-3xl shadow-2xl border border-[#3B1011]/10 max-w-md w-full text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-[#3B1011]/5 rounded-full flex items-center justify-center mb-6 border border-[#3B1011]/10">
            <KeyRound size={28} className="text-[#3B1011]/40" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#3B1011] mb-2">Invalid Reset Link</h2>
          <p className="text-sm text-[#5C1A1B] opacity-80 mb-8 leading-relaxed">
            This link is missing a secure token. It may have expired, or it was copied incorrectly. Please request a new password reset link.
          </p>
          <Link
            to="/forgot-password"
            className="w-full bg-[#3B1011] text-[#FDFBF7] px-6 py-4 rounded-xl text-xs font-bold tracking-[0.15em] uppercase hover:bg-[#5C1A1B] transition-all shadow-md flex items-center justify-center gap-2"
          >
            Request New Link <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  // Handle Valid Token State
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex font-sans">

      {/* Left Editorial Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#3B1011] text-[#FDFBF7] p-12 flex-col justify-between relative overflow-hidden">
        {/* Subtle Background Texture */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800')] opacity-5 mix-blend-screen pointer-events-none object-cover"></div>

        <Link to="/" className="flex items-center gap-2 text-[#EADDC5] hover:text-white transition-colors relative z-10 w-fit">
          <div className="w-8 h-8 rounded-md bg-[#EADDC5]/10 flex items-center justify-center border border-[#EADDC5]/20">
            <Leaf size={16} />
          </div>
          <span className="font-serif font-bold text-xl tracking-wide">SmartWardrobe<span className="text-[#7B2C2D]">.</span></span>
        </Link>

        <div className="relative z-10 max-w-lg mb-20">
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#7B2C2D] mb-4 block">Secure Your Account</span>
          <h1 className="font-serif text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Choose a <br /><span className="italic text-[#EADDC5] font-normal">new password.</span>
          </h1>
          <p className="text-sm font-medium text-[#EADDC5]/70 leading-relaxed border-l-2 border-[#7B2C2D] pl-4">
            Make sure it is at least 8 characters long and something you haven't used before.
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        <div className="w-full max-w-md">

          <div className="mb-10 text-center lg:text-left">
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#7B2C2D] mb-2 block">Almost There</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#3B1011] mb-2">Set new password</h2>
            <p className="text-sm font-medium text-[#5C1A1B] opacity-80">Create a strong new password for your account.</p>
          </div>

          <form onSubmit={submit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-widest uppercase text-[#5C1A1B]">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                  className="w-full px-4 py-3.5 bg-white border border-[#3B1011]/10 text-[#3B1011] focus:outline-none focus:border-[#7B2C2D] focus:ring-1 focus:ring-[#7B2C2D] transition-colors rounded-xl shadow-sm text-sm pr-12"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#3B1011]/40 hover:text-[#7B2C2D] transition-colors rounded-lg"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {status === 'error' && (
              <div role="alert" className="bg-[#3B1011]/5 border border-[#7B2C2D]/30 text-[#7B2C2D] p-4 rounded-xl text-sm font-medium">
                {message}
              </div>
            )}

            {status === 'success' && (
              <div role="alert" className="bg-[#EADDC5]/30 border border-[#3B1011]/20 text-[#3B1011] p-4 rounded-xl text-sm font-medium flex items-center gap-2">
                <KeyRound size={16} className="text-[#7B2C2D]" /> {message}
              </div>
            )}

            <button
              disabled={status === 'loading' || status === 'success'}
              className="w-full bg-[#3B1011] text-[#FDFBF7] px-6 py-4 rounded-xl text-xs font-bold tracking-[0.15em] uppercase hover:bg-[#5C1A1B] transition-all shadow-md mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
              type="submit"
            >
              {status === 'loading' && <Loader2 size={16} className="animate-spin" />}
              {status === 'loading' ? 'Updating password…' : status === 'success' ? 'Redirecting...' : 'Update Password'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}