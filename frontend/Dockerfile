FROM node:20-alpine
WORKDIR /app

# Copia solo package.json (NO el package-lock.json)
COPY package.json ./

# Genera un package-lock.json válido para Linux/Alpine
RUN npm install --package-lock-only

# Ahora sí, instala con el lockfile correcto
RUN npm ci

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]