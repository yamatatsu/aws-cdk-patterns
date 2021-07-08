# M1上で docker buildするとarm最適化されたimageが落ちてきてしまい、ECS上で起動できない
FROM node:lts-alpine3.13@sha256:149142dd37d6ed189ac25d30684f271fb0966d8e64c725f86b0a94f1e4ff756d

WORKDIR /home

COPY . /home

EXPOSE 8000

CMD ["node", "index.js"]
