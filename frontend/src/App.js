import './App.css';
import React, { useState } from 'react';
import ExamForm from './views/ExamForm.js';
import RegistrationForm from './views/RegistrationForm.js';
import 'bootstrap/dist/css/bootstrap.min.css';

import DBConfig from './db/DBConfig.js';
const db = DBConfig();
db.open().catch((error) => {
	console.error(`Error opening database: ${error}`);
});

//db.exams.clear();
//db.users.clear();
//db.users_answ.clear();
//db.media.clear();
function App() {

	const [isAuthenticated, setAuthenticated] = useState(false);
	const [currentTid, setTid] = useState(false);
	const [currentUid, setUid] = useState(false);

	const handleLogin = (resp) => {
		if (resp.success === true){
			setTid(resp.tid);
			setUid(resp.uid);
			setAuthenticated(true);
		} else {
			setAuthenticated(false);
		}
	};

	const handleLogout = () => {
		setAuthenticated(false);
	};

	return (
		<div className="App">
		{isAuthenticated ? 
			<ExamForm onLogout={handleLogout} db={db} tid={currentTid} uid={currentUid} /> : 
			<>
				<RegistrationForm onLogin={handleLogin} db={db} />
				<div className='dark-layer'></div>
			</>
		}
		</div>
	);

}

export default App;
