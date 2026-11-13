import React, { useState } from 'react';
import { Mail, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Send password recovery request
      await axios.post(`${BASE_URL}/api/v1/auth/forgot-password`, { email });
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F4EBD9] font-sans text-[#3B1011] selection:bg-[#7B2C2D] selection:text-[#F4EBD9]">
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
        .noise-bg {
          position: absolute;
          inset: 0;
          opacity: 0.05;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
      `}} />

      {/* LEFT SIDE: Editorial Imagery */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden group">
        <div className="absolute inset-0 bg-[#3B1011] opacity-60 mix-blend-multiply z-10 transition-opacity duration-1000 pointer-events-none"></div>
        {/* Chic wardrobe/editorial image */}
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1200"
          alt="Wardrobe Recovery"
          className="absolute inset-0 w-full h-full object-cover grayscale sepia-[0.4] transition-all duration-1000 group-hover:scale-105"
        />

        <div className="absolute inset-0 z-20 p-12 flex flex-col justify-between pointer-events-none">
          <Link to="/" className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-[#F4EBD9] pointer-events-auto hover:text-[#EADDC5] transition-colors">
            <div className="w-5 h-5 bg-[#F4EBD9] rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#3B1011" strokeWidth="2.5" className="w-3 h-3">
                <path d="M12 2v4M8 10a4 4 0 0 1 8 0l4 8H4l4-8z" />
                <path d="M12 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
              </svg>
            </div>
            SMARTWARDROBE
          </Link>

          <div className="max-w-md mt-auto">
            <p className="text-[10px] font-bold tracking-widest uppercase text-[#EADDC5] mb-4">
              ACCOUNT RECOVERY
            </p>
            <h2 className="font-serif text-5xl xl:text-6xl text-[#F4EBD9] leading-tight mb-6 tracking-tight">
              Let's get you <br />
              <span className="italic text-[#EADDC5]">back in.</span>
            </h2>
            <div className="h-px w-16 bg-[#7B2C2D] mb-6"></div>
            <p className="font-sans text-sm text-[#EADDC5] leading-relaxed opacity-90 font-medium">
              Don't worry, it happens to the best of us. We'll send you a secure link to reset your password and restore access to your archive.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Recovery Form */}
      <div className="flex-1 flex flex-col relative border-l border-[#3B1011]/10 h-screen overflow-y-auto">
        <div className="noise-bg"></div>

        {/* Top Navigation */}
        <div className="flex justify-between items-center p-8 lg:p-12 w-full relative z-10">
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#3B1011]/50 hidden sm:block">
            REMEMBERED IT?
          </span>
          <Link to="/login" className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-[#3B1011] hover:text-[#7B2C2D] transition-colors ml-auto">
            Back to login <ArrowRight size={14} />
          </Link>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 w-full max-w-xl mx-auto relative z-10">

          {/* Mobile Logo */}
          <div className="lg:hidden mb-12 flex justify-center">
            <Link to="/" className="text-xs font-semibold tracking-[0.2em] text-[#3B1011]">SMARTWARDROBE</Link>
          </div>

          {!isSubmitted ? (
            <>
              <p className="text-[10px] font-bold tracking-widest uppercase text-[#7B2C2D] mb-4">
                RESET PASSWORD
              </p>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#3B1011] tracking-tight mb-4">
                Forgot your password?
              </h2>
              <p className="text-[#5C1A1B] text-sm md:text-base mb-10 font-medium opacity-80">
                Enter the email address associated with your account.
              </p>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-[#3B1011] text-[#F4EBD9] p-4 text-xs font-semibold tracking-wider uppercase border border-[#7B2C2D]">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-[#5C1A1B] mb-2">Email address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-[#3B1011]/50" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 bg-[#EADDC5] border border-[#3B1011]/20 text-[#3B1011] focus:outline-none focus:border-[#7B2C2D] focus:ring-1 focus:ring-[#7B2C2D] transition-colors rounded-sm"
                      placeholder="studio@example.com"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full flex justify-center items-center py-4 px-4 border border-[#3B1011] rounded-sm shadow-md text-xs font-bold tracking-[0.2em] uppercase text-[#F4EBD9] bg-[#3B1011] hover:bg-[#5C1A1B] hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      'SEND RESET LINK'
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* Success State */
            <div className="text-center animate-fade-up-1">
              <div className="w-16 h-16 bg-[#EADDC5] border border-[#3B1011]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="h-6 w-6 text-[#7B2C2D]" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-[#3B1011] tracking-tight mb-4">
                Check your inbox
              </h2>
              <p className="text-[#5C1A1B] text-sm md:text-base mb-8 font-medium">
                We've sent a secure recovery link to <br />
                <span className="font-bold text-[#3B1011]">{email}</span>
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-xs font-bold tracking-wider uppercase text-[#7B2C2D] hover:text-[#3B1011] transition-colors"
              >
                Try a different email
              </button>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="p-8 lg:p-12 mt-auto relative z-10">
          <Link to="/" className="flex items-center gap-2 text-xs font-medium tracking-wider text-[#3B1011]/60 hover:text-[#3B1011] transition-colors w-fit">
            <ArrowLeft size={14} /> Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}