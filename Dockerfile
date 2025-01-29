FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

# Copy the rest of the application files, excluding .env
# The exclusion of .env is handled by a .dockerignore file
COPY . .

CMD ["npm", "run", "work"]

