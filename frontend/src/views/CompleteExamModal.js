import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

function CompleteExamModal({ show, onClose, onSubmit, completed}) {
	const content = {
		msg: completed ? "Jeni i sigurt që doni ta dërgoni testin?" : "Jeni i sigurt që doni ta ruani testin?",
		button: completed ? "Dërgo" : "Ruaj",
	};
	return (
		<Modal show={show} onHide={onClose} centered>
			<Modal.Header closeButton>
				<Modal.Title>Konfirmo</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{content.msg}
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={onClose}>
					Anullo
				</Button>
				<Button variant="success" onClick={onSubmit}>
					{content.button}
				</Button>
			</Modal.Footer>
		</Modal>
	);
}

export default CompleteExamModal;