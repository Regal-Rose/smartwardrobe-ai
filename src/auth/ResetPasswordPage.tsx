import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Leaf, KeyRound } from 'lucide-react';

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

  if (!token) {
    return (
      <div className="auth-shell">
        <div className="auth-panel w-full flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4 max-w-sm">
            <div className="w-12 h-12 bg-danger-light text-danger rounded-full flex items-center justify-center mx-auto mb-2">
              <KeyRound size={24} />
            </div>
            <h2 className="text-xl font-semibold text-ink">Invalid Reset Link</h2>
            <p className="text-sm text-ink-muted">This link is missing a secure token. Please request a new password reset link.</p>
            <Link to="/forgot-password" className="button-dark mt-4 inline-flex">Request new link</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <div className="auth-aside">
        <Link to="/" className="brand-mark">
          <span className="brand-icon"><Leaf size={19}/></span> smartwardrobe<span className="brand-dot">.</span>
        </Link>
        <div className="auth-aside-copy">
          <span className="eyebrow">SECURE YOUR ACCOUNT</span>
          <h1>Choose a<br/><em>new password.</em></h1>
          <p>Make sure it's at least 8 characters long and something you haven't used before.</p>
        </div>
      </div>
      <div className="auth-panel">
        <div className="auth-form-wrap mx-auto w-full max-w-md mt-12">
          <span className="eyebrow">ALMOST THERE</span>
          <h2>Set new password</h2>
          <p>Create a strong new password for your account.</p>
          
          <form onSubmit={submit} className="auth-form mt-6">
            <label>
              New Password
              <div className="password-wrap">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  autoComplete="new-password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="At least 8 characters" 
                  minLength={8} 
                  required
                />
                <button 
                  type="button" 
                  className="password-toggle" 
                  onClick={() => setShowPassword(!showPassword)} 
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}
                </button>
              </div>
            </label>
            
            {status === 'error' && <div role="alert" className="auth-error">{message}</div>}
            {status === 'success' && <div role="alert" className="p-3 bg-success-light text-success text-sm rounded-lg border border-success/20 font-medium">{message}</div>}
            
            <button disabled={status === 'loading' || status === 'success'} className="button-dark auth-submit mt-2" type="submit">
              {status === 'loading' ? 'Updating password…' : status === 'success' ? 'Redirecting...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}