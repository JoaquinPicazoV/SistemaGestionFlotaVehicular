# Sistema de Gestión de Flota Vehicular - SLEP Llanquihue

Este proyecto es una plataforma web para la gestión y solicitud de vehículos institucionales del Servicio Local de Educación Pública (SLEP) Llanquihue. Permite a los funcionarios reservar vehículos para salidas pedagógicas, traslados administrativos y otras actividades.

## 🚀 Tecnologías Utilizadas

### Frontend
- **React** con **Vite**
- **Tailwind CSS** para el diseño
- **Lucide React** para iconos
- **Axios** para peticiones API
- **React Router Dom** para navegación

### Backend
- **Node.js** con **Express**
- **MySQL** (usando `mysql2/promise`)
- **JWT** para autenticación
- **Nodemon** para desarrollo

---

## 🛠️ Configuración e Instalación

### Requisitos Previos
- Node.js instalado
- MySQL Server en ejecución de la base de datos

### 1. Clonar y preparar el Backend
Navega a la carpeta del backend e instala las dependencias:
```bash
cd backend
npm install
```

Crea un archivo `.env` en la raíz de la carpeta `backend` con las siguientes variables:
```env
DB_HOST=host
DB_USER=usuario
DB_PASSWORD=contraseña
DB_NAME=base_de_datos
JWT_SECRET=clave_JWT
ALLOWED_ORIGIN=origen
PORT=puerto
NODE_ENV=entorno
```

Importa el esquema de la base de datos ubicado en `backend/database.sql` en tu servidor MySQL.

### 2. Preparar el Frontend
Navega a la carpeta del frontend e instala las dependencias:
```bash
cd frontend
npm install
```

### 3. Ejecutar el Proyecto
Para iniciar ambos servidores en modo desarrollo:

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

---

## 📄 Licencia
Este proyecto es de uso exclusivo para el SLEP Llanquihue.
