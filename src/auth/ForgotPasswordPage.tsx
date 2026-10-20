import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Mail, CheckCircle2 } from 'lucide-react';

const API = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setStatus('loading');
    setMessage('');
    
    try {
      const response = await fetch(`${API}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Too many requests. Please wait a while before trying again.");
        }
        throw new Error(data.detail || 'Something went wrong. Please try again.');
      }
      
      setStatus('success');
      setMessage(data.message || 'If that email is registered, a password reset link has been sent.');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Could not reach the server.');
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-aside">
        <Link to="/" className="brand-mark">
          <span className="brand-icon"><Leaf size={19}/></span> smartwardrobe<span className="brand-dot">.</span>
        </Link>
        <div className="auth-aside-copy">
          <span className="eyebrow">ACCOUNT RECOVERY</span>
          <h1>Let's get you<br/><em>back in.</em></h1>
          <p>Don't worry, it happens to the best of us. We'll send you a secure link to reset your password.</p>
        </div>
      </div>
      <div className="auth-panel">
        <div className="auth-panel-top">
          <span>REMEMBERED IT?</span>
          <Link to="/login">Back to login <ArrowRight size={14}/></Link>
        </div>
        <div className="auth-form-wrap">
          <span className="eyebrow">RESET PASSWORD</span>
          <h2>Forgot your password?</h2>
          <p>Enter the email address associated with your account.</p>
          
          {status === 'success' ? (
            <div className="p-6 bg-sage-pale rounded-xl border border-sage/20 text-center space-y-3 mt-6">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-sage-deep mx-auto shadow-sm">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-sm font-semibold text-ink">Check your email</h3>
              <p className="text-sm text-ink-muted leading-relaxed">{message}</p>
            </div>
          ) : (
            <form onSubmit={submit} className="auth-form mt-6">
              <label>
                Email address
                <div className="relative">
                  <input 
                    type="email" 
                    autoComplete="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="you@example.com" 
                    required 
                    className="pl-10"
                  />
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                </div>
              </label>
              
              {status === 'error' && <div role="alert" className="auth-error">{message}</div>}
              
              <button disabled={status === 'loading'} className="button-dark auth-submit" type="submit">
                {status === 'loading' ? 'Sending link…' : 'Send reset link'} {!status && <ArrowRight size={17}/>}
              </button>
            </form>
          )}
        </div>
        <Link to="/" className="back-home">← Back to home</Link>
      </div>
    </div>
  );
}