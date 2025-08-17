FROM denoland/deno:alpine-2.4.2

WORKDIR /app

COPY * ./

RUN deno install

EXPOSE 3000

CMD ["deno", "run", "--env-file", "dev"]

