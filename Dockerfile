FROM node:18-alpine

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "serve", "--", "--port", "$PORT", "--host", "0.0.0.0"]
