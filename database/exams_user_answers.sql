--
-- Table structure for table `user_answers`
--

DROP TABLE IF EXISTS `user_answers`;

CREATE TABLE `user_answers` (
  `user_id` varchar(36) NOT NULL,
  `test_question_id` varchar(36) NOT NULL,
  `answer_date` datetime DEFAULT NULL,
  `answer` varchar(45) DEFAULT NULL,
  `points` int NOT NULL DEFAULT '0',
  `is_correct` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`user_id`,`test_question_id`),
  KEY `fk_user_answers_test_idx` (`test_question_id`),
  CONSTRAINT `fk_user_answers_test_question` FOREIGN KEY (`test_question_id`) REFERENCES `test_question` (`id`),
  CONSTRAINT `fk_user_answers_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_answers`
--

LOCK TABLES `user_answers` WRITE;

UNLOCK TABLES;
