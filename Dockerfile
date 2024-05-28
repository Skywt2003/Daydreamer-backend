FROM node:21-bookworm

WORKDIR /app
COPY . .

RUN apt-get update
RUN apt-get install python3
RUN npm install

RUN mkdir /data
VOLUME [ "/data" ]

EXPOSE 3000

ENTRYPOINT ["npm", "run"]
CMD ["prod"]
