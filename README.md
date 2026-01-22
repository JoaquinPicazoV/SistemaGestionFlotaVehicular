# Sistema de Gestión de Flota Vehicular - SLEP Llanquihue

Sistema integral para la administración, control y gestión de la flota vehicular del Servicio Local de Educación Pública (SLEP) de Llanquihue.

## 🚀 Características Principales

*   **Gestión de Solicitudes:** Flujo completo de solicitud de vehículos (Pendiente, Aprobada, Rechazada, Finalizada, Cancelada).
*   **Roles de Usuario:**
    *   **Administrador:** Control total, gestión de flota, aprobación de solicitudes y visualización de estadísticas (BI).
    *   **Funcionario:** Creación de solicitudes y seguimiento de estado.
    *   **Chofer:** (En desarrollo) Visualización de rutas asignadas.
*   **Panel de Control (Dashboard):** Métricas en tiempo real sobre uso de flota, kílometros recorridos y disponibilidad.
*   **Gestión de Recursos:** Módulos para administrar Vehículos y Choferes.

## 🛠 Tecnologías Utilizadas

### Backend
*   **Node.js & Express:** Servidor RESTful.
*   **MySQL:** Base de datos relacional.
*   **JWT (JSON Web Tokens):** Autenticación segura.
*   **Express Validator:** Validación estricta de datos.

### Frontend
*   **React + Vite:** Interfaz de usuario rápida y moderna.
*   **Tailwind CSS:** Estilizado ágil y responsivo.
*   **Recharts:** Visualización de datos y gráficas estadísticas.
*   **Framer Motion:** Animaciones fluidas.
*   **React Router:** Navegación SPA.

## 📦 Instalación y Despliegue

### Prerrequisitos
*   Node.js (v18 o superior)
*   MySQL Server

### Configuración del Entorno

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/proyecto-slep.git
    cd proyecto-slep
    ```

2.  **Configurar Backend:**
    ```bash
    cd backend
    npm install
    cp .env.example .env
    # Editar .env con tus credenciales de base de datos
    ```
    *Importante:* Ejecuta el script `database.sql` en tu servidor MySQL para crear la estructura inicial.

3.  **Configurar Frontend:**
    ```bash
    cd ../frontend
    npm install
    cp .env.example .env
    # Verificar que VITE_API_URL apunte a tu backend
    ```

### Ejecución Local

1.  **Iniciar Backend:**
    ```bash
    # En terminal 1 (dentro de /backend)
    npm run dev
    ```

2.  **Iniciar Frontend:**
    ```bash
    # En terminal 2 (dentro de /frontend)
    npm run dev
    ```

## 🔐 Seguridad
El proyecto implementa buenas prácticas de seguridad como:
*   Variables de entorno para credenciales sensibles.
*   Hasheo de contraseñas con `bcryptjs`.
*   Cookies HTTP-Only para el manejo de tokes.

## 📄 Licencia
[Incluir licencia si aplica]
