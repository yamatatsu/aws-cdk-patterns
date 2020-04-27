FROM node:alpine

LABEL maintainer="yamatatsu <the.kinnikuman@gmail.com>"

ADD ./index.js /index.js
ADD ./node_modules /node_modules/

EXPOSE 80
EXPOSE 443

CMD node index.js
