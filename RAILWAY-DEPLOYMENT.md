#  Railway Deployment Guide

## Quick Start

1. **Push to GitHub** (optional but recommended)
2. **Go to Railway.app** and create new project
3. **Connect GitHub** or deploy manually
4. **Add PostgreSQL** database service
5. **Set environment variables**

## Environment Variables

Add these in Railway Dashboard  Variables:
DATABASE_URL=postgresql://...
PORT=3000
NODE_ENV=production
## Database Setup

Railway will automatically:
1. Create PostgreSQL database
2. Set DATABASE_URL variable
3. Run database migrations

## Manual Database Setup (if needed)

1. In Railway, add "PostgreSQL" service
2. Connect to your app service
3. Railway will auto-set DATABASE_URL

## Troubleshooting

### Database Connection Issues
- Wait 1-2 minutes for Railway to provision DB
- Check Variables tab for DATABASE_URL
- Restart service if needed

### Build Issues
- Check Railway logs for errors
- Ensure package.json has correct scripts
- Node.js version: 18+ recommended

## Features That Work on Railway

 Full CRUD operations
 PDF report generation  
 Barcode creation
 Dark/Light mode
 Advanced filtering
 Ghana Cedis () support
 Mobile responsive design

## Support

For issues:
1. Check Railway logs
2. Verify environment variables
3. Restart the service
4. Contact support@railway.app
