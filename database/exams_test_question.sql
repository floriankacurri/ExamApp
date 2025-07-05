-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: localhost    Database: exams
-- ------------------------------------------------------
-- Server version	8.0.34

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `test_question`
--

DROP TABLE IF EXISTS `test_question`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `test_question` (
  `test_id` varchar(36) NOT NULL,
  `question_id` varchar(36) NOT NULL,
  `id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unq_question_test` (`test_id`,`question_id`),
  KEY `fk_test_question_test_idx` (`test_id`),
  KEY `fk_test_question_question` (`question_id`),
  CONSTRAINT `fk_test_question_question` FOREIGN KEY (`question_id`) REFERENCES `question` (`id`),
  CONSTRAINT `fk_test_question_test` FOREIGN KEY (`test_id`) REFERENCES `test` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='	';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `test_question`
--

LOCK TABLES `test_question` WRITE;
/*!40000 ALTER TABLE `test_question` DISABLE KEYS */;
INSERT INTO `test_question` VALUES ('e1501cff-6167-11ee-897e-047c16974004','18238a79-6161-11ee-897e-047c16974004','a7dcef48-6171-11ee-897e-047c16974004'),('e1501cff-6167-11ee-897e-047c16974004','76dbf2e0-7a8c-11ee-a4ca-047c16974004','19baf955-7a8d-11ee-a4ca-047c16974004'),('e1501cff-6167-11ee-897e-047c16974004','7b002213-7451-11ee-83ae-5444a66a380d','987a6788-76ab-11ee-83ae-5444a66a380d'),('e1501cff-6167-11ee-897e-047c16974004','7d90a6b0-6167-11ee-897e-047c16974004','a7dcf56d-6171-11ee-897e-047c16974004'),('e1501cff-6167-11ee-897e-047c16974004','90ec88e6-6161-11ee-897e-047c16974004','a7dcf6f3-6171-11ee-897e-047c16974004'),('e1501cff-6167-11ee-897e-047c16974004','a22d80b0-7a8b-11ee-a4ca-047c16974004','19baf9b9-7a8d-11ee-a4ca-047c16974004'),('e1501cff-6167-11ee-897e-047c16974004','cb6c013f-769d-11ee-83ae-5444a66a380d','81f25c6a-76ab-11ee-83ae-5444a66a380d'),('e1501cff-6167-11ee-897e-047c16974004','fc37a147-6166-11ee-897e-047c16974004','a7dcf762-6171-11ee-897e-047c16974004');
/*!40000 ALTER TABLE `test_question` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

