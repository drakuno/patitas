FROM node:22-alpine3.21

WORKDIR /app

COPY *.json ./

RUN npm i

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

