# Container image for any free Docker host (Hugging Face Spaces, Fly.io, Koyeb,
# Railway, or Render's Docker runtime). Build context is the repository root.
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./

FROM node:20-slim
WORKDIR /app

ENV NODE_ENV=production

# Hosts inject PORT; the server reads it (defaults to 7860).
ENV PORT=7860
EXPOSE 7860
# Bring the built client + server bundle and the production node_modules.
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json


CMD ["npm", "start"]