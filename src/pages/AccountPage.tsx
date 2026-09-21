import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  User,
  Package,
  MapPin,
  Heart,
  FileText,
  LogOut,
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  ShieldCheck,
  Mail,
  Lock,
  Key,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth, isStoreOwnerEmail, ADMIN_EMAIL } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { useInventory } from '../context/InventoryContext';
import { isSupabaseConfigured } from '../services/supabase';

export const AccountPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'orders';

  const [activeTab, setActiveTab] = useState<'orders' | 'quotes' | 'addresses' | 'wishlist'>(
    (initialTab as any) || 'orders'
  );

  const {
    user,
    isLoggedIn,
    signInWithGoogle,
    signUpWithEmail,
    signInWithPassword,
    sendPasswordResetOtp,
    resetPasswordWithOtp,
    updatePassword,
    logout,
    orders,
    customQuotes,
  } = useAuth();
  const { wishlistIds, toggleWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();
  const { products } = useInventory();

  // Store owner detection strictly based on authenticated email credentials
  const isOwner = Boolean(user?.isAdmin || isStoreOwnerEmail(user?.email));

  // Auth form state
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot_password'>(() => {
    if (searchParams.get('mode') === 'reset') return 'forgot_password';
    if (searchParams.get('email')) return 'signup';
    return 'signin';
  });
  const [emailInput, setEmailInput] = useState(() => searchParams.get('email') || '');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password OTP recovery states
  const [resetStep, setResetStep] = useState<'request' | 'verify'>(() => {
    return searchParams.get('mode') === 'reset' ? 'verify' : 'request';
  });
  const [otpCode, setOtpCode] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Check URL parameters for password recovery link
  useEffect(() => {
    const mode = searchParams.get('mode');
    const hash = window.location.hash;
    if (mode === 'reset' || hash.includes('type=recovery')) {
      setAuthMode('forgot_password');
      setResetStep('verify');
      setAuthSuccess('Recovery session active. Enter your new password below.');
    }
  }, [searchParams]);

  // Resend code countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const wishlistedProducts = (products || []).filter((p) => wishlistIds.includes(p.id));

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!emailInput.trim()) {
      setAuthError('Please enter your email address.');
      return;
    }

    if (!passwordInput) {
      setAuthError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (authMode === 'signup') {
        if (passwordInput.length < 6) {
          setAuthError('Password must be at least 6 characters.');
          setIsSubmitting(false);
          return;
        }
        const res = await signUpWithEmail(emailInput.trim(), passwordInput, nameInput.trim());
        if (res.error) {
          setAuthError(res.error);
        } else if (res.sessionEstablished) {
          setAuthSuccess('Account created successfully! Welcome to The Weave Atelier.');
        }
      } else {
        // Sign In
        const res = await signInWithPassword(emailInput.trim(), passwordInput);
        if (res.error) {
          setAuthError(res.error);
        }
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    const cleanEmail = emailInput.trim();
    if (!cleanEmail) {
      setAuthError('Please enter your email address to receive the verification code.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await sendPasswordResetOtp(cleanEmail);
      if (res.error) {
        setAuthError(res.error);
      } else {
        setResetStep('verify');
        setResendCooldown(60);
        setAuthSuccess(
          `A 6-digit recovery code has been sent to ${cleanEmail}. Please enter the code below to reset your password.`
        );
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Failed to dispatch password recovery email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtpAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    const cleanEmail = emailInput.trim();
    const cleanOtp = otpCode.trim();

    if (!cleanOtp && !isLoggedIn) {
      setAuthError('Please enter the 6-digit verification code from your email.');
      return;
    }

    if (!newPasswordInput || newPasswordInput.length < 6) {
      setAuthError('New password must be at least 6 characters long.');
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setAuthError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (cleanOtp) {
        const res = await resetPasswordWithOtp(cleanEmail, cleanOtp, newPasswordInput);
        if (res.error) {
          setAuthError(res.error);
          setIsSubmitting(false);
          return;
        }
      } else {
        // Direct update if coming via recovery session link
        const res = await updatePassword(newPasswordInput);
        if (res.error) {
          setAuthError(res.error);
          setIsSubmitting(false);
          return;
        }
      }

      setAuthSuccess('Password has been successfully updated! You are now signed in.');
      setOtpCode('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      setAuthMode('signin');
      setResetStep('request');
    } catch (err: any) {
      setAuthError(err?.message || 'Failed to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isSubmitting) return;
    setAuthError('');
    setIsSubmitting(true);
    try {
      const res = await sendPasswordResetOtp(emailInput.trim());
      if (res.error) {
        setAuthError(res.error);
      } else {
        setResendCooldown(60);
        setAuthSuccess(`A new 6-digit code has been sent to ${emailInput.trim()}.`);
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Could not resend code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    const res = await signInWithGoogle();
    if (res.error) {
      setAuthError(res.error);
    }
  };

  const handleMoveWishlistToCart = (product: any) => {
    if (!product) return;
    const defaultVariant = product.variants?.[0] || {
      id: `var-${product.slug || 'wish'}-1`,
      size: 'Standard Dimensions',
      sku: `TWA-${(product.slug || 'RUG').replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() || 'RUG'}-0810`,
      priceUSD: 1500,
      isReadyToShip: true,
    };
    const primaryImg =
      product.images?.[0]?.url ||
      'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1200&q=80';

    addToCart({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      productImage: primaryImg,
      variantId: defaultVariant.id,
      size: defaultVariant.size || 'Standard Dimensions',
      sku: defaultVariant.sku,
      priceUSD: Number(defaultVariant.priceUSD) || 1500,
      technique: product.technique || 'Hand-Tufted',
      isReadyToShip: Boolean(defaultVariant.isReadyToShip),
      estimatedDispatch: defaultVariant.isReadyToShip
        ? 'Dispatches in 2–4 business days'
        : 'Made to order (4–6 weeks)',
    });
    toggleWishlist(product.id);
  };

  return (
    <div className="pt-20 sm:pt-24 pb-24 bg-atelier-ivory min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="border-b border-atelier-parchment pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-atelier-taupe font-medium mb-2">
              Customer Portal
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl text-atelier-softblack font-light tracking-tight">
              {isLoggedIn ? `Welcome, ${user?.firstName}` : 'Atelier Account'}
            </h1>
          </div>

          {isLoggedIn ? (
            <button
              onClick={logout}
              className="text-xs text-atelier-taupe hover:text-atelier-softblack underline flex items-center"
            >
              <LogOut size={13} className="mr-1.5" />
              <span>Sign Out</span>
            </button>
          ) : (
            <span className="text-xs text-atelier-taupe font-light">
              Guest access supported. Log in to review orders and saved custom sizes.
            </span>
          )}
        </div>

        {!isLoggedIn ? (
          /* Sign In, Registration & Forgot Password Card */
          <div className="max-w-md mx-auto bg-atelier-cream border border-atelier-parchment p-8 sm:p-10 shadow-subtle space-y-6">
            {authMode === 'forgot_password' ? (
              /* Forgot Password Header */
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setResetStep('request');
                    setAuthError('');
                    setAuthSuccess('');
                  }}
                  className="inline-flex items-center text-xs text-atelier-taupe hover:text-atelier-softblack transition-colors"
                >
                  <ArrowLeft size={13} className="mr-1.5" />
                  <span>Return to Sign In</span>
                </button>
                <h2 className="font-serif text-2xl text-atelier-softblack font-normal">
                  {resetStep === 'request' ? 'Password Recovery' : 'Set New Password'}
                </h2>
                <p className="text-xs text-atelier-charcoal font-light leading-relaxed">
                  {resetStep === 'request'
                    ? 'Enter your registered email address. We will send a 6-digit OTP code to verify your identity and reset your password.'
                    : 'Enter the 6-digit verification code sent to your email and select your new password.'}
                </p>
              </div>
            ) : (
              /* Normal Sign In / Sign Up Header */
              <div className="space-y-1 text-center sm:text-left">
                <h2 className="font-serif text-2xl text-atelier-softblack font-normal">
                  {authMode === 'signin' ? 'Access Your Account' : 'Create Atelier Account'}
                </h2>
                <p className="text-xs text-atelier-charcoal font-light leading-relaxed">
                  {authMode === 'signin'
                    ? 'Track orders in production, review custom sizing quotes, and sync saved items.'
                    : 'Join The Weave Atelier to save bespoke dimensions, manage deliveries, and receive artisan updates.'}
                </p>
              </div>
            )}

            {/* Google OAuth Button & Divider (Only for signin / signup) */}
            {authMode !== 'forgot_password' && isSupabaseConfigured() && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-white border border-atelier-parchment hover:border-atelier-softblack text-atelier-softblack text-xs font-medium tracking-wider flex items-center justify-center space-x-3 transition-colors shadow-xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="relative flex items-center justify-center">
                  <div className="border-t border-atelier-parchment w-full"></div>
                  <span className="bg-atelier-cream px-3 text-[10px] text-atelier-taupe tracking-widest uppercase">
                    or with email
                  </span>
                  <div className="border-t border-atelier-parchment w-full"></div>
                </div>
              </div>
            )}

            {/* Auth Mode Toggle Tabs (Only for signin / signup) */}
            {authMode !== 'forgot_password' && (
              <div className="flex border border-atelier-parchment bg-atelier-ivory p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setAuthError('');
                    setAuthSuccess('');
                  }}
                  className={`flex-1 py-2 text-center transition-colors font-medium ${
                    authMode === 'signin'
                      ? 'bg-atelier-cream text-atelier-softblack shadow-xs'
                      : 'text-atelier-taupe hover:text-atelier-softblack'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setAuthError('');
                    setAuthSuccess('');
                  }}
                  className={`flex-1 py-2 text-center transition-colors font-medium ${
                    authMode === 'signup'
                      ? 'bg-atelier-cream text-atelier-softblack shadow-xs'
                      : 'text-atelier-taupe hover:text-atelier-softblack'
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* FORGOT PASSWORD: STEP 1 (Request Code via Email) */}
            {authMode === 'forgot_password' && resetStep === 'request' && (
              <form onSubmit={handleRequestResetOtp} className="space-y-4">
                <div>
                  <label className="text-[11px] text-atelier-taupe block mb-1">
                    Your Registered Email *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full bg-atelier-ivory border border-atelier-parchment px-4 py-2.5 text-xs text-atelier-softblack focus:outline-none"
                    />
                    <Mail size={13} className="absolute right-3.5 top-3 text-atelier-taupe" />
                  </div>
                </div>

                {authError && (
                  <div className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 p-2.5 flex items-start space-x-2">
                    <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
                    <span className="leading-snug">{authError}</span>
                  </div>
                )}

                {authSuccess && (
                  <div className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 flex items-start space-x-2">
                    <CheckCircle2 size={13} className="flex-shrink-0 mt-0.5" />
                    <span className="leading-snug">{authSuccess}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-atelier-softblack text-atelier-parchment py-3.5 px-6 text-xs tracking-widest uppercase hover:bg-atelier-darkbrown transition-colors font-medium flex items-center justify-center disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Dispatching OTP...' : 'Send Reset OTP Code'}</span>
                  <ArrowRight size={13} className="ml-2" />
                </button>
              </form>
            )}

            {/* FORGOT PASSWORD: STEP 2 (Verify OTP & Set New Password) */}
            {authMode === 'forgot_password' && resetStep === 'verify' && (
              <form onSubmit={handleVerifyOtpAndReset} className="space-y-4">
                {/* Email Confirmation Row */}
                <div className="flex items-center justify-between p-3 bg-atelier-ivory border border-atelier-parchment text-xs">
                  <div className="truncate">
                    <span className="text-[10px] text-atelier-taupe uppercase block">Resetting account</span>
                    <span className="text-atelier-softblack font-medium">{emailInput || 'Your email'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setResetStep('request');
                      setAuthError('');
                      setAuthSuccess('');
                    }}
                    className="text-[11px] text-atelier-taupe hover:text-atelier-softblack underline flex-shrink-0 ml-2"
                  >
                    Change Email
                  </button>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] text-atelier-taupe block">6-Digit Recovery OTP *</label>
                    <span className="text-[10px] text-atelier-taupe">From your email</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      maxLength={8}
                      placeholder="e.g. 123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.trim())}
                      className="w-full bg-atelier-ivory border border-atelier-parchment px-4 py-2.5 text-sm font-mono tracking-widest text-atelier-softblack focus:outline-none placeholder:font-sans placeholder:tracking-normal placeholder:text-xs"
                    />
                    <Key size={13} className="absolute right-3.5 top-3.5 text-atelier-taupe" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] text-atelier-taupe block">New Password *</label>
                    <span className="text-[10px] text-atelier-taupe">Min. 6 chars</span>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="Enter new password..."
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      className="w-full bg-atelier-ivory border border-atelier-parchment px-4 py-2.5 text-xs text-atelier-softblack focus:outline-none"
                    />
                    <Lock size={13} className="absolute right-3.5 top-3 text-atelier-taupe" />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-atelier-taupe block mb-1">Confirm New Password *</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="Confirm new password..."
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      className="w-full bg-atelier-ivory border border-atelier-parchment px-4 py-2.5 text-xs text-atelier-softblack focus:outline-none"
                    />
                    <Lock size={13} className="absolute right-3.5 top-3 text-atelier-taupe" />
                  </div>
                </div>

                {authError && (
                  <div className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 p-2.5 flex items-start space-x-2">
                    <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
                    <span className="leading-snug">{authError}</span>
                  </div>
                )}

                {authSuccess && (
                  <div className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 flex items-start space-x-2">
                    <CheckCircle2 size={13} className="flex-shrink-0 mt-0.5" />
                    <span className="leading-snug">{authSuccess}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-atelier-softblack text-atelier-parchment py-3.5 px-6 text-xs tracking-widest uppercase hover:bg-atelier-darkbrown transition-colors font-medium flex items-center justify-center disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Updating Password...' : 'Reset & Update Password'}</span>
                  <ArrowRight size={13} className="ml-2" />
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || isSubmitting}
                    className="text-xs text-atelier-taupe hover:text-atelier-softblack transition-colors disabled:opacity-50"
                  >
                    {resendCooldown > 0 ? (
                      <span>Resend code in {resendCooldown}s</span>
                    ) : (
                      <span className="underline">Didn't receive the email code? Resend OTP</span>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STANDARD SIGN IN & SIGN UP FORMS */}
            {authMode !== 'forgot_password' && (
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === 'signup' && (
                  <div>
                    <label className="text-[11px] text-atelier-taupe block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter your full name"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full bg-atelier-ivory border border-atelier-parchment px-4 py-2.5 text-xs text-atelier-softblack focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[11px] text-atelier-taupe block mb-1">Email Address *</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full bg-atelier-ivory border border-atelier-parchment px-4 py-2.5 text-xs text-atelier-softblack focus:outline-none"
                    />
                    <Mail size={13} className="absolute right-3.5 top-3 text-atelier-taupe" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] text-atelier-taupe block">Password *</label>
                    {authMode === 'signin' ? (
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('forgot_password');
                          setResetStep('request');
                          setAuthError('');
                          setAuthSuccess('');
                        }}
                        className="text-[11px] text-atelier-taupe hover:text-atelier-softblack underline transition-colors"
                      >
                        Forgot password?
                      </button>
                    ) : (
                      <span className="text-[10px] text-atelier-taupe">Min. 6 chars</span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder={authMode === 'signup' ? 'Create a secure password...' : 'Enter your password...'}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full bg-atelier-ivory border border-atelier-parchment px-4 py-2.5 text-xs text-atelier-softblack focus:outline-none"
                    />
                    <Lock size={13} className="absolute right-3.5 top-3 text-atelier-taupe" />
                  </div>
                </div>

                {authError && (
                  <div className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 p-2.5 flex items-start space-x-2">
                    <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
                    <span className="leading-snug">{authError}</span>
                  </div>
                )}

                {authSuccess && (
                  <div className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 flex items-start space-x-2">
                    <CheckCircle2 size={13} className="flex-shrink-0 mt-0.5" />
                    <span className="leading-snug">{authSuccess}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-atelier-softblack text-atelier-parchment py-3.5 px-6 text-xs tracking-widest uppercase hover:bg-atelier-darkbrown transition-colors font-medium flex items-center justify-center disabled:opacity-50"
                >
                  <span>
                    {isSubmitting
                      ? 'Authenticating...'
                      : authMode === 'signup'
                      ? 'Create Atelier Account'
                      : 'Sign In to Account'}
                  </span>
                  <ArrowRight size={13} className="ml-2" />
                </button>
              </form>
            )}
          </div>
        ) : (
          /* Logged In Dashboard with Tabs */
          <div className="space-y-8">
            {/* Executive Atelier Staff Banner (Only visible to verified store owner) */}
            {isOwner && (
              <div className="bg-gradient-to-r from-atelier-softblack via-stone-900 to-atelier-softblack text-atelier-parchment p-6 sm:p-7 border border-atelier-agedgold/40 shadow-md relative overflow-hidden">
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] tracking-[0.25em] uppercase font-mono text-atelier-agedgold font-medium bg-atelier-agedgold/10 px-2.5 py-0.5 rounded border border-atelier-agedgold/30">
                        Staff Operations Access
                      </span>
                      <span className="text-[11px] text-atelier-parchment/60 font-mono">
                        {user?.email || ADMIN_EMAIL}
                      </span>
                    </div>
                    <h2 className="font-serif text-2xl text-white font-normal">
                      Atelier Studio & Operations Portal
                    </h2>
                    <p className="text-xs text-atelier-parchment/80 font-light leading-relaxed">
                      You are authenticated as the store administrator. Access the live stock matrix, product catalog, fulfillment status pipeline, and bespoke custom sizing inquiries.
                    </p>
                  </div>

                  <Link
                    to="/admin"
                    className="inline-flex items-center justify-center px-6 py-3.5 bg-atelier-parchment text-atelier-softblack hover:bg-white transition-all text-xs tracking-widest uppercase font-medium shadow-sm flex-shrink-0 group"
                  >
                    <ShieldCheck size={15} className="mr-2 text-atelier-darkbrown" />
                    <span>Launch Admin Portal</span>
                    <ArrowRight size={13} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {/* Sidebar Tabs (3 cols) */}
              <div className="md:col-span-3 bg-atelier-cream border border-atelier-parchment p-4 space-y-1">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full text-left px-4 py-3 text-xs flex items-center space-x-2.5 transition-colors ${
                    activeTab === 'orders'
                      ? 'bg-atelier-ivory text-atelier-softblack font-medium border-l-2 border-atelier-softblack'
                      : 'text-atelier-charcoal hover:bg-atelier-ivory/60'
                  }`}
                >
                  <Package size={15} />
                  <span>My Orders ({orders.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('quotes')}
                  className={`w-full text-left px-4 py-3 text-xs flex items-center space-x-2.5 transition-colors ${
                    activeTab === 'quotes'
                      ? 'bg-atelier-ivory text-atelier-softblack font-medium border-l-2 border-atelier-softblack'
                      : 'text-atelier-charcoal hover:bg-atelier-ivory/60'
                  }`}
                >
                  <FileText size={15} />
                  <span>Custom Quotes ({customQuotes.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('wishlist')}
                  className={`w-full text-left px-4 py-3 text-xs flex items-center space-x-2.5 transition-colors ${
                    activeTab === 'wishlist'
                      ? 'bg-atelier-ivory text-atelier-softblack font-medium border-l-2 border-atelier-softblack'
                      : 'text-atelier-charcoal hover:bg-atelier-ivory/60'
                  }`}
                >
                  <Heart size={15} />
                  <span>Wishlist ({wishlistIds.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full text-left px-4 py-3 text-xs flex items-center space-x-2.5 transition-colors ${
                    activeTab === 'addresses'
                      ? 'bg-atelier-ivory text-atelier-softblack font-medium border-l-2 border-atelier-softblack'
                      : 'text-atelier-charcoal hover:bg-atelier-ivory/60'
                  }`}
                >
                  <MapPin size={15} />
                  <span>Saved Addresses</span>
                </button>

                {/* Staff Portal Link (Exclusive to Owner) */}
                {isOwner && (
                  <div className="pt-2 border-t border-atelier-parchment/60 mt-2">
                    <Link
                      to="/admin"
                      className="w-full text-left px-4 py-3 text-xs flex items-center justify-between transition-colors bg-atelier-softblack text-atelier-agedgold hover:bg-stone-900 font-medium"
                    >
                      <div className="flex items-center space-x-2.5">
                        <ShieldCheck size={15} className="text-atelier-agedgold" />
                        <span>Admin Console</span>
                      </div>
                      <ArrowUpRight size={13} />
                    </Link>
                  </div>
                )}
              </div>

            {/* Content Area (9 cols) */}
            <div className="md:col-span-9 bg-atelier-ivory border border-atelier-parchment p-8 shadow-subtle min-h-[400px]">
              {/* TAB 1: Orders */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <h2 className="font-serif text-2xl text-atelier-softblack font-normal">
                    Order History & Status
                  </h2>

                  {orders.length === 0 ? (
                    <div className="py-12 text-center text-atelier-taupe text-xs">
                      No orders placed yet.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders.map((o) => (
                        <div
                          key={o.id}
                          className="bg-atelier-cream border border-atelier-parchment p-6 space-y-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-atelier-parchment pb-4 gap-2">
                            <div>
                              <div className="font-mono text-sm font-bold text-atelier-softblack">
                                {o.orderNumber}
                              </div>
                              <div className="text-xs text-atelier-taupe">{o.date}</div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-[10px] uppercase font-mono px-2.5 py-1 bg-atelier-ivory border border-atelier-sand text-atelier-darkbrown font-medium">
                                {o.status}
                              </span>
                              <Link
                                to={`/order-tracking?orderNumber=${o.orderNumber}`}
                                className="text-xs text-atelier-darkbrown underline hover:text-black font-medium"
                              >
                                Track Package →
                              </Link>
                            </div>
                          </div>

                          {/* Items in order */}
                          <div className="space-y-3">
                            {o.items.map((i) => (
                              <div key={i.variantId} className="flex items-center justify-between text-xs">
                                <div className="flex items-center space-x-3">
                                  <img
                                    src={i.productImage}
                                    alt={i.productName}
                                    className="w-12 h-14 object-cover border border-atelier-parchment"
                                  />
                                  <div>
                                    <div className="font-serif text-sm font-medium text-atelier-softblack">
                                      {i.productName}
                                    </div>
                                    <div className="text-atelier-taupe text-[11px]">
                                      {i.size} · Qty: {i.quantity}
                                    </div>
                                  </div>
                                </div>
                                <span className="font-mono font-medium text-atelier-softblack">
                                  {formatPrice(i.priceUSD * i.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="border-t border-atelier-parchment pt-3 flex justify-between text-xs text-atelier-charcoal">
                            <span>Delivery Carrier: {o.carrier} ({o.trackingNumber})</span>
                            <span className="font-medium font-serif text-base text-atelier-darkbrown">
                              Total: {formatPrice(o.totalUSD)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Custom Quotes */}
              {activeTab === 'quotes' && (
                <div className="space-y-6">
                  <h2 className="font-serif text-2xl text-atelier-softblack font-normal">
                    Custom Rug Requests & Quotations
                  </h2>

                  {customQuotes.length === 0 ? (
                    <div className="py-12 text-center text-atelier-taupe text-xs space-y-3">
                      <p>You haven’t submitted any custom rug requests yet.</p>
                      <Link
                        to="/custom-rugs"
                        className="inline-block px-4 py-2 bg-atelier-softblack text-atelier-parchment text-xs uppercase tracking-wider"
                      >
                        Start Custom Request
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {customQuotes.map((q) => (
                        <div
                          key={q.id}
                          className="bg-atelier-cream border border-atelier-parchment p-6 space-y-3"
                        >
                          <div className="flex justify-between items-center border-b border-atelier-parchment pb-3">
                            <div>
                              <div className="font-mono text-sm font-bold text-atelier-softblack">
                                {q.referenceNumber}
                              </div>
                              <div className="text-xs text-atelier-taupe">{q.createdAt}</div>
                            </div>
                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-atelier-ivory border border-atelier-sand text-atelier-darkbrown font-medium">
                              {q.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-atelier-charcoal">
                            <div>
                              <span className="text-[10px] text-atelier-taupe uppercase block">Dimensions</span>
                              {q.length} × {q.width} {q.unit} ({q.shape})
                            </div>
                            <div>
                              <span className="text-[10px] text-atelier-taupe uppercase block">Technique</span>
                              {q.technique}
                            </div>
                            <div>
                              <span className="text-[10px] text-atelier-taupe uppercase block">Material</span>
                              {q.material}
                            </div>
                            <div>
                              <span className="text-[10px] text-atelier-taupe uppercase block">Estimated Range</span>
                              <span className="font-mono font-medium">
                                {formatPrice(q.estimatedPriceUSD.min)} – {formatPrice(q.estimatedPriceUSD.max)}
                              </span>
                            </div>
                          </div>

                          {q.notes && (
                            <div className="text-xs text-atelier-charcoal/80 font-light border-t border-atelier-parchment/60 pt-2">
                              Note: {q.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Wishlist */}
              {activeTab === 'wishlist' && (
                <div className="space-y-6">
                  <h2 className="font-serif text-2xl text-atelier-softblack font-normal">
                    Saved Wishlist Items
                  </h2>

                  {wishlistedProducts.length === 0 ? (
                    <div className="py-12 text-center text-atelier-taupe text-xs space-y-3">
                      <p>Your wishlist is empty.</p>
                      <Link
                        to="/shop"
                        className="inline-block px-4 py-2 bg-atelier-softblack text-atelier-parchment text-xs uppercase tracking-wider"
                      >
                        Explore Pieces
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {wishlistedProducts.map((p) => (
                        <div
                          key={p.id}
                          className="bg-atelier-cream border border-atelier-parchment p-4 space-y-3 flex flex-col justify-between"
                        >
                          <div className="aspect-[4/3] overflow-hidden bg-atelier-parchment">
                            <img
                              src={p.images[0]?.url}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="text-[10px] text-atelier-taupe uppercase tracking-wider">
                              {p.collection} · {p.technique}
                            </div>
                            <h4 className="font-serif text-lg text-atelier-softblack font-medium">
                              {p.name}
                            </h4>
                            <div className="text-xs font-mono text-atelier-darkbrown font-medium">
                              From {formatPrice(p.variants[0]?.priceUSD || 0)}
                            </div>
                          </div>
                          <div className="pt-2 flex items-center space-x-2">
                            <button
                              onClick={() => handleMoveWishlistToCart(p)}
                              className="flex-1 py-2 bg-atelier-softblack text-atelier-parchment text-xs uppercase tracking-wider hover:bg-atelier-darkbrown transition-colors"
                            >
                              Move to Bag
                            </button>
                            <button
                              onClick={() => toggleWishlist(p.id)}
                              className="px-3 py-2 border border-atelier-parchment text-xs text-atelier-taupe hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: Addresses */}
              {activeTab === 'addresses' && (
                <div className="space-y-6">
                  <h2 className="font-serif text-2xl text-atelier-softblack font-normal">
                    Saved Delivery Addresses
                  </h2>

                  {user?.savedAddress ? (
                    <div className="p-6 bg-atelier-cream border border-atelier-parchment space-y-2 text-xs text-atelier-charcoal max-w-md">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-atelier-softblack uppercase tracking-wider text-[11px]">
                          Primary Delivery Address
                        </span>
                        <span className="text-[10px] text-atelier-taupe font-mono">Default</span>
                      </div>
                      <div className="font-medium text-atelier-softblack">
                        {user.firstName} {user.lastName}
                      </div>
                      <div>
                        {user.savedAddress.address}
                        {user.savedAddress.apartment ? `, ${user.savedAddress.apartment}` : ''}
                      </div>
                      <div>
                        {user.savedAddress.city}, {user.savedAddress.state}{' '}
                        {user.savedAddress.postalCode}
                      </div>
                      <div>{user.savedAddress.country}</div>
                      {user.phone && (
                        <div className="text-atelier-taupe pt-1 font-mono text-[11px]">
                          {user.phone}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 bg-atelier-cream border border-atelier-parchment text-center max-w-md space-y-3">
                      <MapPin size={24} className="mx-auto text-atelier-taupe" />
                      <p className="text-sm font-serif text-atelier-softblack">No saved address yet</p>
                      <p className="text-xs text-atelier-charcoal font-light leading-relaxed">
                        Your shipping address will be securely saved to your account when you complete your first purchase at checkout.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
};
