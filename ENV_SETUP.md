# Environment Variables Setup

## Local Development

1. Create a `.env.local` file in the root of your project:

```bash
VITE_SUPABASE_URL=your-supabase-url-here
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-supabase-anon-key-here
VITE_PAYSTACK_PUBLIC_KEY=your-paystack-public-key-here
```

2. Get your Supabase credentials:
   - Go to your [Supabase project](https://app.supabase.com)
   - Click on Settings → API
   - Copy the `Project URL` and `anon public` key

3. Get your Paystack credentials:
   - Go to [Paystack Dashboard](https://dashboard.paystack.com)
   - Copy your public key from Settings → API Keys

## Netlify Deployment

### Setting Environment Variables:

1. Go to your Netlify site dashboard
2. Click **Site Settings** → **Build & Deploy** → **Environment**
3. Click **Add environment variables**
4. Add each variable:

| Variable Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase Project URL |
| `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Your Supabase Anon Key |
| `VITE_PAYSTACK_PUBLIC_KEY` | Your Paystack Public Key |

### How to find Supabase credentials:

1. Log in to [Supabase](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - `Project URL` → Use as `VITE_SUPABASE_URL`
   - `Anon public` key → Use as `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

### After adding variables:

- Click **Save**
- Redeploy your site (or wait for automatic redeploy)
- Your app should now work correctly!

## Troubleshooting

**Error: "Cannot read properties of null (reading 'charAt')"**

This indicates environment variables are not set. Check:
1. All three environment variables are added in Netlify
2. Variable names are spelled exactly as shown
3. Values are complete (no truncation)
4. Redeploy after adding variables

**Error: "Missing required environment variables"**

Check the browser console (F12 → Console) for the exact error message showing which variables are missing.
