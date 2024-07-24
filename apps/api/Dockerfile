FROM node:20.10.0-alpine
#Setting env is must as db connection and many internals relay on this
ENV NODE_ENV=production

WORKDIR /app
COPY package*.json ./
RUN npm install --only=production && npm cache clean --force && npm install -g typescript
COPY . .
RUN npm run build

EXPOSE 8000

CMD ["node", "dist/index.js"]
