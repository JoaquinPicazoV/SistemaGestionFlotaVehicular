# Sistema de Gestión de Flota Vehicular (SLEP)

Este sistema permite la gestión de solicitudes de vehículos, choferes y bitácoras para el Servicio Local de Educación Pública (SLEP) Llanquihue.

## Estructura del Proyecto

El proyecto está dividido en dos partes principales:

- **backend/**: Servidor API RESTful construido con Node.js, Express y MySQL.
- **frontend/**: Aplicación web construida con React y Vite.

## Requisitos Previos

- [Node.js](https://nodejs.org/) (v14 o superior recomendado)
- [MySQL](https://www.mysql.com/)

## Configuración e Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd proyecto-slep
```

### 2. Configuración del Backend

Navega a la carpeta `backend` e instala las dependencias:

```bash
cd backend
npm install
```

Crea un archivo `.env` basado en el ejemplo:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales de base de datos y configuración local.

#### Base de Datos

Importa el esquema y datos iniciales en tu servidor MySQL. Puedes usar el archivo `database.sql` incluido en la carpeta `backend`:

```bash
mysql -u root -p < database.sql
```

Esto creará la base de datos `slep_flota_db` y las tablas necesarias.

### 3. Configuración del Frontend

Navega a la carpeta `frontend` e instala las dependencias:

```bash
cd ../frontend
npm install
```

Crea un archivo `.env` (si es necesario cambiar la URL de la API):

```bash
cp .env.example .env
```

## Ejecución

### Backend

En la carpeta `backend`:

```bash
npm run dev
# O para producción
npm start
```

El servidor correrá por defecto en `http://localhost:4000`.

### Frontend

En la carpeta `frontend`:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

## Seguridad

- **Variables de Entorno**: Nunca subas el archivo `.env` al repositorio. Utiliza `.env.example` para compartir la estructura.
- **Credenciales**: Asegúrate de usar contraseñas seguras para la base de datos y un `JWT_SECRET` complejo en producción.

## Licencia

[Incluir Licencia si aplica]
