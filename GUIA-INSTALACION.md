# 📘 Guía de Instalación - Sistema de Reservas de Complejo Deportivo

> **Versión:** 2.0 | **Fecha:** Septiembre 2026 | **Plataforma:** Windows 10/11

---

##  Índice

1. [Requisitos del sistema](#requisitos-del-sistema)
2. [Paso 1: Instalar Node.js](#paso-1-instalar-nodejs)
3. [Paso 2: Instalar Docker Desktop](#paso-2-instalar-docker-desktop)
4. [Paso 3: Instalar Git](#paso-3-instalar-git)
5. [Paso 4: Clonar el repositorio](#paso-4-clonar-el-repositorio)
6. [Paso 5: Configurar variables de entorno](#paso-5-configurar-variables-de-entorno)
7. [Paso 6: Levantar el sistema con Docker](#paso-6-levantar-el-sistema-con-docker)
8. [Paso 7: Verificar el funcionamiento](#paso-7-verificar-el-funcionamiento)
9. [Paso 8: Primer inicio de sesión](#paso-8-primer-inicio-de-sesión)
10. [Problemas frecuentes](#problemas-frecuentes)

---

## Requisitos del sistema

### Software requerido

| Herramienta | Versión mínima | Para qué sirve | Descarga |
|---|---|---|---|
| **Node.js** | v20.x | Ejecutar frontend y backend | https://nodejs.org/es/download |
| **Docker Desktop** | Última versión | Contenedores PostgreSQL, pgAdmin, backend, frontend | https://www.docker.com/products/docker-desktop |
| **Git** | Última versión | Clonar el repositorio | https://git-scm.com/downloads |

### Hardware mínimo

| Componente | Mínimo | Recomendado |
|---|---|---|
| RAM | 4 GB | 8 GB |
| Almacenamiento | 10 GB libres | 20 GB libres |
| CPU | 2 núcleos | 4 núcleos |

### Sistema operativo

- ✅ Windows 10 (64-bit) o Windows 11
- ❌ Windows 7/8 no son compatibles con Docker Desktop

---

## Paso 1: Instalar Node.js

1. **Descargar:**
   - Ve a https://nodejs.org/es/download
   - Descarga el instalador **Windows Installer (.msi)** de la versión **LTS** (Long Term Support)

2. **Instalar:**
   - Ejecuta el instalador descargado
   - Acepta los términos de licencia
   - **IMPORTANTE:** Marca la casilla **"Automatically install the necessary tools"** si aparece
   - Haz clic en **Next** hasta finalizar

3. **Verificar:**
   ```powershell
   node --version
   npm --version
   ```
   Debe mostrar algo como `v20.x.x` y `10.x.x` respectivamente.

---

## Paso 2: Instalar Docker Desktop

1. **Descargar:**
   - Ve a https://www.docker.com/products/docker-desktop
   - Haz clic en **"Download for Windows"**

2. **Instalar:**
   - Ejecuta el instalador
   - **IMPORTANTE:** Cuando pregunte, selecciona **"Use WSL 2 instead of Hyper-V"** (recomendado)
   - Marca **"Add shortcut to desktop"** si lo deseas
   - Espera a que finalice la instalación
   - **Reinicia tu PC** cuando lo solicite

3. **Configurar:**
   - Abre **Docker Desktop** desde el menú inicio
   - Espera a que el motor de Docker inicie (puede tardar 1-2 minutos la primera vez)
   - Verifica que el ícono en la barra de tareas muestre **"Docker Desktop is running"**

4. **Verificar:**
   ```powershell
   docker --version
   docker compose version
   ```
   Ambos deben mostrar una versión válida.

---

## Paso 3: Instalar Git

1. **Descargar:**
   - Ve a https://git-scm.com/downloads
   - Haz clic en **"Windows"**

2. **Instalar:**
   - Ejecuta el instalador descargado
   - Acepta los términos de licencia
   - En **"Adjusting your PATH environment"**, selecciona **"Git from the command line and also from 3rd-party software"** (opción recomendada)
   - En **"Choosing the default editor"**, puedes dejar **Vi** o elegir otro
   - En **"Adjusting the name of the initial branch"**, selecciona **"Override the default branch name for new repositories"** y escribe `main`
   - Continúa con **Next** hasta finalizar

3. **Verificar:**
   ```powershell
   git --version
   ```
   Debe mostrar algo como `git version 2.x.x.windows.1`.

---

## Paso 4: Clonar el repositorio

1. **Abrir PowerShell:**
   - Presiona `Win + X` y selecciona **"Windows PowerShell"** o **"Terminal"**
   - Ve al directorio donde deseas guardar el proyecto, por ejemplo:
     ```powershell
     cd C:\Users\TuUsuario\Documents
     ```

2. **Clonar:**
   ```powershell
   git clone https://github.com/AnthonySamAspiRamos/GestionDePagos.git
   cd GestionDePagos
   ```

3. **Verificar estructura:**
   ```powershell
   dir
   ```
   Debes ver carpetas: `backend/`, `frontend/`, `database/` y archivo `docker-compose.yml`.

---

## Paso 5: Configurar variables de entorno

1. **Crear archivo `.env` del backend:**

   Abre PowerShell en la raíz del proyecto y ejecuta:
   ```powershell
   Copy-Item backend\.env.example backend\.env
   ```

2. **Editar `backend\.env`:**
   - Abre el archivo `backend\.env` con cualquier editor (Bloc de notas, VS Code, etc.)
   - Verifica que tenga estos valores:

   ```env
   PORT=4000
   DB_USER=limber
   DB_PASSWORD=123456
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=bdcomplejodeportivo
   JWT_SECRET=super_secreto_sports_2026_desarrollo
   EMAIL_USER=
   EMAIL_PASS=
   FRONTEND_URL=http://localhost:5173
   ```

   > **Nota:** Los campos `EMAIL_USER` y `EMAIL_PASS` pueden quedar vacíos. La recuperación de contraseña por email no funcionará sin configurar Gmail, pero el resto del sistema funcionará correctamente.

3. **Verificar `frontend\.env`:**
   - El archivo `frontend\.env` ya está configurado. Debe contener:
   ```env
   VITE_API_URL=http://localhost:4000/api
   ```

---

## Paso 6: Levantar el sistema con Docker

1. **Abrir PowerShell como administrador:**
   - Presiona `Win + X` → **"Windows PowerShell (Admin)"** o **"Terminal (Admin)"**

2. **Navegar al proyecto:**
   ```powershell
   cd C:\Users\TuUsuario\Documents\GestionDePagos
   ```

3. **Levantar todos los servicios:**
   ```powershell
   docker compose up -d
   ```

   Este comando descargará las imágenes y creará los contenedores. La primera vez puede tardar **5-10 minutos** dependiendo de tu conexión a internet.

4. **Esperar a que todos los servicios inicien:**
   ```powershell
   Start-Sleep -Seconds 30
   ```

5. **Verificar que todo está corriendo:**
   ```powershell
   docker ps
   ```

   Debes ver **4 contenedores** con estado `Up`:
   | Nombre | Puerto | Servicio |
   |---|---|---|
   | `postgres-db-complejo-deportivo` | 5432 | Base de datos PostgreSQL |
   | `sports_pgadmin` | 5050 | pgAdmin (gestión visual de BD) |
   | `sports_backend` | 4000 | API Backend (Node.js) |
   | `sports_frontend` | 5173 | Frontend (React) |

---

## Paso 7: Verificar el funcionamiento

### Verificar Backend
```powershell
Invoke-WebRequest -Uri "http://localhost:4000/api/health" -UseBasicParsing
```
Debe retornar un JSON con `"status": "OK"`.

### Verificar Frontend
Abre tu navegador y ve a: **http://localhost:5173**

Debes ver la página de inicio del sistema con el texto *"Reservá tu cancha en menos de un minuto."*

### Verificar Base de Datos
1. Abre **http://localhost:5050** (pgAdmin)
2. Inicia sesión con:
   - Email: `admin@sports.com`
   - Contraseña: `admin`
3. Expande **Servers → PostgreSQL 15 → Databases → bdcomplejodeportivo**
4. Debes ver **17 tablas** creadas

---

## Paso 8: Primer inicio de sesión

1. Ve a **http://localhost:5173/login**

2. Usa estas credenciales de prueba:

| Rol | Email | Contraseña | Permisos |
|---|---|---|---|
| **Administrador** | `jorge.fernandez@canchasbo.com` | `123456` | Gestión completa |
| **Administrador** | `carla.mamani@canchasbo.com` | `123456` | Gestión completa |
| **Empleado** | `luis.choque@canchasbo.com` | `123456` | Gestión de reservas |
| **Cliente** | `maria.lopez@gmail.com` | `123456` | Reservar y pagar |

3. **Prueba rápida:**
   - Inicia sesión como **Cliente** (`maria.lopez@gmail.com` / `123456`)
   - Ve a **"Canchas"** desde el dashboard
   - Haz clic en **"Reservar"** en cualquier cancha
   - Selecciona fecha, hora y método de pago
   - Para **Pago Presencial**: la reserva se confirma inmediatamente
   - Para **Pago Virtual** (Tarjeta/QR): debes subir un comprobante (imagen o PDF)

---

## Problemas frecuentes

### ❌ "Docker Desktop no inicia"

**Solución:**
1. Abre **Panel de Control** → **Programas y características** → **Activar o desactivar características de Windows**
2. Asegúrate de que **"Plataforma de máquina virtual"** y **"Hyper-V"** estén marcados
3. Reinicia tu PC
4. Abre Docker Desktop nuevamente

### ❌ "Puerto 5432 ya está en uso"

**Causa:** Tienes PostgreSQL instalado localmente en Windows.

**Solución A - Detener PostgreSQL local:**
```powershell
Get-Service -Name postgresql* | Stop-Service -Force
```

**Solución B - Cambiar puerto en docker-compose.yml:**
Edita `docker-compose.yml` y cambia:
```yaml
ports:
  - "5433:5432"  # ← Cambia 5432 por 5433 en el primer número
```
Y en `backend/.env`:
```env
DB_PORT=5433
```

### ❌ "Puerto 5050 ya está en uso"

**Solución:** Cambia el puerto de pgAdmin en `docker-compose.yml`:
```yaml
ports:
  - "5051:80"  # ← Cambia 5050 por 5051
```

### ❌ "Puerto 4000 o 5173 ya está en uso"

**Solución:**
```powershell
# Encontrar el proceso que usa el puerto
netstat -ano | findstr :4000

# Matar el proceso (reemplaza 12345 por el PID encontrado)
taskkill /PID 12345 /F
```

### ❌ "Module not found" en el frontend

**Solución:**
```powershell
cd frontend
npm install
```

### ❌ "Error al conectar con el servidor" al iniciar sesión

**Causas posibles:**
1. El backend no está corriendo: `docker ps` para verificar
2. El archivo `backend/.env` no existe o está mal configurado
3. La base de datos no está lista: espera 30 segundos más

**Solución:**
```powershell
docker logs sports_backend --tail 20
```
Revisa los errores en el log del backend.

### ❌ "Error de codificación / caracteres especiales"

Este problema fue corregido en la versión actual. Si persiste:
1. Asegúrate de que `backend/.env` está codificado en **UTF-8**
2. Reinicia los contenedores: `docker compose restart`

### ❌ "bcrypt: Exec format error"

**Causa:** Los módulos nativos de bcrypt fueron compilados para Windows en lugar de Linux.

**Solución:** El Dockerfile ya incluye la corrección. Si ocurre:
```powershell
docker compose up -d --build backend
```

### ❌ "duplicate key value violates unique constraint reserva_pkey"

**Solución:** Las secuencias de la base de datos necesitan sincronizarse:
```powershell
docker exec postgres-db-complejo-deportivo psql -U limber -d bdcomplejodeportivo -c "
SELECT setval('reserva_id_reserva_seq', COALESCE((SELECT MAX(id_reserva) FROM reserva), 1));
SELECT setval('cancha_id_cancha_seq', COALESCE((SELECT MAX(id_cancha) FROM cancha), 1));
SELECT setval('usuario_id_usuario_seq', COALESCE((SELECT MAX(id_usuario) FROM usuario), 1));
SELECT setval('pago_id_pago_seq', COALESCE((SELECT MAX(id_pago) FROM pago), 1));
"
```

### ❌ "No puedo ver el comprobante en Verificar Pagos"

**Solución:** Verifica que la carpeta `uploads/comprobantes` existe y tiene permisos:
```powershell
New-Item -ItemType Directory -Force -Path "backend\uploads\comprobantes"
```
Luego reinicia el contenedor del backend:
```powershell
docker compose restart backend
```

---

## 🔄 Comandos útiles del día a día

| Comando | Descripción |
|---|---|
| `docker compose up -d` | Iniciar todos los servicios |
| `docker compose down` | Detener y eliminar todos los servicios |
| `docker compose restart backend` | Reiniciar solo el backend |
| `docker compose restart frontend` | Reiniciar solo el frontend |
| `docker compose logs -f backend` | Ver logs del backend en tiempo real |
| `docker compose logs -f frontend` | Ver logs del frontend en tiempo real |
| `docker ps` | Listar contenedores activos |
| `docker compose ps` | Estado de los servicios del proyecto |

---

## 📞 Soporte

Si encuentras un problema que no está en esta guía:

1. **Revisa los logs del backend:**
   ```powershell
   docker logs sports_backend --tail 50
   ```

2. **Revisa los logs del frontend:**
   ```powershell
   docker logs sports_frontend --tail 50
   ```

3. **Reinicia todo desde cero:**
   ```powershell
   docker compose down -v
   docker compose up -d
   ```
   > **⚠️ Advertencia:** `-v` elimina los datos de la base de datos. Solo úsalo si no te importa perder los datos.

4. **Verifica la conectividad de puertos:**
   ```powershell
   Test-NetConnection -Port 4000
   Test-NetConnection -Port 5173
   Test-NetConnection -Port 5432
   ```

---

##  Documentación adicional

- **Manual del Desarrollador:** Ver `README.md` en la raíz del proyecto
- **Esquema de la base de datos:** Ver `database/01_schema.sql`
- **Datos de prueba:** Ver `database/02_inserts.sql`

---

**¡Listo!** Tu sistema está funcionando. Puedes empezar a crear reservas, gestionar pagos y administrar el complejo deportivo.
