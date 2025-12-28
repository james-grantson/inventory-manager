# Use Node.js LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy application files
COPY . .

# Build if needed (adjust for your setup)
# RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "server.js"]
