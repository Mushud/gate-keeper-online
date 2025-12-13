# GateKeeperPro Online Checkout

Professional OTP verification checkout interface built with Next.js 15, TypeScript, Tailwind CSS, Ant Design, and shadcn/ui.

## Quick Start

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`

Visit [http://localhost:3001](http://localhost:3001)

## Features

- ✅ Secure OTP verification with 3-strike system
- ✅ Rate limiting (3 OTPs per 5 min per receiver)
- ✅ Automatic callback redirects on success/failure
- ✅ Background name resolution
- ✅ Professional minimal UI with Inter font
- ✅ Real-time OTP expiration timer
- ✅ Responsive design

## Environment Setup

Create `.env.local`:
\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:3000
\`\`\`

## How to Use

1. **Create checkout session** via API (requires project API key)
2. **Redirect user** to the checkout URL
3. **User verifies** phone with OTP
4. **Handle callback** with verified user data

See API documentation for details.
