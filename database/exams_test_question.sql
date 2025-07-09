--
-- Table structure for table `test_question`
--

DROP TABLE IF EXISTS `test_question`;

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

--
-- Dumping data for table `test_question`
--

LOCK TABLES `test_question` WRITE;

INSERT INTO `test_question` VALUES ('e1501cff-6167-11ee-897e-047c16974004','18238a79-6161-11ee-897e-047c16974004','a7dcef48-6171-11ee-897e-047c16974004'),('e1501cff-6167-11ee-897e-047c16974004','76dbf2e0-7a8c-11ee-a4ca-047c16974004','19baf955-7a8d-11ee-a4ca-047c16974004'),('e1501cff-6167-11ee-897e-047c16974004','7b002213-7451-11ee-83ae-5444a66a380d','987a6788-76ab-11ee-83ae-5444a66a380d'),('e1501cff-6167-11ee-897e-047c16974004','7d90a6b0-6167-11ee-897e-047c16974004','a7dcf56d-6171-11ee-897e-047c16974004'),('e1501cff-6167-11ee-897e-047c16974004','90ec88e6-6161-11ee-897e-047c16974004','a7dcf6f3-6171-11ee-897e-047c16974004'),('e1501cff-6167-11ee-897e-047c16974004','a22d80b0-7a8b-11ee-a4ca-047c16974004','19baf9b9-7a8d-11ee-a4ca-047c16974004'),('e1501cff-6167-11ee-897e-047c16974004','cb6c013f-769d-11ee-83ae-5444a66a380d','81f25c6a-76ab-11ee-83ae-5444a66a380d'),('e1501cff-6167-11ee-897e-047c16974004','fc37a147-6166-11ee-897e-047c16974004','a7dcf762-6171-11ee-897e-047c16974004');

UNLOCK TABLES;