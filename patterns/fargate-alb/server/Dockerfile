# M1上で docker buildするとarm最適化されたimageが落ちてきてしまい、ECS上で起動できない
FROM node:lts-alpine3.13

WORKDIR /home

COPY . /home

EXPOSE 8000

CMD ["node", "index.js"]
