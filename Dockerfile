FROM node:alpine AS builder



WORKDIR /app
# install git
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

# install yarn
COPY ./package.json ./
RUN yarn install
COPY . .
RUN yarn run build:prod


FROM node:alpine
WORKDIR /app
COPY --from=builder /app ./

# set timezone to UTC

CMD ["yarn", "run", "start:prod"]