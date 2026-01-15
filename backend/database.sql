CREATE DATABASE IF NOT EXISTS slep_flota_db;
USE slep_flota_db;

-- Tabla de Usuarios (Funcionarios / Unidades)
CREATE TABLE IF NOT EXISTS USUARIO (
    usu_id INT AUTO_INCREMENT PRIMARY KEY,
    usu_unidad VARCHAR(100) NOT NULL UNIQUE,
    usu_password VARCHAR(255) NOT NULL
);

-- Tabla de Administradores
CREATE TABLE IF NOT EXISTS ADMINISTRADOR (
    adm_id INT AUTO_INCREMENT PRIMARY KEY,
    adm_correo VARCHAR(100) NOT NULL UNIQUE,
    adm_password VARCHAR(255) NOT NULL
);

-- Tabla de Choferes
CREATE TABLE IF NOT EXISTS CHOFER (
    cho_correoinstitucional VARCHAR(100) PRIMARY KEY,
    cho_nombre VARCHAR(100) NOT NULL,
    cho_activo BOOLEAN DEFAULT TRUE
);

-- Tabla de Vehículos
CREATE TABLE IF NOT EXISTS VEHICULO (
    vehi_patente VARCHAR(10) PRIMARY KEY,
    vehi_marca VARCHAR(50) NOT NULL,
    vehi_modelo VARCHAR(50) NOT NULL,
    vehi_capacidad INT NOT NULL,
    vehi_estado ENUM('DISPONIBLE', 'EN RUTA', 'MANTENCION') DEFAULT 'DISPONIBLE'
);

-- Tabla de Tipos de Pasajero
CREATE TABLE IF NOT EXISTS TIPO_PASAJERO (
    tip_id INT AUTO_INCREMENT PRIMARY KEY,
    tip_nombre VARCHAR(50) NOT NULL
);

-- Tabla de Comunas
CREATE TABLE IF NOT EXISTS COMUNA (
    com_id INT AUTO_INCREMENT PRIMARY KEY,
    com_nombre VARCHAR(100) NOT NULL
);

-- Tabla de Lugares
CREATE TABLE IF NOT EXISTS LUGAR (
    lug_id INT AUTO_INCREMENT PRIMARY KEY,
    lug_nombre VARCHAR(150) NOT NULL,
    lug_comunafk INT NOT NULL,
    FOREIGN KEY (lug_comunafk) REFERENCES COMUNA(com_id)
);

-- Tabla de Solicitudes
CREATE TABLE IF NOT EXISTS SOLICITUDES (
    sol_id VARCHAR(36) PRIMARY KEY,
    sol_nombresolicitante VARCHAR(100) NOT NULL,
    sol_fechasalida DATETIME NOT NULL,
    sol_fechallegada DATETIME NOT NULL,
    sol_estado ENUM('PENDIENTE', 'APROBADA', 'RECHAZADA', 'FINALIZADA') DEFAULT 'PENDIENTE',
    sol_unidad VARCHAR(100) NOT NULL,
    sol_motivo TEXT NOT NULL,
    sol_itinerario TEXT,
    sol_tipo VARCHAR(50),
    sol_requierechofer BOOLEAN DEFAULT FALSE,
    sol_kmestimado INT DEFAULT 0,
    sol_observacionrechazo TEXT,
    
    -- Foreign Keys
    sol_idusuariofk INT,
    sol_patentevehiculofk VARCHAR(10),
    sol_correochoferfk VARCHAR(100),
    sol_idadminfk INT,
    
    FOREIGN KEY (sol_idusuariofk) REFERENCES USUARIO(usu_id),
    FOREIGN KEY (sol_patentevehiculofk) REFERENCES VEHICULO(vehi_patente),
    FOREIGN KEY (sol_correochoferfk) REFERENCES CHOFER(cho_correoinstitucional),
    FOREIGN KEY (sol_idadminfk) REFERENCES ADMINISTRADOR(adm_id)
);

-- Tabla de Pasajeros de Solicitud
CREATE TABLE IF NOT EXISTS PASAJEROS (
    pas_id INT AUTO_INCREMENT PRIMARY KEY,
    pas_nombre VARCHAR(100) NOT NULL,
    pas_idsolicitudfk VARCHAR(36) NOT NULL,
    pas_idtipofk INT,
    FOREIGN KEY (pas_idsolicitudfk) REFERENCES SOLICITUDES(sol_id) ON DELETE CASCADE,
    FOREIGN KEY (pas_idtipofk) REFERENCES TIPO_PASAJERO(tip_id)
);

-- Tabla de Destinos de Solicitud
CREATE TABLE IF NOT EXISTS SOLICITUD_DESTINO (
    sde_id INT AUTO_INCREMENT PRIMARY KEY,
    sde_solicitudfk VARCHAR(36) NOT NULL,
    sde_lugarfk INT NOT NULL,
    FOREIGN KEY (sde_solicitudfk) REFERENCES SOLICITUDES(sol_id) ON DELETE CASCADE,
    FOREIGN KEY (sde_lugarfk) REFERENCES LUGAR(lug_id)
);

-- Insertar Datos Iniciales (Seeders)
INSERT INTO TIPO_PASAJERO (tip_nombre) VALUES ('Estudiante'), ('Funcionario'), ('Apoderado');
INSERT INTO COMUNA (com_nombre) VALUES ('Llanquihue'), ('Puerto Varas'), ('Frutillar'), ('Fresia'), ('Los Muermos');
