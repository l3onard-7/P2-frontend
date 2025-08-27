FROM node:18-alpine

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

RUN npm run build

# Create a simple server.js file
RUN echo "const express = require('express'); \
const path = require('path'); \
const app = express(); \
const PORT = process.env.PORT || 8080; \
\
app.use(express.static(path.join(__dirname, 'dist'))); \
\
app.get('*', (req, res) => { \
  res.sendFile(path.join(__dirname, 'dist', 'index.html')); \
}); \
\
app.listen(PORT, '0.0.0.0', () => { \
  console.log(\`Server running on port \${PORT}\`); \
});" > server.js

# Install express
RUN npm install express

EXPOSE 8080

CMD ["node", "server.js"]