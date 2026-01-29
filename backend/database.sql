-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 29-01-2026 a las 14:39:48
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `slep_flota_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `administrador`
--

CREATE TABLE `administrador` (
  `adm_id` int(11) NOT NULL,
  `adm_correo` varchar(200) DEFAULT NULL,
  `adm_password` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `bitacora_vehiculo`
--

CREATE TABLE `bitacora_vehiculo` (
  `bit_id` int(11) NOT NULL,
  `bit_patentevehiculofk` varchar(10) NOT NULL,
  `bit_fecha` datetime NOT NULL,
  `bit_funcionario_responsable` varchar(100) NOT NULL,
  `bit_kilometraje` int(11) NOT NULL,
  `bit_evento` varchar(100) NOT NULL,
  `bit_mecanico` varchar(100) DEFAULT NULL,
  `bit_valor_mantencion` int(11) DEFAULT 0,
  `bit_observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `chofer`
--

CREATE TABLE `chofer` (
  `cho_correoinstitucional` varchar(200) NOT NULL,
  `cho_nombre` varchar(200) NOT NULL,
  `cho_activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comuna`
--

CREATE TABLE `comuna` (
  `com_id` int(11) NOT NULL,
  `com_nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `establecimiento`
--

CREATE TABLE `establecimiento` (
  `est_id` int(11) NOT NULL COMMENT 'RBD o ID Oficial',
  `est_nombre` varchar(150) NOT NULL,
  `est_comunafk` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lugar`
--

CREATE TABLE `lugar` (
  `lug_id` int(11) NOT NULL,
  `lug_nombre` varchar(150) NOT NULL,
  `lug_comunafk` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pasajeros`
--

CREATE TABLE `pasajeros` (
  `pas_id` int(11) NOT NULL,
  `pas_nombre` varchar(100) NOT NULL,
  `pas_idsolicitudfk` char(36) NOT NULL,
  `pas_idtipofk` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `solicitudes`
--

CREATE TABLE `solicitudes` (
  `sol_id` char(36) NOT NULL,
  `sol_nombresolicitante` varchar(100) DEFAULT NULL,
  `sol_fechasalida` datetime DEFAULT NULL,
  `sol_fechallegada` datetime DEFAULT NULL,
  `sol_estado` varchar(20) DEFAULT 'PENDIENTE',
  `sol_kmestimado` int(11) DEFAULT NULL,
  `sol_unidad` varchar(100) DEFAULT NULL,
  `sol_motivo` text DEFAULT NULL,
  `sol_observacionrechazo` text DEFAULT NULL,
  `sol_requierechofer` tinyint(1) DEFAULT 0,
  `sol_solicitanteasiste` tinyint(1) DEFAULT 1,
  `sol_idusuariofk` int(11) DEFAULT NULL,
  `sol_idadminfk` int(11) DEFAULT NULL,
  `sol_patentevehiculofk` varchar(8) DEFAULT NULL,
  `sol_correochoferfk` varchar(200) DEFAULT NULL,
  `sol_itinerario` text DEFAULT NULL,
  `sol_tipo` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `solicitud_destino`
--

CREATE TABLE `solicitud_destino` (
  `sde_id` int(11) NOT NULL,
  `sde_solicitudfk` char(36) NOT NULL,
  `sde_lugarfk` int(11) DEFAULT NULL,
  `sde_establecimientofk` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_pasajero`
--

CREATE TABLE `tipo_pasajero` (
  `tip_id` int(11) NOT NULL,
  `tip_nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `usu_id` int(11) NOT NULL,
  `usu_unidad` varchar(100) DEFAULT NULL,
  `usu_password` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vehiculo`
--

CREATE TABLE `vehiculo` (
  `vehi_patente` varchar(8) NOT NULL,
  `vehi_marca` varchar(50) DEFAULT NULL,
  `vehi_modelo` varchar(50) DEFAULT NULL,
  `vehi_capacidad` int(11) DEFAULT NULL,
  `vehi_estado` enum('DISPONIBLE','EN RUTA','MANTENCION','DE BAJA') DEFAULT 'DISPONIBLE',
  `vehi_anio` int(11) DEFAULT NULL,
  `vehi_color` varchar(30) DEFAULT NULL,
  `vehi_tipo` varchar(50) NOT NULL DEFAULT 'Vehículo',
  `vehi_motor` varchar(50) DEFAULT NULL,
  `vehi_chasis` varchar(50) DEFAULT NULL,
  `vehi_capacidad_carga` varchar(50) DEFAULT NULL,
  `vehi_inventario` varchar(50) DEFAULT NULL,
  `vehi_propietario` varchar(100) DEFAULT 'SERVICIO LOCAL DE LLANQUIHUE',
  `vehi_resolucion` varchar(100) DEFAULT NULL,
  `vehi_lugaraparcamiento` varchar(150) DEFAULT NULL,
  `vehi_poliza` varchar(100) DEFAULT NULL,
  `vehi_multas` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `administrador`
--
ALTER TABLE `administrador`
  ADD PRIMARY KEY (`adm_id`),
  ADD UNIQUE KEY `adm_correo` (`adm_correo`);

--
-- Indices de la tabla `bitacora_vehiculo`
--
ALTER TABLE `bitacora_vehiculo`
  ADD PRIMARY KEY (`bit_id`),
  ADD KEY `bit_patentevehiculofk` (`bit_patentevehiculofk`);

--
-- Indices de la tabla `chofer`
--
ALTER TABLE `chofer`
  ADD PRIMARY KEY (`cho_correoinstitucional`);

--
-- Indices de la tabla `comuna`
--
ALTER TABLE `comuna`
  ADD PRIMARY KEY (`com_id`);

--
-- Indices de la tabla `establecimiento`
--
ALTER TABLE `establecimiento`
  ADD PRIMARY KEY (`est_id`),
  ADD KEY `est_comunafk` (`est_comunafk`);

--
-- Indices de la tabla `lugar`
--
ALTER TABLE `lugar`
  ADD PRIMARY KEY (`lug_id`),
  ADD KEY `lug_comunafk` (`lug_comunafk`);

--
-- Indices de la tabla `pasajeros`
--
ALTER TABLE `pasajeros`
  ADD PRIMARY KEY (`pas_id`),
  ADD KEY `pas_idsolicitudfk` (`pas_idsolicitudfk`),
  ADD KEY `pas_idtipofk` (`pas_idtipofk`);

--
-- Indices de la tabla `solicitudes`
--
ALTER TABLE `solicitudes`
  ADD PRIMARY KEY (`sol_id`),
  ADD KEY `sol_idusuariofk` (`sol_idusuariofk`),
  ADD KEY `sol_idadminfk` (`sol_idadminfk`),
  ADD KEY `sol_patentevehiculofk` (`sol_patentevehiculofk`),
  ADD KEY `sol_correochoferfk` (`sol_correochoferfk`);

--
-- Indices de la tabla `solicitud_destino`
--
ALTER TABLE `solicitud_destino`
  ADD PRIMARY KEY (`sde_id`),
  ADD KEY `sde_solicitudfk` (`sde_solicitudfk`),
  ADD KEY `sde_lugarfk` (`sde_lugarfk`),
  ADD KEY `sde_establecimientofk` (`sde_establecimientofk`);

--
-- Indices de la tabla `tipo_pasajero`
--
ALTER TABLE `tipo_pasajero`
  ADD PRIMARY KEY (`tip_id`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`usu_id`);

--
-- Indices de la tabla `vehiculo`
--
ALTER TABLE `vehiculo`
  ADD PRIMARY KEY (`vehi_patente`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `administrador`
--
ALTER TABLE `administrador`
  MODIFY `adm_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `bitacora_vehiculo`
--
ALTER TABLE `bitacora_vehiculo`
  MODIFY `bit_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `comuna`
--
ALTER TABLE `comuna`
  MODIFY `com_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `lugar`
--
ALTER TABLE `lugar`
  MODIFY `lug_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pasajeros`
--
ALTER TABLE `pasajeros`
  MODIFY `pas_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `solicitud_destino`
--
ALTER TABLE `solicitud_destino`
  MODIFY `sde_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tipo_pasajero`
--
ALTER TABLE `tipo_pasajero`
  MODIFY `tip_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `usu_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `bitacora_vehiculo`
--
ALTER TABLE `bitacora_vehiculo`
  ADD CONSTRAINT `bitacora_vehiculo_ibfk_1` FOREIGN KEY (`bit_patentevehiculofk`) REFERENCES `vehiculo` (`vehi_patente`) ON DELETE CASCADE;

--
-- Filtros para la tabla `establecimiento`
--
ALTER TABLE `establecimiento`
  ADD CONSTRAINT `establecimiento_ibfk_1` FOREIGN KEY (`est_comunafk`) REFERENCES `comuna` (`com_id`);

--
-- Filtros para la tabla `lugar`
--
ALTER TABLE `lugar`
  ADD CONSTRAINT `lugar_ibfk_1` FOREIGN KEY (`lug_comunafk`) REFERENCES `comuna` (`com_id`);

--
-- Filtros para la tabla `pasajeros`
--
ALTER TABLE `pasajeros`
  ADD CONSTRAINT `pasajeros_ibfk_1` FOREIGN KEY (`pas_idsolicitudfk`) REFERENCES `solicitudes` (`sol_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pasajeros_ibfk_2` FOREIGN KEY (`pas_idtipofk`) REFERENCES `tipo_pasajero` (`tip_id`);

--
-- Filtros para la tabla `solicitudes`
--
ALTER TABLE `solicitudes`
  ADD CONSTRAINT `solicitudes_ibfk_1` FOREIGN KEY (`sol_idusuariofk`) REFERENCES `usuario` (`usu_id`),
  ADD CONSTRAINT `solicitudes_ibfk_2` FOREIGN KEY (`sol_idadminfk`) REFERENCES `administrador` (`adm_id`),
  ADD CONSTRAINT `solicitudes_ibfk_3` FOREIGN KEY (`sol_patentevehiculofk`) REFERENCES `vehiculo` (`vehi_patente`),
  ADD CONSTRAINT `solicitudes_ibfk_4` FOREIGN KEY (`sol_correochoferfk`) REFERENCES `chofer` (`cho_correoinstitucional`);

--
-- Filtros para la tabla `solicitud_destino`
--
ALTER TABLE `solicitud_destino`
  ADD CONSTRAINT `solicitud_destino_ibfk_1` FOREIGN KEY (`sde_solicitudfk`) REFERENCES `solicitudes` (`sol_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `solicitud_destino_ibfk_2` FOREIGN KEY (`sde_lugarfk`) REFERENCES `lugar` (`lug_id`),
  ADD CONSTRAINT `solicitud_destino_ibfk_3` FOREIGN KEY (`sde_establecimientofk`) REFERENCES `establecimiento` (`est_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;


-- Insertar Datos Iniciales (Seeders)
-- Tipos de Pasajero
INSERT INTO TIPO_PASAJERO (tip_nombre) VALUES ('Funcionario') ON DUPLICATE KEY UPDATE tip_nombre=tip_nombre;
INSERT INTO TIPO_PASAJERO (tip_nombre) VALUES ('Alumno') ON DUPLICATE KEY UPDATE tip_nombre=tip_nombre;
INSERT INTO TIPO_PASAJERO (tip_nombre) VALUES ('Docente') ON DUPLICATE KEY UPDATE tip_nombre=tip_nombre;
INSERT INTO TIPO_PASAJERO (tip_nombre) VALUES ('Otro') ON DUPLICATE KEY UPDATE tip_nombre=tip_nombre;

-- Comunas Base
INSERT INTO COMUNA (com_nombre) VALUES ('Llanquihue') ON DUPLICATE KEY UPDATE com_nombre=com_nombre;
INSERT INTO COMUNA (com_nombre) VALUES ('Puerto Varas') ON DUPLICATE KEY UPDATE com_nombre=com_nombre;
INSERT INTO COMUNA (com_nombre) VALUES ('Frutillar') ON DUPLICATE KEY UPDATE com_nombre=com_nombre;
INSERT INTO COMUNA (com_nombre) VALUES ('Fresia') ON DUPLICATE KEY UPDATE com_nombre=com_nombre;
INSERT INTO COMUNA (com_nombre) VALUES ('Los Muermos') ON DUPLICATE KEY UPDATE com_nombre=com_nombre;

-- Establecimientos 
INSERT INTO ESTABLECIMIENTO (est_id, est_nombre, est_comunafk) VALUES 
-- FRESIA (4)
(7924, 'ESCUELA RURAL SAN ANDRES TEGUALDA', 4),
(7927, 'ESCUELA RURAL CAU-CAU', 4),
(7929, 'ESCUELA BASICA AGRICOLA HUEMPELEO', 4),
(7930, 'ESCUELA RURAL LUCILA GODOY ALCAYAGA', 4),
(7931, 'ESCUELA RURAL PATO LLICO', 4),
(7933, 'ESCUELA RURAL OLGA SOTO ALVARADO', 4),
(7938, 'ESCUELA RURAL ENTRE RIOS', 4),
(7939, 'ESCUELA RURAL LINEA SIN NOMBRE', 4),
(7940, 'ESCUELA RURAL PARGA', 4),
(7941, 'LICEO CARLOS IBAÑEZ DEL CAMPO', 4),
(7944, 'ESCUELA RURAL SANTA MONICA', 4),
(7945, 'ESCUELA RURAL PEUCHEN', 4),
(22105, 'ESCUELA BASICA FRESIA', 4),
(35132, 'JARDÍN INFANTIL CORAZON DE ANGEL', 4),
(35133, 'JARDÍN INFANTIL Y SALA CUNA EL RINCON DEL SABER', 4),

-- FRUTILLAR (3)
(7973, 'LICEO INDUSTRIAL CHILENO ALEMAN (LICHAF)', 3),
(7975, 'ESCUELA ARTURO ALESSANDRI PALMA', 3),
(7976, 'ESCUELA BERNARDO PHILIPPI', 3),
(7977, 'ESCUELA RURAL LOS LINARES DE CASMA', 3),
(7978, 'ESCUELA RURAL MARIO PEREZ NAVARRO', 3),
(7982, 'ESCUELA RURAL PARAGUAY', 3),
(7987, 'ESCUELA CARLOS SPRINGER NIKLITSCHEK', 3),
(7990, 'ESCUELA RURAL COLONIA SAN MARTIN', 3),
(11548, 'ESCUELA CLAUDIO MATTE', 3),
(22022, 'LICEO IGNACIO CARRERA PINTO', 3),
(22293, 'ESCUELA ESPECIAL SAN AGUSTIN', 3),
(22493, 'ESCUELA VICENTE PEREZ ROSALES', 3),
(35134, 'JARDÍN INFANTIL Y SALA CUNA FRUTILLITA', 3),
(35135, 'JARDÍN INFANTIL Y SALA CUNA PEQUEÑOS ANGELITOS', 3),
(35136, 'JARDÍN INFANTIL Y SALA CUNA MANITOS DE COLORES', 3),

-- LLANQUIHUE (1)
(7956, 'LICEO BICENTENARIO POLITECNICO HOLANDA', 1),
(7958, 'ESCUELA INES GALLARDO ALVARADO', 1),
(7959, 'ESCUELA BASICA GABRIELA MISTRAL', 1),
(7961, 'ESCUELA RURAL LOS PELLINES', 1),
(7962, 'ESCUELA RURAL LONCOTORO', 1),
(7966, 'ESCUELA RURAL LINEA SOLAR', 1),
(7967, 'ESCUELA RURAL COLEGUAL', 1),
(7968, 'ESCUELA RURAL COLIGUAL SAN JUAN', 1),
(35145, 'JARDÍN INFANTIL Y SALA CUNA MI PEQUEÑO PARAISO', 1),

-- LOS MUERMOS (5)
(7872, 'COLEGIO BICENTENARIO DE DIFUSION ARTISTICA LOS ULMOS', 5),
(7874, 'ESCUELA RURAL CAÑITAS', 5),
(7878, 'ESCUELA RURAL PALIHUE', 5),
(7879, 'ESCUELA RURAL QUILLAHUA', 5),
(7881, 'ESCUELA RURAL HUAUTRUNES', 5),
(7887, 'ESCUELA RURAL CARACOL', 5),
(7896, 'ESCUELA RURAL ESTAQUILLA', 5),
(7897, 'ESCUELA RURAL MANUEL GATICA ARRIAGADA', 5),
(7898, 'ESCUELA RURAL EL MELI', 5),
(7905, 'ESCUELA RURAL PARAGUAY CHICO', 5),
(22012, 'LICEO PUNTA DE RIELES', 5),
(22309, 'COLEGIO INGLÉS MABEL CONDEMARÍN', 5),
(22310, 'ESCUELA RURAL YERBAS BUENAS', 5),
(35137, 'JARDÍN INFANTIL Y SALA CUNA DUENDECITOS / CUMBRE ALTA', 5),
(35138, 'JARDÍN INFANTIL Y SALA CUNA SEMILLITAS DE AMOR', 5),
(35139, 'JARDÍN INFANTIL Y SALA CUNA BROTECITOS DEL MELI', 5),
(35140, 'JARDÍN INFANTIL Y SALA CUNA VENTANITAS DE COLORES', 5),

-- PUERTO VARAS (2)
(7720, 'LICEO BICENTENARIO DE EXCELENCIA PEDRO AGUIRRE CERDA', 2),
(7722, 'COLEGIO ROSITA NOVARO DE NOVARO', 2),
(7723, 'ESCUELA GRUPO ESCOLAR', 2),
(7724, 'COLEGIO NUEVA BRAUNAU', 2),
(7725, 'ESCUELA RURAL COLONIA RIO SUR', 2),
(7726, 'ESCUELA RURAL SANTA MARIA', 2),
(7729, 'ESCUELA RURAL JOSE WERNER MEIXNER', 2),
(7730, 'ESCUELA RURAL REINALDO RADDATZ HARRICH', 2),
(7732, 'ESCUELA RURAL JANEQUEO', 2),
(7738, 'ESCUELA RURAL HARDY MINTE BARTSCH', 2),
(7740, 'ESCUELA RURAL EPSON DE ENSENADA', 2),
(7741, 'ESCUELA RURAL RICARDO ROTH SCHUTZ', 2),
(7756, 'ESCUELA RURAL CRISTO REY', 2),
(7761, 'ESCUELA RURAL LAS CAMELIAS', 2),
(7765, 'ESCUELA RURAL LA PENINSULA', 2),
(22101, 'ESCUELA DIFERENCIAL ASPADEP', 2),
(22519, 'COLEGIO MIRADOR DEL LAGO', 2),
(35153, 'JARDÍN INFANTIL Y SALA CUNA ARCOIRIS', 2),
(35154, 'JARDÍN INFANTIL Y SALA CUNA MURTITAS DE ENSENADA', 2),
(35155, 'JARDÍN INFANTIL Y SALA CUNA MI NUEVA AVENTURA', 2),
(35156, 'SALA CUNA PRINCESA LICARAYEN', 2)
(7732, '(Anexo) ESCUELA RURAL COLONIA TRES PUENTES', 2)
ON DUPLICATE KEY UPDATE est_nombre=est_nombre;
-- Índices para optimizar búsquedas frecuentes
CREATE INDEX idx_solicitudes_estado ON SOLICITUDES(sol_estado);
CREATE INDEX idx_solicitudes_fechasalida ON SOLICITUDES(sol_fechasalida);
CREATE INDEX idx_solicitudes_fechallegada ON SOLICITUDES(sol_fechallegada);
CREATE INDEX idx_solicitudes_patente ON SOLICITUDES(sol_patentevehiculofk);
CREATE INDEX idx_solicitudes_chofer ON SOLICITUDES(sol_correochoferfk);
CREATE INDEX idx_vehiculo_estado ON VEHICULO(vehi_estado);
