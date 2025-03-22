# Use the official Bun image
FROM oven/bun:1

# Set working directory
WORKDIR /app

# Copy dependencies and install them
COPY bun.lock package.json ./
RUN bun install --frozen-lockfile

# Copy the rest of your project files
COPY . .

# Set to production environment
ENV NODE_ENV=production

# Expose your service port (adjust if needed)
EXPOSE 3000

# Run your entrypoint TypeScript file directly with Bun
CMD ["bun", "run", "src/index.ts"]
