import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode>
		<App />
		<ToastContainer />
	</React.StrictMode>
);

if ('serviceWorker' in navigator) {
	navigator.serviceWorker
		.register(`${process.env.PUBLIC_URL}/service-worker.js`, { scope: '/' })
		.then(registration => {
			console.log('Service worker registration succeeded:', registration);
		})
		.catch(error => {
			console.error(`Service worker registration failed: ${error}`);
		});
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
