
--
-- Table structure for table `question`
--

DROP TABLE IF EXISTS `question`;

CREATE TABLE `question` (
  `id` varchar(36) NOT NULL,
  `type` varchar(20) NOT NULL,
  `data` json NOT NULL,
  `correct_answer` varchar(100) NOT NULL,
  `norder` tinyint NOT NULL,
  `point` int DEFAULT NULL,
  `media_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_media_question` (`media_id`),
  CONSTRAINT `fk_media_question` FOREIGN KEY (`media_id`) REFERENCES `media` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `question`
--

LOCK TABLES `question` WRITE;

INSERT INTO `question` VALUES 
  ('18238a79-6161-11ee-897e-047c16974004','single','{\"text\": \"Cili kryeqytet është në foto?\", \"options\": \"Parisi,Roma,Londra\"}','Roma',1,1,'00d2473d-7450-11ee-83ae-5444a66a380d'),
  ('76dbf2e0-7a8c-11ee-a4ca-047c16974004','single','{\"text\": \" Çfarë përfaqëson kjo audio?\", \"options\": \"Këngë,Himn,Bisedë\"}','Himn',8,1,'94fa361b-7a8b-11ee-a4ca-047c16974004'),
  ('7b002213-7451-11ee-83ae-5444a66a380d','single','{\"text\": \"Cili është emri i objekit që shihni në foto?\", \"options\": \"Kulla Eiffel,Shtëpia e Operës në Sidnej,Koloseu i Romës,Butrinti\"}','Koloseu i Romës',5,1,'00d2473d-7450-11ee-83ae-5444a66a380d'),
  ('7d90a6b0-6167-11ee-897e-047c16974004','text','{\"text\": \"Cili është mbiemri i futbollistit me numrin 1 në kombëtaren gjermane?\", \"options\": \"\"}','neuer',2,2,NULL),
  ('90ec88e6-6161-11ee-897e-047c16974004','single','{\"text\": \"Sa sekonda zgjat video?\", \"options\": \"3,7,9\"}','7',4,1,'561b0e29-7450-11ee-83ae-5444a66a380d'),
  ('a22d80b0-7a8b-11ee-a4ca-047c16974004','single','{\"text\": \"Cili shtet përfaqësohet nga ky himn?\", \"options\": \"Italia,Franca,Gjermania,Shqipëria\"}','Gjermania',3,1,'94fa361b-7a8b-11ee-a4ca-047c16974004'),
  ('cb6c013f-769d-11ee-83ae-5444a66a380d','single','{\"text\": \"Cili është numri më i madh që mund të shikoni në video?\", \"options\": \"5,9,7\"}','9',6,1,'561b0e29-7450-11ee-83ae-5444a66a380d'),
  ('fc37a147-6166-11ee-897e-047c16974004','multiple','{\"text\": \"Gjej numrat çift: \", \"options\": \"1,2,4,7,9\"}','2,4',7,2,NULL);

UNLOCK TABLES;