import React, { useState, Component, use } from 'react';
import { Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { Offline, Online } from 'react-detect-offline';
import { toast } from 'react-toastify';
import Fingerprint2 from 'fingerprintjs2';
import LZString from 'lz-string';
import '../css/exam.css';
import ExamResult from './ExamResult';
import LoadingSpinner from './LoadingSpinner';
import * as yup from 'yup';

class Registration extends Component {

	constructor(props) {
		super(props);
		this.db = this.props.db;
		this.state = {
			isOnline: navigator.onLine,
			fingerprint: null,
			name: "",
			email: "",
			invalidEmail: false,
			tid: 0,
			uid: 0,
			points: 0,
			maxPoints: 0,
			showResultModal: false,
			showLoading: false
		};
	};

	setShowResultModal(state) {
		this.setState({ showResultModal: state });
	};

	setShowLoading(state) {
		this.setState({ showLoading: state });
	};

	componentDidMount() {
		window.addEventListener('online', this.handleOnline);
		window.addEventListener('offline', this.handleOffline);
		Fingerprint2.get(components => {
			const values = components.map(component => component.value);
			const fingerprint = Fingerprint2.x64hash128(values.join(''), 31);
			this.setState({ fingerprint });
		});
	};

	componentWillUnmount() {
		window.removeEventListener('online', this.handleOnline);
		window.removeEventListener('offline', this.handleOffline);
	};

	handleChange = (e) => {
		const { name, value } = e.target;
		// Validate email using yup
		if (name === 'email') {
			const schema = yup.object().shape({
				email: yup.string().email() 
			});
			schema.isValid({
				email: value
			}).then(valid => {
				this.setState({ invalidEmail: !valid });
			});
		}
		this.setState({ [name]: value });
	};

	handleOnline = () => {
		this.setState({ isOnline: true });
	};

	handleOffline = () => {
		this.setState({ isOnline: false });
	};

	handleExit = () => {
		this.setShowResultModal(false);
	};

	async storeUser(uid, email, name, tid, fingerprint) {
		const table = await this.db.users;
		const existingRecord = await table.where('uid').equals(uid).first();

		if (existingRecord) {
			await table.where('uid').equals(uid).modify(record => {
				record.email = email;
				record.name = name;
				record.last_tid = tid;
				record.fingerprint = fingerprint;
			});
		} else {
			await table.add({ uid: uid, email: email, name: name, last_tid: tid, fingerprint: fingerprint });
		}
	}

	async storeExam(tid, examjson, duration, max_points) {
		const table = await this.db.exams;
		const existingRecord = await table.where('tid').equals(tid).first();
		if (existingRecord) {
			await table.where('tid').equals(tid).modify(record => {
				record.examjson = examjson.questions;
			});
		} else {
			await table.add({ tid: tid, examjson: examjson.questions, duration: duration, max_points: max_points });
		}
	}

	async storeUserExam(tid, uid, answers, completed, points) {
		const table = await this.db.table('users_answ');
		const existingRecord = await table.where('tid').equals(tid).and(row => row.uid == uid).first();

		if (existingRecord) {
			const local_answers = existingRecord.answers ? existingRecord.answers : [];

			for (let i = 0; i < answers.length; i++) {
				const anws = answers[i];
				const exists = local_answers.some((item) => item.qid === anws.qid);
				if (!exists) {
					local_answers.append(anws);
				}
			}
			await table.where('tid').equals(tid).and(row => row.uid == uid).modify(record => {
				record.answers = local_answers;
				record.completed = completed;
				record.points = points;
			});
		} else {
			await table.add({ tid: tid, uid: uid, answers: answers, completed: completed, points: points });
		}
	}

	async storeMedia(media_id, content, type, filename) {
		const startTime = performance.now();
		const table = await this.db.table('media');
		const existingRecord = await table.where('media_id').equals(media_id).first();
		const compress_content = LZString.compress(content);
		const endTime = performance.now();
		if (!existingRecord) {
			await table.add({ 
				media_id: media_id, 
				content: compress_content, 
				db_size: content.length, 
				db_compress_size: compress_content.length, 
				time_comp: Math.round(endTime - startTime), 
				type: type, 
				filename: filename 
			});
		}
		this.compressedContentLength += compress_content.length;
	}

	async getOfflineUserTest(email, fingerprint) {
		let msg = { error: true, msg: "Internal Server Error" }
		const table = await this.db.table('users');
		const user = await table.where('email').equals(email).first();

		if (!user) {
			msg.msg = "Ky perdorues nuk eshte i ruajtur ne kompjuterin tend!\n Provo nje email tjeter!";
			return msg;
		} else {
			if (fingerprint !== user.fingerprint) {
				msg.msg = "Emaili eshte korrekt, por kjo llogari eshte hapur tek nje browser apo kompjuter tjeter!\n Provo te logohesh ne browserin/kompjuterin e duhur!";
				return msg;
			} else {
				const tableans = await this.db.table('users_answ');
				const userans = await tableans.where('uid').equals(user.uid).and(row => row.tid == user.last_tid).first();
				if (userans.completed == 1) {
					this.setState({ points: userans.points });
					this.setShowResultModal(true);
				} else {
					localStorage.setItem('offline', user.last_tid);
					await this.props.onLogin({ success: true, tid: userans.tid, uid: userans.uid });
					toast.success(`Mirësevini ${user.name} !`, {
						position: toast.POSITION.TOP_CENTER,
						autoClose: 5000,
						hideProgressBar: false,
						closeOnClick: true,
						pauseOnHover: true,
						draggable: true,
						progress: undefined,
						theme: "light",
					});
				}
			}
		}
	}

	throwError = (errorMsg) => {
		toast.error(errorMsg, {
		position: toast.POSITION.TOP_CENTER,
		autoClose: 5000,
		hideProgressBar: false,
		closeOnClick: true,
		pauseOnHover: true,
		draggable: true,
		progress: undefined,
		theme: "light",
		});
	};

	handleSubmit = async (event) => {
		event.preventDefault();
		this.setShowLoading(true);
		try {
			if (this.state.isOnline) {
				const endpoint = window.location.hostname;
				const apiUrl = 'http://' + endpoint + ':5000/api/go2exam';
				if (!this.state.name.length){
					this.throwError("Ju lutem plotesoni emrin !");
					this.setShowLoading(false);
					return;
				}
				if (!this.state.email.length || this.state.invalidEmail) {
					this.throwError("Email i pasakte !");
					this.setShowLoading(false);
					return;
				}
				const response = await axios.post(apiUrl, { 'name': this.state.name, 'email': this.state.email, 'fingerprint': this.state.fingerprint });
				const resp = response.data;

				if (resp.success == true) {
					const exam = resp.exam;
					const user = exam.user;
					const media = exam.media;
					const duration = exam.duration;
					const total_points = exam.total_points;
					await this.storeUser(user.uid, user.email, user.user_name, exam.tid, this.state.fingerprint);
					this.compressedContentLength = 0;
					for (let i = 0; i < media.length; i++) {
						const md = media[i];
						await this.storeMedia(md.media_id, md.content, md.type, md.filename);
					}
					console.log(`Compressed Media Size: ${this.compressedContentLength/(1024*1024)} MB`);
					await this.storeUserExam(exam.tid, user.uid, exam.answers, exam.completed, exam.points);
					await this.storeExam(exam.tid, exam, duration, total_points);
					this.setState({ points: exam.points , maxPoints: total_points });

					if (exam.completed == 1) {
						//if exam is completed by user
						this.props.onLogin({ success: false });
						this.setShowResultModal(true);
					} else {
						//if succesful login, and not completed yet
						toast.success(`Mirësevini ${user.user_name} !`, {
							position: toast.POSITION.TOP_CENTER,
							autoClose: 5000,
							hideProgressBar: false,
							closeOnClick: true,
							pauseOnHover: true,
							draggable: true,
							progress: undefined,
							theme: "light",
						});
						await this.props.onLogin({ success: true, tid: exam.tid, uid: user.uid });
					}
				} else {
					//if response.success == false
					this.throwError(resp.error_msg);
					this.props.onLogin({ success: false });
				}
			} else {
				//If offline
				const res = await this.getOfflineUserTest(this.state.email, this.state.fingerprint);
				if (res && res.error) {
					this.throwError(res.error);
					this.props.onLogin({ success: false });
				}
			}
			this.setShowLoading(false);
		} catch (error) {
			this.setShowLoading(false);
			this.throwError(error.message);
			await this.props.onLogin({ success: false });
		}
	};
		
	render() {
		const pollingConfig = {
			enabled: true,
			url: 'https://ipv4.icanhazip.com',
			interval: 5000,
			timeout: 2000,
		};

		return this.state.showLoading ? (<LoadingSpinner />) : (

			<div className="card cardalign registration">
				<div className='card-header'>
					<div className="d-flex justify-content-between">
						<h4>Regjistrohu</h4>
						<Online polling={pollingConfig}>
							<div className='online-mini'>ON</div>
						</Online>
						<Offline polling={pollingConfig}>
							<div className='offline-mini blink'>OFF</div>
						</Offline>
					</div>
				</div>
				<div className='card-body text-center'>
					<Form onSubmit={this.handleSubmit}>
						<Form.Group controlId="name" >
							<Form.Label>Emri</Form.Label>
							<Form.Control
								type="text"
								name="name"
								onChange={this.handleChange}
								required
							/>
						</Form.Group>
						<Form.Group controlId="email">
							<Form.Label>Email</Form.Label>
							<Form.Control
								type="email"
								name="email"
								onChange={this.handleChange}
								required
							/>
						</Form.Group>
						{this.state.invalidEmail && ( <span className="text-danger">Email i pasaktë</span>)}
						<div className='row m-4'>
							<Button variant="primary" type="submit">
								Vazhdo te Testi
							</Button>
						</div>
						<ExamResult
							show={this.state.showResultModal}
							points={this.state.points}
							maxPoints={this.state.maxPoints}
							onExit={this.handleExit}t
						/>
					</Form>
				</div>
				<div className='card-footer'>
					<span>Fingerprint:</span> <p>{this.state.fingerprint}</p>
				</div>
			</div>
		);
	}
}

export default Registration;