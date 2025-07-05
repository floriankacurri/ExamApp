import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

function ExamResult({ show, onExit, points, maxPoints}) {
	// if (!maxPoints){
	// 	const tableExam = await this.db.table('exams');
	// 	const exam = await tableExam.where('tid').equals(tid).first();
	// 	maxPoints = exam.max_points;
	// }
	return (
		<Modal show={show} onHide={onExit} centered>
			<Modal.Header closeButton>
				<Modal.Title>Testi është përfunduar</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				Ti e ke përfunduar testin, pikët e tua: {points}/{maxPoints}
			</Modal.Body>
			<Modal.Footer>
				<Button variant="danger" onClick={onExit}>
					Mbyll
				</Button>
			</Modal.Footer>
		</Modal>
	);
}

export default ExamResult;