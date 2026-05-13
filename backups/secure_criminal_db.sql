-- MySQL dump 10.13  Distrib 9.6.0, for Win64 (x86_64)
--
-- Host: localhost    Database: secure_criminal_db
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'ce2e47b5-2e61-11f1-ae9d-74d4dd5e21e9:1-110';

--
-- Table structure for table `access_logs`
--

DROP TABLE IF EXISTS `access_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `access_logs` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `action` varchar(255) DEFAULT NULL,
  `target_table` varchar(50) DEFAULT NULL,
  `target_id` int DEFAULT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `details` text,
  `ip_address` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`log_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `access_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `access_logs`
--

LOCK TABLES `access_logs` WRITE;
/*!40000 ALTER TABLE `access_logs` DISABLE KEYS */;
INSERT INTO `access_logs` VALUES (1,1,'VIEW','criminal_profiles',1,'2026-05-09 07:24:18','Admin accessed high-risk criminal profile.','192.168.1.10'),(2,2,'UPDATE','cases',1,'2026-05-09 07:24:18','Officer updated case investigation status.','192.168.1.22'),(3,3,'UPLOAD','evidence',2,'2026-05-09 07:24:18','STF officer uploaded warehouse evidence image.','192.168.1.45');
/*!40000 ALTER TABLE `access_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `approvals`
--

DROP TABLE IF EXISTS `approvals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `approvals` (
  `approval_id` int NOT NULL AUTO_INCREMENT,
  `request_id` int DEFAULT NULL,
  `approved_by` int DEFAULT NULL,
  `decision` enum('approved','rejected') NOT NULL,
  `comment` text,
  `approved_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`approval_id`),
  KEY `request_id` (`request_id`),
  KEY `approved_by` (`approved_by`),
  CONSTRAINT `approvals_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `change_requests` (`request_id`),
  CONSTRAINT `approvals_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `approvals`
--

