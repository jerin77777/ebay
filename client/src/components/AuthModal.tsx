import React, { useState, useEffect } from 'react';
import { CloseIcon, ShieldIcon, SupabaseLogo } from './Icons';
import { supabase } from '../supabaseClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (username: string, email: string, userId: number) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  if (!isOpen) return null;

  // Tabs: standard 'signin' or registration 'signup'
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  
  // Registration step: 'form' (enter email/passwords) or 'verify' (confirm OTP)
  const [signupStep, setSignupStep] = useState<'form' | 'verify'>('form');

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // OTP states
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(''));
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  
  // Alert messages
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [notice, setNotice] = useState('');

  // Clear state flags on tab switcher click
  useEffect(() => {
    setError('');
    setSuccess('');
    setNotice('');
    setSignupStep('form');
  }, [activeTab]);

  // Focus the first digit input when transitioning to OTP verification
  useEffect(() => {
    if (activeTab === 'signup' && signupStep === 'verify') {
      const firstInput = document.getElementById('otp-input-0') as HTMLInputElement;
      if (firstInput) firstInput.focus();
    }
  }, [signupStep, activeTab]);

  // --- PASSWORD-BASED SIGN IN AND SIGN UP (FORM STEP) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setNotice('');

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (activeTab === 'signin') {
      try {
        const { data, error: fetchError } = await supabase
          .from('users')
          .select('id, email, password, role')
          .eq('email', email.trim().toLowerCase())
          .single();

        if (fetchError || !data) {
          setError('Invalid email or user does not exist.');
          return;
        }

        if (data.password !== password) {
          setError('Incorrect password. Please try again.');
          return;
        }

        setSuccess('Welcome back! Logging you in...');
        setTimeout(() => {
          const defaultName = email.split('@')[0];
          const formattedName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
          onLoginSuccess(formattedName, email.trim().toLowerCase(), data.id);
          onClose();
        }, 1500);
      } catch (err) {
        console.error(err);
        setError('Database error during login. Please try again.');
      }
    } else {
      // Signup form phase validation
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please verify.');
        return;
      }

      // Check if user already exists
      try {
        const { data, error: checkError } = await supabase
          .from('users')
          .select('email')
          .eq('email', email.trim().toLowerCase());

        if (checkError) {
          console.error(checkError);
        }

        if (data && data.length > 0) {
          setError('An account with this email address already exists.');
          return;
        }
      } catch (err) {
        console.error(err);
      }

      // Passwords match -> initiate OTP registration check
      setIsSendingOtp(true);
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);

      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 40px 20px; text-align: center; border-radius: 12px; max-width: 480px; margin: 0 auto;">
          <div style="display: inline-block; margin-bottom: 24px; filter: drop-shadow(0 2px 10px rgba(62, 207, 142, 0.3));">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="#3ECF8E" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C-.33 13.427.65 15.455 2.409 15.455h9.579l.113 7.51c.014.985 1.259 1.408 1.873.636l9.288-11.651c1.093-1.377.114-3.405-1.646-3.405h-9.58z" />
            </svg>
          </div>
          <h2 style="font-size: 22px; font-weight: 800; margin: 0 0 12px 0; color: #ffffff; letter-spacing: -0.5px;">Verify Registration</h2>
          <p style="font-size: 14px; color: #94a3b8; margin: 0 0 32px 0; line-height: 1.5;">Thank you for registering at ValueBay. Please verify your email with the following 6-digit code.</p>
          <div style="background-color: #1e293b; border: 2px solid #334155; border-radius: 8px; padding: 16px 24px; display: inline-block; font-size: 32px; font-weight: 800; color: #3ECF8E; letter-spacing: 6px; margin-bottom: 32px; font-family: monospace;">
            ${code}
          </div>
          <p style="font-size: 12px; color: #64748b; margin: 0; line-height: 1.4;">This code is valid for 10 minutes. If you did not create this account, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #334155; margin: 30px 0;">
          <p style="font-size: 11px; color: #475569; margin: 0;">ValueBay &copy; 2026. Certified Pre-Owned Green Shopping.</p>
        </div>
      `;

      try {
        const response = await fetch('/api/send-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'ValueBay Auth <onboarding@resend.dev>',
            to: [email.trim()],
            subject: `${code} is your ValueBay registration verification code`,
            html: emailHtml,
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error response from email server.');
        }

        setSuccess('Verification code sent! Please check your email inbox.');
        setSignupStep('verify');
        setOtpDigits(Array(6).fill(''));
      } catch (err: any) {
        console.warn("Failed to dispatch registration email via Resend. Using sandbox fallback.", err);
        setNotice(
          "Notice: Sandbox API limit or domain unverified. For developer testing, the code has been logged to your console."
        );
        console.log(`🔑 [DEV] Your ValueBay registration OTP code is: ${code}`);
        setSignupStep('verify');
        setOtpDigits(Array(6).fill(''));
      } finally {
        setIsSendingOtp(false);
      }
    }
  };

  // --- REGISTRATION OTP VERIFICATION ---
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsVerifyingOtp(true);

    const enteredCode = otpDigits.join('');
    if (enteredCode.length < 6) {
      setError('Please enter all 6 digits of the OTP.');
      setIsVerifyingOtp(false);
      return;
    }

    if (enteredCode !== generatedOtp) {
      setError('Invalid verification code. Please check the code and try again.');
      setIsVerifyingOtp(false);
      return;
    }

    // Insert user into Supabase users table
    try {
      const { data, error: signUpError } = await supabase
        .from('users')
        .insert([{ email: email.trim().toLowerCase(), password: password, role: 'customer' }])
        .select('id')
        .single();

      if (signUpError || !data) {
        setError(`Registration failed: ${signUpError ? signUpError.message : 'No data returned'}`);
        setIsVerifyingOtp(false);
        return;
      }
      
      const newUserId = data.id;
      setSuccess('Registration successful! Welcome to ValueBay.');
      setTimeout(() => {
        const defaultName = email.split('@')[0];
        const formattedName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
        onLoginSuccess(formattedName, email.trim().toLowerCase(), newUserId);
        onClose();
        
        // Reset States
        setSignupStep('form');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setOtpDigits(Array(6).fill(''));
        setGeneratedOtp('');
        setNotice('');
        setIsVerifyingOtp(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      setError('Database error during user registration.');
      setIsVerifyingOtp(false);
      return;
    }
  };

  // --- RESEND OTP IN REGISTRATION STEP ---
  const handleResendOtp = async () => {
    setError('');
    setSuccess('');
    setNotice('');
    setIsSendingOtp(true);

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 40px 20px; text-align: center; border-radius: 12px; max-width: 480px; margin: 0 auto;">
        <div style="display: inline-block; margin-bottom: 24px; filter: drop-shadow(0 2px 10px rgba(62, 207, 142, 0.3));">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="#3ECF8E" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C-.33 13.427.65 15.455 2.409 15.455h9.579l.113 7.51c.014.985 1.259 1.408 1.873.636l9.288-11.651c1.093-1.377.114-3.405-1.646-3.405h-9.58z" />
          </svg>
        </div>
        <h2 style="font-size: 22px; font-weight: 800; margin: 0 0 12px 0; color: #ffffff; letter-spacing: -0.5px;">New Verification Code</h2>
        <p style="font-size: 14px; color: #94a3b8; margin: 0 0 32px 0; line-height: 1.5;">Please use the following new 6-digit code to complete registration.</p>
        <div style="background-color: #1e293b; border: 2px solid #334155; border-radius: 8px; padding: 16px 24px; display: inline-block; font-size: 32px; font-weight: 800; color: #3ECF8E; letter-spacing: 6px; margin-bottom: 32px; font-family: monospace;">
          ${code}
        </div>
        <p style="font-size: 12px; color: #64748b; margin: 0; line-height: 1.4;">This code is valid for 10 minutes.</p>
        <hr style="border: 0; border-top: 1px solid #334155; margin: 30px 0;">
        <p style="font-size: 11px; color: #475569; margin: 0;">ValueBay &copy; 2026. Certified Pre-Owned Green Shopping.</p>
      </div>
    `;

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'ValueBay Auth <onboarding@resend.dev>',
          to: [email.trim()],
          subject: `${code} is your new ValueBay registration verification code`,
          html: emailHtml,
        })
      });

      if (!response.ok) {
        throw new Error('API failure');
      }

      setSuccess('A new verification code has been sent.');
      setOtpDigits(Array(6).fill(''));
    } catch (err) {
      setNotice(
        "Notice: Resending email via API failed. The new code has been logged to your developer console."
      );
      console.log(`🔑 [DEV-RESEND] Your new ValueBay registration OTP is: ${code}`);
      setOtpDigits(Array(6).fill(''));
    } finally {
      setIsSendingOtp(false);
    }
  };

  // --- OTP INPUT INTERACTION LOGIC ---
  const handleDigitChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);

    // Auto-focus next input field on value entry
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const newDigits = [...otpDigits];
      
      // If current field is empty, delete previous and focus previous
      if (!otpDigits[index] && index > 0) {
        newDigits[index - 1] = '';
        setOtpDigits(newDigits);
        const prevInput = document.getElementById(`otp-input-${index - 1}`) as HTMLInputElement;
        if (prevInput) prevInput.focus();
      } else {
        newDigits[index] = '';
        setOtpDigits(newDigits);
      }
    }
  };

  const handleDigitPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pasteData)) return;

    const newDigits = pasteData.split('');
    setOtpDigits(newDigits);
    
    const lastInput = document.getElementById(`otp-input-5`) as HTMLInputElement;
    if (lastInput) lastInput.focus();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="auth-modal-close" onClick={onClose} aria-label="Close Authentication">
          <CloseIcon size={20} />
        </button>

        {/* Brand Header with Supabase Logo */}
        <div className="auth-modal-header">
          <div className="auth-supabase-logo-container" title="Secure Auth powered by Supabase & Resend">
            <SupabaseLogo size={36} />
          </div>
          <h3>ValueBay Account</h3>
          <p>Join the green revolution of certified pre-owned shopping</p>
        </div>

        {/* Tab switcher */}
        <div className="auth-tabs">
          <button 
            type="button"
            className={`auth-tab-btn ${activeTab === 'signin' ? 'active' : ''}`}
            onClick={() => { setActiveTab('signin'); }}
          >
            Sign In
          </button>
          <button 
            type="button"
            className={`auth-tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => { setActiveTab('signup'); }}
          >
            New Account
          </button>
        </div>

        {/* Errors & Success Banners */}
        {error && <div className="auth-error-banner">{error}</div>}
        {success && <div className="auth-success-banner">{success}</div>}
        {notice && <div className="auth-notice-banner">{notice}</div>}

        {/* Form Content */}
        {activeTab === 'signup' && signupStep === 'verify' ? (
          // --- REGISTRATION OTP VERIFICATION STEP ---
          <form onSubmit={handleVerifyOtp} className="auth-form">
            <div className="otp-info-text">
              We've sent a 6-digit registration verification code to <strong>{email}</strong>. Please enter it below.
            </div>
            
            <div className="otp-inputs-wrapper">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  type="text"
                  id={`otp-input-${idx}`}
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                  onPaste={handleDigitPaste}
                  className="otp-digit-input"
                  disabled={isVerifyingOtp}
                  autoComplete="off"
                />
              ))}
            </div>

            <button 
              type="submit" 
              className="auth-submit-btn otp-submit-btn"
              disabled={isVerifyingOtp}
            >
              {isVerifyingOtp ? 'VERIFYING...' : 'VERIFY & REGISTER'}
            </button>

            <div className="otp-actions-wrapper">
              <button 
                type="button" 
                className="otp-resend-btn" 
                onClick={handleResendOtp}
                disabled={isSendingOtp || isVerifyingOtp}
              >
                Resend Code
              </button>
              <button 
                type="button" 
                className="otp-change-email-btn" 
                onClick={() => {
                  setSignupStep('form');
                  setError('');
                  setSuccess('');
                  setNotice('');
                }}
                disabled={isVerifyingOtp}
              >
                Back to Sign Up
              </button>
            </div>
          </form>
        ) : (
          // --- STANDARD SIGN IN OR REGISTRATION FORM STEP ---
          <form onSubmit={handleSubmit} className="auth-form">
            {activeTab === 'signup' ? (
              // New Account Inputs
              <>
                <div className="input-group">
                  <label htmlFor="authEmail">Email Address</label>
                  <input 
                    type="email" 
                    id="authEmail" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    disabled={isSendingOtp}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="authPassword">Password</label>
                  <input 
                    type="password" 
                    id="authPassword" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isSendingOtp}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="authConfirmPassword">Confirm Password</label>
                  <input 
                    type="password" 
                    id="authConfirmPassword" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isSendingOtp}
                  />
                </div>

                <button 
                  type="submit" 
                  className="auth-submit-btn"
                  disabled={isSendingOtp}
                >
                  {isSendingOtp ? 'SENDING CODE...' : 'CREATE ACCOUNT'}
                </button>
              </>
            ) : (
              // Sign In Inputs
              <>
                <div className="input-group">
                  <label htmlFor="authEmail">Email Address</label>
                  <input 
                    type="email" 
                    id="authEmail" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="authPassword">Password</label>
                  <input 
                    type="password" 
                    id="authPassword" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="forgot-password-link">
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); setError('Password reset link sent to email (Mock)'); }}>
                    Forgot Password?
                  </a>
                </div>

                <button type="submit" className="auth-submit-btn">
                  SECURE LOGIN
                </button>
              </>
            )}
          </form>
        )}

        {/* Safety Shield Footer */}
        <div className="auth-security-footer">
          <ShieldIcon size={12} />
          <span>Your security is our priority. Credentials are encrypted in transit.</span>
        </div>
      </div>
    </div>
  );
};
