FROM node:16.13.0
WORKDIR /app
COPY ./package.json ./package.json
COPY ./server.js ./server.js
COPY ./utils.js ./utils.js
COPY ./schemas/Activity.js ./schemas/Activity.js
COPY ./schemas/HeartRateZone.js ./schemas/HeartRateZone.js
COPY .env .env
RUN npm install
EXPOSE 3001
CMD ["node", "server.js"]