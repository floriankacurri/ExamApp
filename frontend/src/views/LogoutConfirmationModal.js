import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

function LogoutConfirmationModal({ show, onClose, onLogout }) {
	return (
		<Modal show={show} onHide={onClose} centered>
			<Modal.Header closeButton>
				<Modal.Title>Konfirmo</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				Jeni i sigurt që dëshironi të dilni?
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={onClose}>
					Anullo
				</Button>
				<Button variant="danger" onClick={onLogout}>
					Dil
				</Button>
			</Modal.Footer>
		</Modal>
	);
}

export default LogoutConfirmationModal;