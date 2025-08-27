FROM node:18-alpine

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

EXPOSE 8080

CMD ["yarn", "serve", "--port", "8080", "--host", "0.0.0.0", "dist"]
