FROM node:alpine

WORKDIR /app
COPY package.json .
ENV NODE_TLS_REJECT_UNAUTHORIZED='0'
RUN npm install
COPY . .


CMD ["npm", "run", "dev"]
