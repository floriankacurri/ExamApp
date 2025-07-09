--
-- Table structure for table `test`
--

DROP TABLE IF EXISTS `test`;

CREATE TABLE `test` (
  `id` varchar(36) NOT NULL,
  `total_point` int NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `status` varchar(20) NOT NULL,
  `duration` int NOT NULL,
  `active` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `test`
--

LOCK TABLES `test` WRITE;

INSERT INTO `test` VALUES ('e1501cff-6167-11ee-897e-047c16974004',10,'2025-06-03 13:30:00','2025-06-03 15:30:00','ready',60,1);

UNLOCK TABLES;
