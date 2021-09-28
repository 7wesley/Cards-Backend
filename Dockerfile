FROM node:16

WORKDIR /app

COPY package.json .

COPY package-lock.json .

RUN npm i

COPY . .

EXPOSE 5000

#Commands run when container is run
CMD ["node", "server.js"]