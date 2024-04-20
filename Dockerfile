FROM node:21-alpine

WORKDIR /app
COPY . .

RUN npm install

ENV COOKIE_DOMAIN localhost
ENV COOKIE_KEYS fCwMe7hF8noeJ79z,AVbeXFfWfet2voM8,gs2tgsNMakzHSt56
RUN mkdir /data
VOLUME ["/data"]
EXPOSE 3000

CMD ["npm", "run", "prod"]
