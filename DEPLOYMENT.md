# Deployment Guide

## Quick Start Deployment to Cloudflare Pages

### Step 1: Prepare Your Repository

1. Make sure all your code is committed and pushed to GitHub
2. Ensure your `wrangler.toml` has the correct KV namespace configuration

### Step 2: Create KV Namespace

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** > **KV**
3. Click **Create a namespace**
4. Name it `FINANCE_KV` (or your preferred name)
5. Copy the **Namespace ID**

### Step 3: Update wrangler.toml

Edit `wrangler.toml` and replace the placeholder IDs:

```toml
[[kv_namespaces]]
binding = "FINANCE_KV"
id = "your-actual-namespace-id-here"
preview_id = "your-actual-namespace-id-here"
```

### Step 4: Connect to Cloudflare Pages

1. In Cloudflare Dashboard, go to **Workers & Pages**
2. Click **Create a project** > **Connect to Git**
3. Select your GitHub account and repository
4. Click **Begin setup**

### Step 5: Configure Build Settings

- **Project name**: `plebs-finance` (or your preferred name)
- **Production branch**: `main` (or your default branch)
- **Framework preset**: `Vite` (or leave as None)
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (leave empty)

### Step 6: Configure Environment Variables

1. In your Pages project, go to **Settings** > **Environment variables**
2. Add a new variable:
   - **Variable name**: `FINANCE_KV`
   - **Type**: KV Namespace
   - **Value**: Select your `FINANCE_KV` namespace

### Step 7: Deploy

1. Click **Save and Deploy**
2. Cloudflare will build and deploy your app
3. Your app will be available at `https://your-project-name.pages.dev`

### Step 8: Custom Domain (Optional)

1. In your Pages project, go to **Custom domains**
2. Click **Set up a custom domain**
3. Follow the instructions to add your domain

## Post-Deployment Checklist

- [ ] Test PIN creation (first-time login)
- [ ] Test PIN login
- [ ] Verify KV storage is working (add some data and refresh)
- [ ] Test all major features:
  - [ ] Add cashflow entry
  - [ ] Upload bank statement
  - [ ] Add credit card and plan
  - [ ] Add expense
  - [ ] Add bill
  - [ ] Add goal
  - [ ] Update profile settings
  - [ ] Change PIN

## Troubleshooting

### Build Fails

- Check that `npm run build` works locally
- Verify all dependencies are in `package.json`
- Check build logs in Cloudflare dashboard

### KV Not Working

- Verify KV namespace is created and bound correctly
- Check environment variables in Pages settings
- Ensure the namespace ID in `wrangler.toml` matches your actual namespace

### API Endpoints Not Working

- Verify `functions/api/[[path]].ts` is in the correct location
- Check that routes are configured in `cloudflare.json`
- Review function logs in Cloudflare dashboard

### CORS Issues

- The API functions include CORS headers
- If issues persist, check browser console for specific errors

## Local Testing with Wrangler

To test Cloudflare Functions locally before deploying:

```bash
# Install Wrangler globally
npm install -g wrangler

# Build the project
npm run build

# Run Pages dev server with KV
wrangler pages dev dist --kv FINANCE_KV=your-namespace-id
```

## Continuous Deployment

Once connected to GitHub, Cloudflare Pages will automatically:
- Deploy on every push to the main branch
- Create preview deployments for pull requests
- Show deployment status in GitHub

You can configure branch protection and deployment settings in the Pages dashboard.

