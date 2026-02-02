SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- 1. Estructura de Tablas
-- --------------------------------------------------------

CREATE TABLE `administrador` (
  `adm_id` int(11) NOT NULL AUTO_INCREMENT,
  `adm_correo` varchar(200) DEFAULT NULL,
  `adm_password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`adm_id`),
  UNIQUE KEY `adm_correo` (`adm_correo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

CREATE TABLE `comuna` (
  `com_id` int(11) NOT NULL AUTO_INCREMENT,
  `com_nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`com_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

CREATE TABLE `establecimiento` (
  `est_id` int(11) NOT NULL COMMENT 'RBD o ID Oficial',
  `est_nombre` varchar(150) NOT NULL,
  `est_comunafk` int(11) NOT NULL,
  PRIMARY KEY (`est_id`),
  KEY `idx_est_comuna` (`est_comunafk`),
  CONSTRAINT `fk_est_comuna` FOREIGN KEY (`est_comunafk`) REFERENCES `comuna` (`com_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

CREATE TABLE `lugar` (
  `lug_id` int(11) NOT NULL AUTO_INCREMENT,
  `lug_nombre` varchar(150) NOT NULL,
  `lug_comunafk` int(11) NOT NULL,
  PRIMARY KEY (`lug_id`),
  KEY `idx_lug_comuna` (`lug_comunafk`),
  CONSTRAINT `fk_lug_comuna` FOREIGN KEY (`lug_comunafk`) REFERENCES `comuna` (`com_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

CREATE TABLE `vehiculo` (
  `vehi_patente` varchar(8) NOT NULL,
  `vehi_marca` varchar(50) DEFAULT NULL,
  `vehi_modelo` varchar(50) DEFAULT NULL,
  `vehi_capacidad` varchar(50) DEFAULT NULL,
  `vehi_estado` enum('DISPONIBLE','EN RUTA','MANTENCION','DE BAJA') DEFAULT 'DISPONIBLE',
  `vehi_anio` int(11) DEFAULT NULL,
  `vehi_color` varchar(30) DEFAULT NULL,
  `vehi_tipo` varchar(50) NOT NULL DEFAULT 'Vehículo',
  `vehi_motor` varchar(50) DEFAULT NULL,
  `vehi_chasis` varchar(50) DEFAULT NULL,
  `vehi_inventario` varchar(50) DEFAULT NULL,
  `vehi_propietario` varchar(100) DEFAULT 'SERVICIO LOCAL DE LLANQUIHUE',
  `vehi_resolucion` varchar(100) DEFAULT NULL,
  `vehi_lugaraparcamiento` varchar(150) DEFAULT NULL,
  `vehi_poliza` varchar(100) DEFAULT NULL,
  `vehi_multas` text DEFAULT NULL,
  PRIMARY KEY (`vehi_patente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

CREATE TABLE `chofer` (
  `cho_correoinstitucional` varchar(200) NOT NULL,
  `cho_nombre` varchar(200) NOT NULL,
  `cho_activo` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`cho_correoinstitucional`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

CREATE TABLE `bitacora_vehiculo` (
  `bit_id` int(11) NOT NULL AUTO_INCREMENT,
  `bit_patentevehiculofk` varchar(10) NOT NULL,
  `bit_fecha` datetime NOT NULL,
  `bit_funcionario_responsable` varchar(100) NOT NULL,
  `bit_kilometraje` int(11) NOT NULL,
  `bit_evento` varchar(100) NOT NULL,
  `bit_mecanico` varchar(100) DEFAULT NULL,
  `bit_valor_mantencion` int(11) DEFAULT 0,
  `bit_observaciones` text DEFAULT NULL,
  PRIMARY KEY (`bit_id`),
  KEY `idx_bitacora_patente` (`bit_patentevehiculofk`),
  CONSTRAINT `fk_bitacora_vehiculo` FOREIGN KEY (`bit_patentevehiculofk`) REFERENCES `vehiculo` (`vehi_patente`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

CREATE TABLE `usuario` (
  `usu_id` int(11) NOT NULL AUTO_INCREMENT,
  `usu_unidad` varchar(100) DEFAULT NULL,
  `usu_password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`usu_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

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
  `sol_tipo` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`sol_id`),
  KEY `idx_sol_estado` (`sol_estado`),
  KEY `idx_sol_fechas` (`sol_fechasalida`),
  CONSTRAINT `fk_sol_usuario` FOREIGN KEY (`sol_idusuariofk`) REFERENCES `usuario` (`usu_id`),
  CONSTRAINT `fk_sol_admin` FOREIGN KEY (`sol_idadminfk`) REFERENCES `administrador` (`adm_id`),
  CONSTRAINT `fk_sol_vehiculo` FOREIGN KEY (`sol_patentevehiculofk`) REFERENCES `vehiculo` (`vehi_patente`),
  CONSTRAINT `fk_sol_chofer` FOREIGN KEY (`sol_correochoferfk`) REFERENCES `chofer` (`cho_correoinstitucional`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

CREATE TABLE `solicitud_destino` (
  `sde_id` int(11) NOT NULL AUTO_INCREMENT,
  `sde_solicitudfk` char(36) NOT NULL,
  `sde_lugarfk` int(11) DEFAULT NULL,
  `sde_establecimientofk` int(11) DEFAULT NULL,
  PRIMARY KEY (`sde_id`),
  CONSTRAINT `fk_sde_solicitud` FOREIGN KEY (`sde_solicitudfk`) REFERENCES `solicitudes` (`sol_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sde_lugar` FOREIGN KEY (`sde_lugarfk`) REFERENCES `lugar` (`lug_id`),
  CONSTRAINT `fk_sde_establecimiento` FOREIGN KEY (`sde_establecimientofk`) REFERENCES `establecimiento` (`est_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

CREATE TABLE `tipo_pasajero` (
  `tip_id` int(11) NOT NULL AUTO_INCREMENT,
  `tip_nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`tip_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

CREATE TABLE `pasajeros` (
  `pas_id` int(11) NOT NULL AUTO_INCREMENT,
  `pas_nombre` varchar(100) NOT NULL,
  `pas_idsolicitudfk` char(36) NOT NULL,
  `pas_idtipofk` int(11) NOT NULL,
  PRIMARY KEY (`pas_id`),
  CONSTRAINT `fk_pasajeros_solicitud` FOREIGN KEY (`pas_idsolicitudfk`) REFERENCES `solicitudes` (`sol_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pasajeros_tipo` FOREIGN KEY (`pas_idtipofk`) REFERENCES `tipo_pasajero` (`tip_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- --------------------------------------------------------
-- 2. Carga de Datos (Seeders)
-- --------------------------------------------------------

INSERT INTO tipo_pasajero (tip_nombre) VALUES ('Funcionario'), ('Alumno'), ('Docente'), ('Otro');

INSERT INTO comuna (com_id, com_nombre) VALUES 
(1, 'Llanquihue'), (2, 'Puerto Varas'), (3, 'Frutillar'), (4, 'Fresia'), (5, 'Los Muermos');

-- Establecimientos: FRESIA
INSERT INTO establecimiento (est_id, est_nombre, est_comunafk) VALUES 
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
(35133, 'JARDÍN INFANTIL Y SALA CUNA EL RINCON DEL SABER', 4);

-- Establecimientos: FRUTILLAR
INSERT INTO establecimiento (est_id, est_nombre, est_comunafk) VALUES 
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
(35136, 'JARDÍN INFANTIL Y SALA CUNA MANITOS DE COLORES', 3);

-- Establecimientos: LLANQUIHUE
INSERT INTO establecimiento (est_id, est_nombre, est_comunafk) VALUES 
(7956, 'LICEO BICENTENARIO POLITECNICO HOLANDA', 1),
(7958, 'ESCUELA INES GALLARDO ALVARADO', 1),
(7959, 'ESCUELA BASICA GABRIELA MISTRAL', 1),
(7961, 'ESCUELA RURAL LOS PELLINES', 1),
(7962, 'ESCUELA RURAL LONCOTORO', 1),
(7966, 'ESCUELA RURAL LINEA SOLAR', 1),
(7967, 'ESCUELA RURAL COLEGUAL', 1),
(7968, 'ESCUELA RURAL COLIGUAL SAN JUAN', 1),
(35145, 'JARDÍN INFANTIL Y SALA CUNA MI PEQUEÑO PARAISO', 1);

-- Establecimientos: LOS MUERMOS
INSERT INTO establecimiento (est_id, est_nombre, est_comunafk) VALUES 
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
(35140, 'JARDÍN INFANTIL Y SALA CUNA VENTANITAS DE COLORES', 5);

-- Establecimientos: PUERTO VARAS
INSERT INTO establecimiento (est_id, est_nombre, est_comunafk) VALUES 
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
(35156, 'SALA CUNA PRINCESA LICARAYEN', 2),
(7733, '(Anexo) ESCUELA RURAL COLONIA TRES PUENTES', 2);

-- Vehículos: Total 7
INSERT INTO vehiculo (vehi_patente, vehi_tipo, vehi_marca, vehi_modelo, vehi_anio, vehi_color, vehi_motor, vehi_chasis, vehi_inventario, vehi_propietario, vehi_resolucion, vehi_lugaraparcamiento, vehi_poliza) 
VALUES ('DDWR23', 'MINIBUS', 'MERCEDEZ BENZ', 'SPRINTER 313 CDI', 2012, 'BLANCO', '61198170131227', '8AC903672CE054590', 'PG01-VEHIC-011', 'SERVICIO LOCAL DE LLANQUIHUE', '2539/03-08-2021', 'ESCUELA RURAL PARAGUAY', '58095949');

INSERT INTO vehiculo (vehi_patente, vehi_tipo, vehi_marca, vehi_modelo, vehi_anio, vehi_color, vehi_motor, vehi_chasis, vehi_capacidad, vehi_inventario, vehi_propietario, vehi_resolucion, vehi_lugaraparcamiento, vehi_poliza) 
VALUES ('FVJF20', 'CAMIONETA', 'SSANGYONG', 'ACTYON SPORT MT 4X2 SEMI FULL', 2013, 'GRIS GRAFITO', '67196010513783', 'KPACA1ETSDP161001', '2.740 KG', 'PG01-VEHIC-007', 'SERVICIO LOCAL DE LLANQUIHUE', '2539/03-08-2021', 'COLEGIO DE DIFUSION ARTISTICO LOS ULTIMOS', '58096525');

INSERT INTO vehiculo (vehi_patente, vehi_tipo, vehi_marca, vehi_modelo, vehi_anio, vehi_color, vehi_motor, vehi_chasis, vehi_capacidad, vehi_inventario, vehi_propietario, vehi_resolucion, vehi_lugaraparcamiento, vehi_poliza) 
VALUES ('GBHL72', 'CAMIONETA', 'GREAT WALL', 'WINGLE 5 4X4 2.0', 2015, 'BLANCO TITANIO', '140539963', 'LGWDBE175FB604149', '2.885', 'PG01-VEHIC-012', 'SERVICIO LOCAL DE LLANQUIHUE', '2539/03-08-2021', 'LICEO CHILENO ALEMAN', '58090741');

INSERT INTO vehiculo (vehi_patente, vehi_tipo, vehi_marca, vehi_modelo, vehi_anio, vehi_color, vehi_motor, vehi_chasis, vehi_inventario, vehi_propietario, vehi_resolucion, vehi_lugaraparcamiento, vehi_poliza) 
VALUES ('JJLL11', 'CAMIONETA', 'NISSAN', 'NP300 DCAB 4X4 2.3', 2018, 'PLATEADO PLATA', 'YS23-01199988C', '3N6BD33B1JK826679', 'PG01-VEHIC-23', 'SERVICIO LOCAL DE LLANQUIHUE', '2539/03-08-2021', 'LICEO INDUSTRIAL CHILENO ALEMAN', '58096362');

INSERT INTO vehiculo (vehi_patente, vehi_tipo, vehi_marca, vehi_modelo, vehi_anio, vehi_color, vehi_motor, vehi_chasis, vehi_capacidad, vehi_inventario, vehi_propietario, vehi_resolucion, vehi_lugaraparcamiento, vehi_poliza) 
VALUES ('LGJX76', 'BUS', 'MERCEDES BENZ', 'SPRINTER 515 CDI', 2019, 'BLANCO', '651955W0092534', '8AC906657LE166994', '5.000', 'PG01-VEHIC-013', 'SERVICIO LOCAL DE LLANQUIHUE', '2539/03-08-2021', 'LICEO INDUSTRIAL CHILENO ALEMAN', '121431056-9');

INSERT INTO vehiculo (vehi_patente, vehi_tipo, vehi_marca, vehi_modelo, vehi_anio, vehi_color, vehi_motor, vehi_chasis, vehi_capacidad, vehi_inventario, vehi_propietario, vehi_resolucion, vehi_lugaraparcamiento, vehi_poliza) 
VALUES ('LGJX77', 'BUS', 'MERCEDES BENZ', 'SPRINTER 515 CDI', 2019, 'BLANCO', '651955W0092604', '8AC906657LE166996', '5.000', 'PG01-VEHIC-014', 'SERVICIO LOCAL DE LLANQUIHUE', '2539/03-08-2021', 'LICEO INDUSTRIAL CHILENO ALEMAN', '121403549-5');

INSERT INTO vehiculo (vehi_patente, vehi_tipo, vehi_marca, vehi_modelo, vehi_anio, vehi_color, vehi_motor, vehi_chasis, vehi_capacidad, vehi_inventario, vehi_propietario, vehi_poliza) 
VALUES ('RHYD94', 'CAMIONETA', 'GREAT WALL', 'WINGLE 7 ELITE', 2022, 'BLANCO TITANIO', 'GW4D20D2170081188', 'LGWDBE191NB658919', '2.967 KG', 'PG01-VEHIC-025', 'SERVICIO LOCAL DE LLANQUIHUE', 'N° 8400266');

COMMIT;