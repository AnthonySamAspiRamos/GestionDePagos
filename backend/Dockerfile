FROM node:20-alpine

WORKDIR /app

# Instalar dependencias de compilación para módulos nativos (bcrypt)
RUN apk add --no-cache python3 make g++

COPY package*.json ./

# Instalar todas las dependencias compilándolas desde fuente
RUN npm install

COPY . .

# Eliminar node_modules del host (Windows) y reinstalar dentro del contenedor (Alpine/Linux)
RUN rm -rf node_modules && npm install

RUN npm run build

EXPOSE 4000

CMD ["npm", "start"]