LOCK TABLES `approvals` WRITE;
/*!40000 ALTER TABLE `approvals` DISABLE KEYS */;
INSERT INTO `approvals` VALUES (1,2,1,'approved','Deletion approved after evidence archival.','2026-05-09 07:24:33');
/*!40000 ALTER TABLE `approvals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `case_criminals`
--

DROP TABLE IF EXISTS `case_criminals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `case_criminals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `case_id` int DEFAULT NULL,
  `criminal_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `case_id` (`case_id`),
  KEY `criminal_id` (`criminal_id`),
  CONSTRAINT `case_criminals_ibfk_1` FOREIGN KEY (`case_id`) REFERENCES `cases` (`case_id`),
  CONSTRAINT `case_criminals_ibfk_2` FOREIGN KEY (`criminal_id`) REFERENCES `criminal_profiles` (`criminal_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `case_criminals`
--

LOCK TABLES `case_criminals` WRITE;
/*!40000 ALTER TABLE `case_criminals` DISABLE KEYS */;
INSERT INTO `case_criminals` VALUES (1,1,1),(2,2,3),(3,2,2),(4,3,4);
/*!40000 ALTER TABLE `case_criminals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `case_reports`
--

DROP TABLE IF EXISTS `case_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `case_reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `case_id` int DEFAULT NULL,
  `report_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `case_id` (`case_id`),
  KEY `report_id` (`report_id`),
  CONSTRAINT `case_reports_ibfk_1` FOREIGN KEY (`case_id`) REFERENCES `cases` (`case_id`),
  CONSTRAINT `case_reports_ibfk_2` FOREIGN KEY (`report_id`) REFERENCES `reports` (`report_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `case_reports`
--

LOCK TABLES `case_reports` WRITE;
/*!40000 ALTER TABLE `case_reports` DISABLE KEYS */;
INSERT INTO `case_reports` VALUES (1,1,1),(2,2,2),(3,3,3),(4,2,4);
/*!40000 ALTER TABLE `case_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cases`
--

DROP TABLE IF EXISTS `cases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cases` (
  `case_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `status` enum('open','under_investigation','closed') DEFAULT 'open',
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`case_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `cases_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cases`
--

LOCK TABLES `cases` WRITE;
/*!40000 ALTER TABLE `cases` DISABLE KEYS */;
INSERT INTO `cases` VALUES (1,'ATM Armed Robbery Investigation','Investigation into organized robbery group targeting ATM cash vans.','under_investigation','high',1,'2026-05-09 07:21:55'),(2,'Narcotics Distribution Network','Suspected interstate drug trafficking operation.','open','high',2,'2026-05-09 07:21:55'),(3,'Illegal Firearms Activity','Reports of underground firearm exchange activities.','open','medium',3,'2026-05-09 07:21:55');
/*!40000 ALTER TABLE `cases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `change_requests`
--

DROP TABLE IF EXISTS `change_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `change_requests` (
  `request_id` int NOT NULL AUTO_INCREMENT,
  `table_name` varchar(50) NOT NULL,
  `record_id` int NOT NULL,
  `action` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `requested_by` int DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`request_id`),
  KEY `requested_by` (`requested_by`),
  CONSTRAINT `change_requests_ibfk_1` FOREIGN KEY (`requested_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `change_requests`
--

LOCK TABLES `change_requests` WRITE;
/*!40000 ALTER TABLE `change_requests` DISABLE KEYS */;
INSERT INTO `change_requests` VALUES (1,'criminal_profiles',2,'UPDATE',2,'pending','2026-05-09 07:24:24'),(2,'cases',3,'DELETE',1,'approved','2026-05-09 07:24:24');
/*!40000 ALTER TABLE `change_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `criminal_profiles`
--

DROP TABLE IF EXISTS `criminal_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `criminal_profiles` (
  `criminal_id` int NOT NULL AUTO_INCREMENT,
  `alias_name` varchar(100) DEFAULT NULL,
  `crime_type` varchar(100) DEFAULT NULL,
  `risk_level` enum('low','medium','high','critical') DEFAULT 'low',
  `status` enum('active','captured','deceased') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`criminal_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `criminal_profiles`
--

LOCK TABLES `criminal_profiles` WRITE;
/*!40000 ALTER TABLE `criminal_profiles` DISABLE KEYS */;
INSERT INTO `criminal_profiles` VALUES (1,'Shadow Fox','Armed Robbery','critical','active','2026-05-09 07:22:55'),(2,'Night Cipher','Cyber Crime','high','active','2026-05-09 07:22:55'),(3,'Raven','Narcotics Trafficking','critical','captured','2026-05-09 07:22:55'),(4,'Ghost Walker','Illegal Weapons Supply','medium','active','2026-05-09 07:22:55');
/*!40000 ALTER TABLE `criminal_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `evidence`
--

DROP TABLE IF EXISTS `evidence`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evidence` (
  `evidence_id` int NOT NULL AUTO_INCREMENT,
  `case_id` int DEFAULT NULL,
  `report_id` int DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `video_path` varchar(255) DEFAULT NULL,
  `uploaded_by` int DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`evidence_id`),
  KEY `case_id` (`case_id`),
  KEY `report_id` (`report_id`),
  KEY `uploaded_by` (`uploaded_by`),
  CONSTRAINT `evidence_ibfk_1` FOREIGN KEY (`case_id`) REFERENCES `cases` (`case_id`),
  CONSTRAINT `evidence_ibfk_2` FOREIGN KEY (`report_id`) REFERENCES `reports` (`report_id`),
  CONSTRAINT `evidence_ibfk_3` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evidence`
--

LOCK TABLES `evidence` WRITE;
/*!40000 ALTER TABLE `evidence` DISABLE KEYS */;
INSERT INTO `evidence` VALUES (1,1,1,'/evidence/images/atm_suspect_01.jpg','/evidence/videos/atm_camera_clip.mp4',2,'2026-05-09 07:23:55'),(2,2,2,'/evidence/images/warehouse_truck.jpg',NULL,3,'2026-05-09 07:23:55'),(3,3,3,NULL,'/evidence/videos/factory_surveillance.mp4',2,'2026-05-09 07:23:55');
/*!40000 ALTER TABLE `evidence` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `log_evidence_upload` AFTER INSERT ON `evidence` FOR EACH ROW BEGIN
    INSERT INTO access_logs
    (
        user_id,
        action,
        target_table,
        target_id,
        details,
        ip_address
    )
    VALUES
    (
        NEW.uploaded_by,
        'UPLOAD',
        'evidence',
        NEW.evidence_id,
        'Evidence uploaded automatically logged.',
        'SYSTEM'
    );
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `match_results`
--

DROP TABLE IF EXISTS `match_results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `match_results` (
  `match_id` int NOT NULL AUTO_INCREMENT,
  `report_id` int DEFAULT NULL,
  `criminal_id` int DEFAULT NULL,
  `confidence_score` decimal(5,2) DEFAULT NULL,
  `matched_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`match_id`),
  KEY `report_id` (`report_id`),
  KEY `criminal_id` (`criminal_id`),
  CONSTRAINT `match_results_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `reports` (`report_id`),
  CONSTRAINT `match_results_ibfk_2` FOREIGN KEY (`criminal_id`) REFERENCES `criminal_profiles` (`criminal_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `match_results`
--

LOCK TABLES `match_results` WRITE;
/*!40000 ALTER TABLE `match_results` DISABLE KEYS */;
INSERT INTO `match_results` VALUES (1,1,1,92.75,'2026-05-09 07:24:08'),(2,2,3,81.40,'2026-05-09 07:24:08'),(3,4,2,76.20,'2026-05-09 07:24:08');
/*!40000 ALTER TABLE `match_results` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reports` (
  `report_id` int NOT NULL AUTO_INCREMENT,
  `report_text` text NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `report_status` enum('pending','verified','rejected') DEFAULT 'pending',
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`report_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reports`
--

LOCK TABLES `reports` WRITE;
/*!40000 ALTER TABLE `reports` DISABLE KEYS */;
INSERT INTO `reports` VALUES (1,'Suspicious masked individuals seen near ATM late at night carrying weapons.','MG Road, Bengaluru','verified','2026-05-09 07:21:04'),(2,'Anonymous tip about illegal drug movement through warehouse district.','Whitefield Industrial Area','pending','2026-05-09 07:21:04'),(3,'Witness heard gunshots near abandoned factory around midnight.','Electronic City Phase 2','verified','2026-05-09 07:21:04'),(4,'Possible cyber fraud operation running from rented apartment.','Indiranagar, Bengaluru','pending','2026-05-09 07:21:04'),(5,'Suspicious masked individuals seen near ATM late at night carrying weapons.','MG Road, Bengaluru','verified','2026-05-09 07:21:09'),(6,'Anonymous tip about illegal drug movement through warehouse district.','Whitefield Industrial Area','pending','2026-05-09 07:21:09'),(7,'Witness heard gunshots near abandoned factory around midnight.','Electronic City Phase 2','verified','2026-05-09 07:21:09'),(8,'Possible cyber fraud operation running from rented apartment.','Indiranagar, Bengaluru','pending','2026-05-09 07:21:09');
/*!40000 ALTER TABLE `reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','officer','public','stf') NOT NULL,
  `status` enum('active','suspended') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Arjun Rao','arjun_rao','$2b$12$hashed_admin_001','admin','active','2026-05-09 07:20:06'),(2,'Meera Nair','meera_officer','$2b$12$hashed_officer_002','officer','active','2026-05-09 07:20:06'),(3,'Kabir Singh','kabir_stf','$2b$12$hashed_stf_003','stf','active','2026-05-09 07:20:06'),(4,'Riya Sharma','riya_public','$2b$12$hashed_public_004','public','active','2026-05-09 07:20:06');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `victims`
--

DROP TABLE IF EXISTS `victims`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `victims` (
  `victim_id` int NOT NULL AUTO_INCREMENT,
  `case_id` int DEFAULT NULL,
  `encrypted_name` varbinary(255) DEFAULT NULL,
  `encrypted_contact` varbinary(255) DEFAULT NULL,
  `statement` text,
  PRIMARY KEY (`victim_id`),
  KEY `case_id` (`case_id`),
  CONSTRAINT `victims_ibfk_1` FOREIGN KEY (`case_id`) REFERENCES `cases` (`case_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `victims`
--

LOCK TABLES `victims` WRITE;
/*!40000 ALTER TABLE `victims` DISABLE KEYS */;
INSERT INTO `victims` VALUES (1,1,_binary 'F\Þ=\ÑP?b\r\á:\ã\É-',_binary '\r3‚eM*£zoa†\n]–€','Victim reported armed threat during ATM robbery.'),(2,2,_binary 'v‚ý°tÜ™]!Gƒ?¸”½™\0n˜<\÷6¢è†±',_binary 'œ’\Û\÷‘ø\nr¤¿³ý²€','Saw suspicious cargo transfer near warehouse.');
/*!40000 ALTER TABLE `victims` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `witnesses`
--

DROP TABLE IF EXISTS `witnesses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `witnesses` (
  `witness_id` int NOT NULL AUTO_INCREMENT,
  `case_id` int DEFAULT NULL,
  `encrypted_name` varbinary(255) DEFAULT NULL,
  `statement` text,
  `is_anonymous` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`witness_id`),
  KEY `case_id` (`case_id`),
  CONSTRAINT `witnesses_ibfk_1` FOREIGN KEY (`case_id`) REFERENCES `cases` (`case_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `witnesses`
--

LOCK TABLES `witnesses` WRITE;
/*!40000 ALTER TABLE `witnesses` DISABLE KEYS */;
INSERT INTO `witnesses` VALUES (1,1,_binary 'ž\ô™†¢T\ðx-O\ÞÁÿœý','Observed two suspects escaping on motorcycles.',0),(2,3,NULL,'Gunshots heard around midnight near abandoned building.',1);
/*!40000 ALTER TABLE `witnesses` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-13 17:17:05
