FROM node:22-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend/prisma ./prisma
COPY backend/prisma.config.ts ./
COPY backend/tsconfig.json ./
COPY backend/src ./src
RUN npx prisma generate
RUN npx tsc

FROM node:22-alpine
WORKDIR /app

# Backend production deps
COPY backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm ci --omit=dev

# Copy compiled backend + prisma
COPY --from=backend-build /app/backend/dist ./backend/dist
COPY --from=backend-build /app/backend/prisma ./backend/prisma
COPY --from=backend-build /app/backend/node_modules/.prisma ./backend/node_modules/.prisma
COPY --from=backend-build /app/backend/node_modules/@prisma ./backend/node_modules/@prisma

# Copy frontend
COPY dist ./dist
COPY server.js ./

EXPOSE 3000
CMD ["node", "server.js"]
