# File: Dockerfile
# Path: services/login-consent-app/Dockerfile
# Purpose: Configuration for building the login-consent-app Docker container
# Last change: Initial creation of the Dockerfile for the login-consent-app service

FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"] 