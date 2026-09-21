# 📘 Manual del Desarrollador — Sistema de Reservas Complejo Deportivo

> Para el equipo que continúa con las iteraciones.

---

## ✅ Requisitos previos (instalar una sola vez)

| Herramienta        | Para qué sirve            | Descarga                                       |
| ------------------ | ------------------------- | ---------------------------------------------- |
| **Node.js v20+**   | Correr frontend y backend | https://nodejs.org                             |
| **Docker Desktop** | Base de datos PostgreSQL  | https://www.docker.com/products/docker-desktop |
| **Git**            | Control de versiones      | https://git-scm.com                            |

---

## 🚀 Cómo poner en marcha el proyecto (primera vez)

### Paso 1 — Clonar el repositorio

```bash
git clone https://github.com/Roberto-Carlos01/Sistema-de-Reservas---Complejo-deportivo-.git
cd Sistema-de-Reservas---Complejo-deportivo-
```

### Paso 2 — Configurar variables de entorno del backend

```bash
# Dentro de la carpeta backend/
cp .env.example .env
```

Luego abrir el archivo `backend/.env` y completar con los datos reales:

```env
DB_USER=limber
DB_PASSWORD=123456
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bdcomplejodeportivo
JWT_SECRET=super_secreto_sports_2026_desarrollo
```

### Paso 3 — Levantar la base de datos con Docker

```bash
# Desde la raíz del proyecto
docker compose up -d db
```

Esperar ~10 segundos a que PostgreSQL inicialice. Verificar que está corriendo:

```bash
docker ps
```

Debe aparecer el contenedor `postgres-db-complejo-deportivo` con estado `Up`.

> **Primera vez solamente:** Docker creará automáticamente la BD, las tablas y los datos de prueba desde `database/01_schema.sql` y `database/02_inserts.sql`.

### Paso 4 — Instalar dependencias e iniciar el backend

```bash
cd backend
npm install
npm run dev
```

Deberías ver:

```
✅ [PostgreSQL] Conexión exitosa a la base de datos 'bdcomplejodeportivo'
🚀 Servidor backend escuchando en: http://localhost:4000
```

### Paso 5 — Instalar dependencias e iniciar el frontend

En una **nueva terminal**:

```bash
cd frontend
npm install
npm run dev
```

Deberías ver:

```
VITE ready in ...ms
➜  Local: http://localhost:5173/
```

---

## 🔑 Usuarios de prueba

| Email                           | Contraseña | Rol           |
| ------------------------------- | ---------- | ------------- |
| `carla.mamani@canchasbo.com`    | `123456`   | Administrador |
| `jorge.fernandez@canchasbo.com` | `123456`   | Administrador |
| `luis.choque@canchasbo.com`     | `123456`   | Empleado      |
| `maria.lopez@gmail.com`         | `123456`   | Cliente       |

> Los administradores pueden gestionar canchas, empleados y usuarios.

---

## 📁 Estructura del proyecto

```
Sistema-de-Reservas-CD/
├── backend/               ← API REST (Node.js + TypeScript + Express)
│   ├── src/
│   │   ├── config/        ← database.ts (conexión PostgreSQL)
│   │   ├── controllers/   ← lógica de cada endpoint
│   │   ├── models/        ← queries SQL a la BD
│   │   ├── routes/        ← definición de rutas
│   │   ├── services/      ← lógica de negocio
│   │   ├── middlewares/   ← autenticación JWT
│   │   └── server.ts      ← punto de entrada
│   ├── .env               ← ⚠️ NO subir al repo (credenciales)
│   └── .env.example       ← ✅ plantilla de variables de entorno
│
├── frontend/              ← Interfaz de usuario (React + TypeScript + Vite)
│   └── src/
│       ├── components/    ← componentes reutilizables
│       │   ├── landing/   ← Hero, Navbar, Footer (página principal)
│       │   ├── canchas/   ← gestión de canchas (solo admin)
│       │   └── usuarios/  ← gestión de usuarios (solo admin)
│       ├── pages/         ← páginas principales
│       └── styles/        ← estilos globales
│
├── database/              ← Scripts SQL de inicialización
│   ├── 01_schema.sql      ← Estructura de tablas
│   └── 02_inserts.sql     ← Datos de prueba (seeders)
│
└── docker-compose.yml     ← Orquestación de todos los servicios
```

## 🔄 Flujo de trabajo con Git

### Antes de empezar a trabajar

```bash
git pull origin main        # Traer los últimos cambios
```

### Mientras trabajas (guardar avances frecuentemente)

```bash
git add .
git commit -m "feat: descripción de lo que hice"
git push origin main
```

### Mensajes de commit recomendados

- `feat: agrego animación al hero`
- `fix: corrijo alineación del navbar en móvil`
- `style: mejoro paleta de colores del dashboard`
- `refactor: reorganizo componentes del footer`

### Si hay conflictos al hacer push

```bash
git pull origin main        # Traer cambios del compañero
# Resolver conflictos en los archivos marcados
git add .
git commit -m "merge: resolución de conflictos"
git push origin main
```

---

## 🛠️ Comandos útiles del día a día

```bash
# Reiniciar solo la base de datos (si algo se rompe)
docker compose restart db

# Ver logs de la BD
docker logs postgres-db-complejo-deportivo

# Reiniciar TODA la app con Docker
docker compose down
docker compose up -d

# Reconstruir después de cambios en backend (solo si usas Docker completo)
docker compose up -d --build backend
```

---

## ❓ Problemas frecuentes y soluciones

### "Cannot connect to database"

```bash
docker ps   # ¿Está corriendo el contenedor de postgres?
docker compose up -d db   # Si no, levantarlo
```

### "Port 4000 already in use"

```powershell
netstat -ano | findstr :4000    # Ver qué proceso usa el puerto
taskkill /PID <numero> /F       # Matar ese proceso
```

### "Module not found" en el frontend

```bash
cd frontend
npm install   # Reinstalar dependencias
```

### El backend no encuentra el `.env`

- Verificar que el archivo se llama exactamente `.env` (no `.env.txt`)
- Debe estar dentro de la carpeta `backend/`

---

## 📞 Arquitectura del sistema (resumen)

```
[Usuario en el navegador]
         ↓ http://localhost:5173
    [Frontend - React]
         ↓ peticiones HTTP a /api/...
    [Backend - Express]
         ↓ queries SQL
    [PostgreSQL en Docker]
```

**Autenticación:** JWT (JSON Web Token) — el token se guarda en `localStorage` y se envía en cada petición con el header `Authorization: Bearer <token>`.

---
