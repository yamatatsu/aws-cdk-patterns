# M1上で docker buildするとarm最適化されたimageが落ちてきてしまい、ECS上で起動できない
FROM node:lts-alpine3.13@sha256:502cb0fa935ce97d0f72a816bbe31b54fcc1d70e9fc28b858c8f10d653177d0c

WORKDIR /home

COPY . /home

EXPOSE 8000

CMD ["node", "index.js"]
