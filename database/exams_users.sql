--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` varchar(36) NOT NULL DEFAULT 'uuid_to_bin(uuid())',
  `name` varchar(45) NOT NULL,
  `type` varchar(45) NOT NULL,
  `email` varchar(250) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `browserid` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;

INSERT INTO `users` VALUES ('5875971e-80dc-11ee-a3d8-047c16974004','Florjan Kaçurri','student','test@gmail.com','bd49163f4927a853285ba38bc16e8979');

UNLOCK TABLES;
