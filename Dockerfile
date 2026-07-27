FROM node:20-alpine

WORKDIR /miniflix

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

EXPOSE 3000

CMD ["node", "app.js"]