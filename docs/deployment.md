# Deployment Guide: Wedding Invitation Website

## Prerequisites

- GitHub account
- Vercel account (free tier: https://vercel.com)
- MongoDB Atlas account (free tier: https://www.mongodb.com/atlas)

---

## Step 1: Set Up MongoDB Atlas

1. Go to https://www.mongodb.com/atlas and sign up / log in
2. Create a free M0 cluster (choose the region closest to your users)
3. Create a database user:
   - Database Access > Add New Database User
   - Choose password authentication
   - Set username and password (save these)
   - Role: "Read and write to any database"
4. Allow network access from Vercel:
   - Network Access > Add IP Address
   - Click "Allow Access from Anywhere" (adds `0.0.0.0/0`)
   - This is required because Vercel uses dynamic IPs
5. Get your connection string:
   - Clusters > Connect > Drivers
   - Copy the connection string: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/wedding`
   - Replace `<username>` and `<password>` with your database user credentials

## Step 2: Seed the Production Database

1. Update `scripts/seed.js` temporarily — change the `MONGODB_URI` to your Atlas connection string:
   ```javascript
   const MONGODB_URI = "mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/wedding";
   ```
2. Run the seed script:
   ```
   node scripts/seed.js
   ```
3. Verify data was created (optional):
   - Go to Atlas dashboard > Browse Collections
   - You should see `wedding`, `rsvps`, and `wishes` collections
4. Change `MONGODB_URI` back to `mongodb://localhost:27017/wedding` in the seed script

## Step 3: Push to GitHub

1. Initialize git (if not already):
   ```
   git init
   ```

2. Make sure `.gitignore` includes:
   ```
   node_modules/
   .next/
   .env.local
   .env*.local
   ```

3. Commit all files:
   ```
   git add .
   git commit -m "wedding invitation website"
   ```

4. Create a new repository on GitHub:
   - Go to https://github.com/new
   - Name it `wedding-invitation` (or whatever you prefer)
   - Keep it private if you want
   - Don't initialize with README (you already have code)

5. Push to GitHub:
   ```
   git remote add origin https://github.com/YOUR_USERNAME/wedding-invitation.git
   git branch -M main
   git push -u origin main
   ```

## Step 4: Deploy on Vercel

1. Go to https://vercel.com and sign up with your GitHub account
2. Click "Add New..." > "Project"
3. Import your `wedding-invitation` repository from GitHub
4. Configure the project:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `next build` (default)
   - Output Directory: `.next` (default)

5. Add Environment Variables (click "Environment Variables" section):

   | Name | Value |
   |------|-------|
   | `MONGODB_URI` | `mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/wedding` |
   | `ADMIN_PASSWORD_HASH` | Your base64-encoded bcrypt hash (same as `.env.local`) |
   | `JWT_SECRET` | A random secret string (e.g., `my-production-jwt-secret-2024`) |
   | `GOOGLE_DRIVE_FOLDER_ID` | Your Google Drive folder ID (if using Google Drive for images) |
   | `GOOGLE_SERVICE_ACCOUNT_KEY` | Your Google service account JSON key (if using Google Drive) |

   Note: `NEXT_PUBLIC_BASE_URL` is NOT needed — Vercel handles this automatically.

6. Click "Deploy"
7. Wait for the build to complete (usually 1-2 minutes)
8. Your site is live at `https://your-project-name.vercel.app`

## Step 5: Upload Local Images to Production

Since local images in `public/images/` are included in the deployment, they'll work automatically on Vercel. No extra steps needed for local images.

If you want to use Google Drive for images in production:
1. Set up a Google Cloud service account
2. Share a Google Drive folder with the service account email
3. Add the `GOOGLE_DRIVE_FOLDER_ID` and `GOOGLE_SERVICE_ACCOUNT_KEY` env vars in Vercel
4. Upload images through the admin panel

## Step 6: Custom Domain (Optional)

1. Buy a domain from a registrar:
   - Namecheap: https://www.namecheap.com
   - Google Domains: https://domains.google
   - GoDaddy: https://www.godaddy.com
   - Suggested: `yournames.com` or `yournames.wedding` (~$10-15/year)

2. Add domain in Vercel:
   - Go to your project > Settings > Domains
   - Enter your domain name and click "Add"
   - Vercel will show you DNS records to configure

3. Configure DNS at your registrar:
   - For apex domain (e.g., `yournames.com`):
     - Add an `A` record pointing to `76.76.21.21`
   - For subdomain (e.g., `www.yournames.com`):
     - Add a `CNAME` record pointing to `cname.vercel-dns.com`

4. Wait for DNS propagation (usually 5-30 minutes, can take up to 48 hours)
5. Vercel automatically provisions SSL certificate — your site will be HTTPS

## Step 7: Ongoing Updates

After initial deployment, any changes you push to GitHub will auto-deploy:

```
git add .
git commit -m "update wedding content"
git push
```

Vercel will automatically build and deploy the new version within 1-2 minutes.

## Troubleshooting

### Build fails on Vercel
- Check the build logs in Vercel dashboard
- Most common issue: missing environment variables
- Make sure all env vars are set in Vercel project settings

### Database connection fails
- Verify MongoDB Atlas Network Access allows `0.0.0.0/0`
- Check the connection string is correct (username, password, cluster name)
- Make sure the database user has read/write permissions

### Images not loading
- Local images in `public/images/` should work automatically
- For Google Drive images, verify the service account has access to the folder
- Check `next.config.js` has the correct image domains

### Admin login not working
- Verify `ADMIN_PASSWORD_HASH` env var is set correctly in Vercel
- The hash must be base64-encoded (same format as your `.env.local`)
- Verify `JWT_SECRET` is set

### Custom domain not working
- DNS propagation can take up to 48 hours
- Verify DNS records are correct using https://dnschecker.org
- Make sure you added the domain in Vercel project settings
