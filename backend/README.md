# DAPI Backend

This is the backend API server for DAPI personalized clothes webapp, built with Express.js.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp env.example .env
```

3. Update `.env` with your actual environment variables:
   - Firebase Admin SDK credentials
   - Razorpay secret keys
   - Google AI API key

4. Run development server:
```bash
npm run dev
```

5. Run production server:
```bash
npm start
```

## Deployment on Render

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set the following environment variables in Render dashboard:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `GOOGLE_AI_API_KEY`
   - `NODE_ENV=production`

4. Deploy!

## API Endpoints

- `GET /health` - Health check
- `POST /api/orders` - Create order
- `GET /api/orders` - Get orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders/save-for-later` - Save order for later
- `GET /api/orders/saved/:id` - Get saved order by ID
- `POST /api/razorpay/create-order` - Create Razorpay order
- `POST /api/razorpay/verify-payment` - Verify payment

## Environment Variables

All environment variables are secret and should not be exposed to the frontend.
