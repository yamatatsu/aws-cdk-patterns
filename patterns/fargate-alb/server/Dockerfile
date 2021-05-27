# M1上で docker buildするとarm最適化されたimageが落ちてきてしまい、ECS上で起動できない
FROM node:lts-alpine3.13@sha256:2180ddb3a3c570599057426e46b2e3875676b9591e9b00e3f3f2b7dde406fb58

WORKDIR /home

COPY . /home

EXPOSE 8000

CMD ["node", "index.js"]
