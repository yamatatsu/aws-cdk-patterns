# M1上で docker buildするとarm最適化されたimageが落ちてきてしまい、ECS上で起動できない
FROM node:lts-alpine3.13@sha256:782e891986f16cc661bfe928d0d163d4d0e6cf5cc05453dff2093c015fcc4a64

WORKDIR /home

COPY . /home

EXPOSE 8000

CMD ["node", "index.js"]
