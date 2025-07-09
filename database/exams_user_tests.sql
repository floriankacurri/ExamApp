--
-- Table structure for table `user_tests`
--

DROP TABLE IF EXISTS `user_tests`;

CREATE TABLE `user_tests` (
  `user_id` varchar(36) NOT NULL,
  `test_id` varchar(36) NOT NULL,
  `user_points` int NOT NULL DEFAULT '0',
  `completed` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`user_id`,`test_id`),
  KEY `fk_user_tests_user_idx` (`user_id`),
  KEY `fk_user_tests_test_idx` (`test_id`),
  CONSTRAINT `fk_user_tests_test` FOREIGN KEY (`test_id`) REFERENCES `test` (`id`),
  CONSTRAINT `fk_user_tests_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_tests`
--

LOCK TABLES `user_tests` WRITE;

INSERT INTO `user_tests` VALUES ('5875971e-80dc-11ee-a3d8-047c16974004','e1501cff-6167-11ee-897e-047c16974004',0,0);

UNLOCK TABLES;
