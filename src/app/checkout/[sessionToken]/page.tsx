'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, APIError, CheckoutSession } from '@/lib/api';
import { useToast } from '@/components/ui/toast';
import { FiShield, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const sessionToken = params.sessionToken as string;
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [checkoutType, setCheckoutType] = useState<'standard' | 'direct'>('standard');
  const [step, setStep] = useState<'phone' | 'verify' | 'success'>('phone');
  
  // Phone/Email input
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [contactType, setContactType] = useState<'phone' | 'email'>('phone');
  const [phoneError, setPhoneError] = useState('');
  
  // OTP state
  const [otpReference, setOtpReference] = useState('');
  const [otpInputs, setOtpInputs] = useState(['', '', '', '', '', '']);
  const [otpExpiresAt, setOtpExpiresAt] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [remainingTries, setRemainingTries] = useState(3);
  const [verifiedName, setVerifiedName] = useState<string>('');
  
  // Resend OTP throttle state
  const [resendCountdown, setResendCountdown] = useState(0);
  const [lastResendTime, setLastResendTime] = useState<number>(0);

  useEffect(() => {
    fetchSession();
  }, [sessionToken]);

  useEffect(() => {
    if (!otpExpiresAt) return;

    const interval = setInterval(() => {
      const now = new Date();
      const remaining = Math.max(0, Math.floor((otpExpiresAt.getTime() - now.getTime()) / 1000));
      
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);

      if (remaining === 0) {
        clearInterval(interval);
        toast.error('OTP has expired. Please request a new one.');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [otpExpiresAt]);

  useEffect(() => {
    if (resendCountdown <= 0) return;

    const interval = setInterval(() => {
      setResendCountdown((prev) => {
        const newCount = Math.max(0, prev - 1);
        if (newCount === 0) {
          clearInterval(interval);
        }
        return newCount;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [resendCountdown]);

  const fetchSession = async () => {
    try {
      const data = await api.getCheckoutSession(sessionToken);
      setSession(data);

      // Detect checkout type based on session data
      if (data.phoneNumber || data.email) {
        // Direct checkout - contact already provided
        setCheckoutType('direct');
        setPhoneNumber(data.phoneNumber || '');
        setEmail(data.email || '');
        setContactType(data.phoneNumber ? 'phone' : 'email');
        
        // Generate fresh OTP to get reference and timer
        await generateOTPForDirectCheckout(data.phoneNumber, data.email);
      } else {
        // Standard checkout - user enters contact
        setCheckoutType('standard');
      }

      if (data.status === 'completed') {
        setStep('success');
      } else if (data.status === 'expired') {
        toast.error('This checkout session has expired');
      }
    } catch (error) {
      if (error instanceof APIError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to load checkout session');
      }
    } finally {
      setLoading(false);
    }
  };

  const generateOTPForDirectCheckout = async (phone?: string, emailAddr?: string) => {
    try {
      const data = await api.generateCheckoutOTP(
        sessionToken,
        phone || '',
        emailAddr,
        6
      );

      setOtpReference(data.reference);
      setOtpExpiresAt(new Date(data.expiresAt));
      setResendCountdown(60);
      setLastResendTime(Date.now());
      setStep('verify');
      toast.success('OTP sent to ' + (phone || emailAddr));
    } catch (error) {
      if (error instanceof APIError) {
        toast.error(error.message);
      } else {
        toast.error('Failed to send OTP');
      }
    }
  };

  const handleGenerateOTP = async () => {
    setPhoneError('');

    if (contactType === 'phone') {
      if (!phoneNumber.trim()) {
        setPhoneError('Phone number is required');
        return;
      }

      // Basic phone validation (Ghana format)
      const phoneRegex = /^(0|\+?233)?[2-9]\d{8}$/;
      if (!phoneRegex.test(phoneNumber.replace(/[\s-]/g, ''))) {
        setPhoneError('Please enter a valid Ghana phone number');
        return;
      }
    } else {
      if (!email.trim()) {
        setPhoneError('Email address is required');
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setPhoneError('Please enter a valid email address');
        return;
      }
    }

    setGenerating(true);

    try {
      const data = await api.generateCheckoutOTP(
        sessionToken,
        contactType === 'phone' ? phoneNumber : '',
        contactType === 'email' ? email : undefined,
        6
      );

      setOtpReference(data.reference);
      setOtpExpiresAt(new Date(data.expiresAt));
      setResendCountdown(60);
      setLastResendTime(Date.now());
      setStep('verify');
      toast.success('OTP sent successfully!');
    } catch (error) {
      if (error instanceof APIError) {
        if (error.status === 429) {
          toast.error('Too many requests. Please wait before requesting another OTP.');
        } else if (error.status === 402) {
          toast.error('Insufficient balance. Please contact support.');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error('Failed to generate OTP');
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleOTPInput = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.slice(0, 6).split('');
      const newInputs = [...otpInputs];
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newInputs[index + i] = digit;
        }
      });
      setOtpInputs(newInputs);

      // Focus last filled input
      const lastIndex = Math.min(index + digits.length - 1, 5);
      document.getElementById(`otp-${lastIndex}`)?.focus();
    } else {
      const newInputs = [...otpInputs];
      newInputs[index] = value;
      setOtpInputs(newInputs);

      // Auto-focus next input
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpInputs[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otp = otpInputs.join('');

    if (otp.length < 6) {
      toast.error('Please enter complete OTP');
      return;
    }

    setVerifying(true);

    try {
      const data = await api.verifyCheckoutOTP(sessionToken, otpReference, otp);

      // Extract first name from full name
      if (data.details?.name) {
        const firstName = data.details.name.split(' ')[0];
        setVerifiedName(firstName);
      }

      if (data.verified && data.redirectUrl) {
        const firstName = data.details?.name?.split(' ')[0] || '';
        toast.success(firstName ? `Welcome ${firstName}! Redirecting...` : 'Verification successful! Redirecting...');
        setTimeout(() => {
          window.location.href = data.redirectUrl!;
        }, 1500);
      } else {
        setStep('success');
      }
    } catch (error) {
      if (error instanceof APIError) {
        if (error.data?.locked) {
          toast.error(error.message);
          setRemainingTries(0);
          
          // Redirect to failure URL after a delay
          if (error.data.redirectUrl) {
            setTimeout(() => {
              window.location.href = error.data.redirectUrl;
            }, 3000);
          }
        } else {
          setFailedAttempts(error.data?.failedAttempts || 0);
          setRemainingTries(error.data?.remainingTries || 0);
          toast.error(`${error.message} (${error.data?.remainingTries || 0} tries left)`);
          
          // Clear OTP inputs
          setOtpInputs(['', '', '', '', '', '']);
          document.getElementById('otp-0')?.focus();
        }
      } else {
        toast.error('Failed to verify OTP');
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCountdown > 0) {
      return;
    }

    setGenerating(true);

    try {
      const data = await api.generateCheckoutOTP(
        sessionToken,
        contactType === 'phone' ? phoneNumber : '',
        contactType === 'email' ? email : undefined,
        6
      );

      setOtpReference(data.reference);
      setOtpExpiresAt(new Date(data.expiresAt));
      setOtpInputs(['', '', '', '', '', '']);
      setResendCountdown(60);
      setLastResendTime(Date.now());
      toast.success('OTP resent successfully!');
      
      // Focus first OTP input
      setTimeout(() => {
        document.getElementById('otp-0')?.focus();
      }, 100);
    } catch (error) {
      if (error instanceof APIError) {
        if (error.status === 429) {
          toast.error('Too many requests. Please wait before requesting another OTP.');
        } else if (error.status === 402) {
          toast.error('Insufficient balance. Please contact support.');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error('Failed to resend OTP');
      }
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 mx-auto mb-4"></div>
          <p className="text-zinc-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <FiAlertCircle />
              Session Not Found
            </CardTitle>
            <CardDescription>
              This checkout session is invalid or has expired.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="space-y-3 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-zinc-900 flex items-center justify-center">
              <FiShield className="text-white text-2xl" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold text-zinc-900">{session.projectName}</CardTitle>
              <CardDescription className="text-zinc-500">Secure OTP Verification</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Phone/Email Input (Standard Checkout Only) */}
          {step === 'phone' && checkoutType === 'standard' && (
            <div className="space-y-6">
              {/* Contact Type Toggle */}
              <div className="flex gap-2 p-1 bg-zinc-100 rounded-lg">
                <button
                  onClick={() => setContactType('phone')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    contactType === 'phone'
                      ? 'bg-white shadow-sm text-zinc-900'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Phone
                </button>
                <button
                  onClick={() => setContactType('email')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    contactType === 'email'
                      ? 'bg-white shadow-sm text-zinc-900'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Email
                </button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact" className="text-sm font-medium text-zinc-700">
                  {contactType === 'phone' ? 'Phone Number' : 'Email Address'}
                </Label>
                {contactType === 'phone' ? (
                  <Input
                    id="contact"
                    type="tel"
                    placeholder="0501234567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="h-12 text-base border-zinc-300 focus:border-zinc-900 focus:ring-zinc-900"
                    disabled={generating}
                  />
                ) : (
                  <Input
                    id="contact"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 text-base border-zinc-300 focus:border-zinc-900 focus:ring-zinc-900"
                    disabled={generating}
                  />
                )}
                {phoneError && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <FiAlertCircle className="text-base" />
                    {phoneError}
                  </p>
                )}
              </div>

              <Button
                onClick={handleGenerateOTP}
                disabled={generating}
                className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-base font-medium transition-all"
              >
                {generating ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  'Continue'
                )}
              </Button>

              <p className="text-center text-sm text-zinc-500 leading-relaxed">
                We'll send a 6-digit verification code to your {contactType === 'phone' ? 'phone' : 'email'}
              </p>
            </div>
          )}

          {/* Step 2: OTP Verification */}
          {step === 'verify' && (
            <div className="space-y-6">
              <div className="text-center space-y-3 pb-2">
                {otpExpiresAt && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100">
                    <FiClock className="text-zinc-600" />
                    <span className="text-sm font-medium text-zinc-900">
                      {timeRemaining}
                    </span>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-sm text-zinc-600">
                    Code sent to
                  </p>
                  <p className="font-semibold text-zinc-900">
                    {contactType === 'phone' ? phoneNumber : email}
                  </p>
                  {checkoutType === 'standard' && (
                    <button
                      onClick={() => {
                        setStep('phone');
                        setOtpInputs(['', '', '', '', '', '']);
                        setFailedAttempts(0);
                        setRemainingTries(3);
                      }}
                      className="text-xs text-zinc-600 hover:text-zinc-900 underline"
                    >
                      Change {contactType === 'phone' ? 'number' : 'email'}
                    </button>
                  )}
                </div>
              </div>

              {remainingTries < 3 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-center gap-2">
                  <FiAlertCircle className="text-amber-600" />
                  <p className="text-sm font-medium text-amber-900">
                    {remainingTries} {remainingTries === 1 ? 'attempt' : 'attempts'} remaining
                  </p>
                </div>
              )}

              <div className="flex justify-center gap-3">
                {otpInputs.map((value, index) => (
                  <Input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value}
                    onChange={(e) => handleOTPInput(index, e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-xl font-bold border-2 border-zinc-300 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900 transition-all"
                    disabled={verifying}
                  />
                ))}
              </div>

              <Button
                onClick={handleVerifyOTP}
                disabled={verifying || otpInputs.some((v) => !v)}
                className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-base font-medium transition-all disabled:opacity-50"
              >
                {verifying ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  'Verify Code'
                )}
              </Button>

              <div className="pt-2">
                <Button
                  onClick={handleResendOTP}
                  disabled={resendCountdown > 0 || generating}
                  variant="outline"
                  className="w-full h-12 text-base font-medium transition-all"
                >
                  {generating ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : resendCountdown > 0 ? (
                    `Resend in ${resendCountdown}s`
                  ) : (
                    'Resend OTP'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <div className="text-center space-y-6 py-8">
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <FiCheckCircle className="text-green-600 text-5xl" />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-bold text-zinc-900">
                  {verifiedName ? `Welcome, ${verifiedName}!` : 'Verified!'}
                </h3>
                <p className="text-base text-zinc-600 leading-relaxed">
                  Your phone number has been verified successfully.
                </p>
              </div>
            </div>
          )}

          {/* Security Badge */}
          <div className="pt-4 border-t border-zinc-200">
            <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
              <FiShield />
              <span>Secured by GateKeeperPro</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
