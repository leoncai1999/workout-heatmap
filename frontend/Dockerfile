FROM node:16.13.0
WORKDIR /app
COPY ./package.json ./package.json
COPY ./public ./public
COPY ./src ./src
COPY .env .env
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]