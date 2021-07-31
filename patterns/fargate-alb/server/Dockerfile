# M1上で docker buildするとarm最適化されたimageが落ちてきてしまい、ECS上で起動できない
FROM node:lts-alpine3.13@sha256:827464075192dd324a0460429c48baa6d9b4589db7d3bb3bd57921471e8b3a62

WORKDIR /home

COPY . /home

EXPOSE 8000

CMD ["node", "index.js"]
