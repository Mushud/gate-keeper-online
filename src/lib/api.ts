// API Service for GateKeeperPro Backend

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://8r3g5y61oh.execute-api.eu-west-1.amazonaws.com';

export interface CheckoutSession {
  sessionToken: string;
  projectName: string;
  status: 'pending' | 'completed' | 'failed' | 'expired' | 'cancelled';
  phoneNumber?: string;
  email?: string;
  expiresAt: string;
  metadata?: Record<string, any>;
}

export interface GenerateOTPResponse {
  message: string;
  reference: string;
  expiresAt: string;
}

export interface VerifyOTPResponse {
  message: string;
  verified: boolean;
  redirectUrl?: string;
  details?: {
    receiver: string;
    name?: string;
    email?: string;
    type: string;
    reference: string;
  };
  failedAttempts?: number;
  remainingTries?: number;
  locked?: boolean;
  error?: string;
}

export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new APIError(
      response.status,
      data.error || data.message || 'An error occurred',
      data
    );
  }

  return data;
}

export const api = {
  // Get checkout session details
  getCheckoutSession: async (sessionToken: string): Promise<CheckoutSession> => {
    return fetchAPI(`/api/checkout/${sessionToken}`);
  },

  // Generate OTP for checkout
  generateCheckoutOTP: async (
    sessionToken: string,
    phoneNumber: string,
    email?: string,
    size?: number
  ): Promise<GenerateOTPResponse> => {
    return fetchAPI('/api/checkout/generate_otp', {
      method: 'POST',
      body: JSON.stringify({
        sessionToken,
        phoneNumber,
        email,
        size: size || 6,
      }),
    });
  },

  // Verify OTP for checkout
  verifyCheckoutOTP: async (
    sessionToken: string,
    reference: string,
    otp: string
  ): Promise<VerifyOTPResponse> => {
    return fetchAPI('/api/checkout/verify_otp', {
      method: 'POST',
      body: JSON.stringify({
        sessionToken,
        reference,
        otp,
      }),
    });
  },
};
