# DAPI Frontend

This is the frontend application for DAPI personalized clothes webapp, built with Next.js.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp env.example .env.local
```

3. Update `.env.local` with your actual environment variables:
   - Firebase configuration
   - Razorpay public key
   - Backend API URL

4. Run development server:
```bash
npm run dev
```

## Deployment on Vercel

1. Connect your GitHub repository to Vercel
2. Set the following environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`
   - `NEXT_PUBLIC_API_URL` (your backend URL)

3. Deploy!

## Environment Variables

All environment variables are prefixed with `NEXT_PUBLIC_` to make them available in the browser.
