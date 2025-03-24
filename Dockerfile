FROM node:20-alpine AS build

# set working directory
WORKDIR /app

# copy package.json and package-lock.json
COPY package*.json yarn.lock ./

# install dependencies
RUN yarn install --frozen-lockfile && yarn cache clean

# copy source code
COPY . .

# expose port 8080
EXPOSE 8000

# start app
CMD ["yarn", "run", "start"]