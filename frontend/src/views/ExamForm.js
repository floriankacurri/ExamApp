import React, { Component } from 'react';
import '../css/exam.css';
import ekonomikuIcon from '../icons/ekonomiku_logo.png';
import unitirIcon from '../icons/unitir_logo.png';
import userIcon from '../icons/user_icon.svg';
import pencilIcon from '../icons/pencil.svg';
import paperIcon from '../icons/paper.svg';
import clockIcon from '../icons/clock.svg';
import logoutImage from '../icons/logout.svg';
import saveImage from '../icons/save.svg';
import sendIcon from '../icons/send_icon.svg';
import { Offline, Online } from 'react-detect-offline';
import { toast } from 'react-toastify';
import LZString from 'lz-string';
import LogoutConfirmationModal from './LogoutConfirmationModal';
import CompleteExamModal from './CompleteExamModal';
import Stopwatch from './Stopwatch';
import axios from 'axios';
import ExamResult from './ExamResult';
import LoadingSpinner from './LoadingSpinner';

class ExamForm extends Component {

	constructor(props) {
		super(props);
		this.db = this.props.db;
		this.state = {
			isOnline: navigator.onLine,
			examJSON: "",
			answers: [],
			media: [],
			tid: 0,
			uid: 0,
			userName: '',
			points: 0,
			timeFinished: false,
			showLogoutModal: false,
			showSaveModal: false,
			showResultModal: false,
			completed: false,
			showLoading: true,
			decompress_time: 0,
			decompress_no: 0,
			compressedIds: [],
		};
		
		this.handleSave = this.handleSave.bind(this);
		this.getExam().then(() => {
			if (!this.state.isOnline){
				this.handleOffline();
			}    
		});
	}

    //styling
	boldTextStyle = {
		fontWeight: 'bold',
	};

	divBgStyle = {
		backgroundColor: '#f3d6cc',
	};

	videoRefs = {};
	questions = [];
	answers = [];
	media = [];

	componentDidMount() {
		console.log('Component Mounted');
		window.addEventListener('online', this.handleOnline);
		window.addEventListener('offline', this.handleOffline);
		window.addEventListener('beforeunload', this.handleBeforeUnload);
	}

	componentWillUnmount() {
		window.removeEventListener('online', this.handleOnline);
		window.removeEventListener('offline', this.handleOffline);
		window.removeEventListener('beforeunload', this.handleBeforeUnload);
	}

	handleBeforeUnload = (event) => {
		event.preventDefault();
		this.throwError("Can't reload the page!");
		event.returnValue = '';
	}
	
	getFrontendUrl = () => {
		const { protocol, hostname, port } = window.location;
		const currentPort = port ? `:${port}` : '';   // only include if non-empty
		return `${protocol}//${hostname}${currentPort}`;
	};

	getBackendUrl = () => {
		const { protocol, hostname, port } = window.location;
		if (hostname !== 'localhost') return process.env.REACT_APP_BACKEND_API_URL;
		const apiPort = (hostname === 'localhost') ? ':5000' : '';
		return `${protocol}//${hostname}:5000`;
	};


	async getExam() {
		const tid = this.props.tid;
		const uid = this.props.uid;
		const tableExam = await this.db.table('exams');
		const tableAnsw = await this.db.table('users_answ');
		this.exam = await tableExam.where('tid').equals(tid).first();
		const questions = this.exam.examjson;
		const answers = await tableAnsw.where('tid').equals(tid).and(row => row.uid == uid).first();
		this.answers = answers.answers;
		const mediaIds = Array.from(new Set(questions.filter(item => item.media_id).map((item) => (item.media_id))));
		const media = await this.db.table('media').where('media_id').anyOf(mediaIds).toArray();
		this.media = media;
		const endpoint = window.location.hostname;
		const questionsArr = questions.map((q) => ({ 
			id: q.id,
			media_id: q.media_id,
			order: q.no, 
			type: q.type, 
			done: q.done, 
			answer: q.answer,
			text: JSON.parse(q.json).text, 
			options: JSON.parse(q.json).options.split(',').map((sb) => sb.trim()), 
			content_type: this.media.find(item => item.media_id === q.media_id) ? this.media.find(item => item.media_id === q.media_id).type : "", 
			content: this.media.find(item => item.media_id === q.media_id) ? this.media.find(item => item.media_id === q.media_id).content : "", 
			url: this.media.find(item => item.media_id === q.media_id) ? `${this.getFrontendUrl()}/media/` +  this.media.find(item => item.media_id === q.media_id).filename : "" 
		}));
		this.questions = questionsArr;
		const tableUsers = await this.db.table('users');
		const user = await tableUsers.where('uid').equals(this.props.uid).first();
		this.setState({answers: answers.answers, uid: uid, userName:user.name, userEmail:user.email, tid: tid, showLoading: false});
	}

	setShowLogoutModal(state){
		this.setState({showLogoutModal: state});
	}

	setShowSaveModal(state){
		this.setState({showSaveModal: state});
	}

	setShowLoading(state){
		this.setState({showLoading: state});
	}

	handleLogout = () => {
		this.setShowLogoutModal(false);
		localStorage.setItem(`time-exam-${this.props.tid}-${this.props.uid}`, JSON.stringify(Date.now()));
		this.props.onLogout();
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
	
	handleInputChange = (event) => {
		const { id, name, value, checked, type } = event.target;
		const answers = this.answers;
		const savedTime = localStorage.getItem(`time-exam-${this.props.tid}-${this.props.uid}`);
		if (savedTime) {
			const parsedTime = JSON.parse(savedTime);
			const elapsedTime = parsedTime.elapsedTime / 1000 / 60; // Convert milliseconds to minutes
			console.log('Elapsed Minutes', elapsedTime);
			if (elapsedTime >= parseInt(this.exam.duration)) {
				this.finishExam();
				return;
			}
		}
		const currentAnswer = answers.find((answ) => answ.qid === name.replace("qu-",""));
		if (currentAnswer){
			const index = answers.indexOf(currentAnswer);
			if (type === "radio" && checked){
				currentAnswer.answer = value;
			}
			if (type === "checkbox"){
				var currentArray = currentAnswer.answer.split(",");
				if (checked){
					currentArray.push(value);
				} else {
					const indexItem = currentArray.indexOf(value)
					currentArray.splice(indexItem, 1);
				}
				currentAnswer.answer = currentArray.join(",");
			}
			if (type === "text"){
				currentAnswer.answer = value;
			}
			answers[index] = currentAnswer;
		} else {
			if (type === "radio" && checked){
				answers.push({qid: name.replace("qu-",""), answer: value});
			}
			if (type === "checkbox" && checked){
				answers.push({qid: name.replace("qu-",""), answer: value});
			}
			if (type === "text"){
				answers.push({qid: name.replace("qu-",""), answer: value});
			}
		}
		this.answers = answers;
		console.log('this.answers', this.answers);
		this.setState({answers: answers});
		this.saveAnswers(answers);
	};

	finishExam () {
		this.throwError("Koha e provimit ka përfunduar!");
		if (this.state.isOnline){
			const answers = this.answers;
			const questionIds = this.questions.map(q => q.id);
			const doneQuestionIds = answers.map(answ => answ.qid);
			let allAnswers = [];
			for (let q of questionIds) {
				if (!doneQuestionIds.includes(q)) {
					allAnswers.push({qid: q, answer: ""});
				}
			} 
			const ans = [
				...this.answers,
				...allAnswers
			];
			this.setState({ answers: ans, timeFinished: true, completed: true }, async () => {
				console.log("All answers", this.state.answers);
				await this.handleSave();
			});
		} else {
			this.setState({ timeFinished: true, completed: true });
		}
	}

	async handleSave() {
		this.setState({showSaveModal: false, showLoading: true});
		const apiUrl = `${this.getBackendUrl()}/api/submitexam`;
		try {
			console.log('this.state.answers', this.state.answers);
			debugger;
			const response = await axios.post(apiUrl, {'tid': this.state.tid, 'uid': this.state.uid, 'answers': this.state.answers, 'timeFinished': this.state.timeFinished});
			const resp = response.data;
			if(resp.success == true){
				toast.success(resp.msg, {
					position: toast.POSITION.TOP_CENTER,
					autoClose: 5000,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
					progress: undefined,
					theme: "light", 
				});
				if(resp.completed == true){
					localStorage.removeItem(`time-exam-${this.props.tid}-${this.props.uid}`);
					await this.completeExam(resp.pointsTotal);
					this.setState({points: resp.pointsTotal, maxPoints: resp.maxPoints, completed: resp.completed, showResultModal: true});
				}
			} else {
				this.throwError(resp.error_msg);
			}
			this.setShowLoading(false);
		} catch (error) {
			this.setShowLoading(false);
			this.throwError(error.message);

			console.error('Error submitting exam:', error);
		}
	};

	handleOnline = () => {
		this.setState({ isOnline: true });
	}

	handleOffline = () => {
		console.log('handleOffline');
		let ids = this.state.compressedIds;
		let noComps = 0;
		const startTime = performance.now();

		for (let i=0; i< this.media.length; i++){
			if(!ids.includes(this.media[i].media_id)){
				let decompressed_content = LZString.decompress(this.media[i].content);
				this.media[i].content = decompressed_content;
				noComps += 1;
				ids.push(this.media[i].media_id);
			}
		}
		const endTime = performance.now();
		const noActual = this.state.decompress_no;
		const timeActual = this.state.decompress_time;

		if (noComps > 0) {
			this.setState({decompress_no: noActual + noComps, decompress_time: timeActual + Math.round(endTime - startTime), isOnline: false});
			let ids = this.state.compressedIds;
			for (let i=0; i< this.questions.length; i++){
				if (ids.includes(this.questions[i].media_id)){
					this.questions[i].content = this.media.filter( item => item.media_id === this.questions[i].media_id)[0].content;
				}
			}
		} else {
			this.setState({ isOnline: false });
		}
		console.log('this.media', this.media);
		console.log('this.questions', this.questions);
	}
	
	handleExit = () => {
		this.handleLogout();
	}

	async completeExam(points){
		const tid = this.state.tid;
		const uid = this.state.uid;
		const table = await this.db.table('users_answ');
		await table.where('tid').equals(tid).and(row => row.uid == uid).modify(record => {
			record.completed = 1;
			record.points = points;
		});
	}

	async saveAnswers(answersList) {
		try {
			const tid = this.state.tid;
			const uid = this.state.uid;
			const table = await this.db.table('users_answ');
			await table.where('tid').equals(tid).and(row => row.uid == uid).modify(record => {
				record.answers = answersList;
			});
		} catch (error) {
			console.error('Error updating or adding record:', error);
		}
	}

	async getCurrentUserName(){
		const table = await this.db.table('users');
		const existingRecord = await table.where('uid').equals(this.props.uid).first();
		console.log('existingRecord', existingRecord);
		return existingRecord ? existingRecord.name : '';
	}

	generateElements(){
		const questions = this.questions;
		const answers = this.answers;
		questions.sort((a, b) => a.order - b.order);
		console.log('questions', questions);
		console.log(answers);
		
		return questions.map((question) => (
			<div className="card m-2" id={question.id}>
				<div className='bg-header card-header text-left' style={this.divBgStyle}>
					<div className="input-group">
						<div className="input-group-prepend">
							<span className="input-group-text" id={question.order}>{question.order}</span>
						</div>
						<span className="input-group-text border-0 bg-transparent ps-3" style={this.boldTextStyle}>{question.text}</span>
					</div>
				</div>
				<div className='card-body'>		
				{question.content_type === "image"  &&  (
					<img src={this.state.isOnline ? question.url : question.content} alt="picture" />
				)}
				{question.content_type === "video" &&  (
					<div key={`video-${question.id}`}>
						<video id={`video-${question.id}`} ref={(ref) => (this.videoRefs[`video-${question.id}`] = ref)} controls>
							<source src={this.state.isOnline ? question.url : question.content } type="video/mp4" />
						</video>
					</div>
				)}
				{question.content_type === "audio" &&  (
					<div key={`audio-${question.id}`}>
						<audio id={`audio-${question.id}`} ref={(ref) => (this.videoRefs[`audio-${question.id}`] = ref)} controls>
						<source src={this.state.isOnline ? question.url : question.content} type="audio/mpeg" />
							Your browser does not support the audio element.
						</audio>
					</div>
				)}
					<span className="input-group-text border-0 bg-transparent">Përgjigjia:</span>
				</div>
				<div className='card-footer text-left'>
				{question.type === "single" && question.options.map((option, index) => (
					<div key={index} className="form-check">
						<input
							type="radio"
							className="form-check-input"
							id={`radio-${index}`}
							name={`qu-${question.id}`}
							checked={answers.find(item => item.qid === question.id) ? answers.find(item => item.qid === question.id).answer === option : false}
							onChange={this.handleInputChange}
							value={option}
							disabled={this.state.timeFinished} // Disable input if exam is finished
						/>
						<label className="form-check-label float-start ms-2" htmlFor={`radio-${index}`}>
							{option}
						</label>
					</div>
				))}
				{question.type === "multiple" && question.options.map((option, index) => (
					<div key={index} className="form-check">
						<input
							type="checkbox"
							className="form-check-input"
							id={`checkbox-${index}`}
							checked={answers.find(item => item.qid === question.id) ? answers.find(item => item.qid === question.id).answer.split(',').includes(option) : false}
							name={`qu-${question.id}`}
							value={option}
							onChange={this.handleInputChange}
							disabled={this.state.timeFinished} // Disable input if exam is finished
						/>
						<label className="form-check-label float-start ms-2" htmlFor={`checkbox-${index}`}>
							{option}
						</label>
					</div>
				))}
				{question.type === "text" && (
					<div key={question.id} className="form-control">
						<input
							type="text"
							className="form-control"
							id={`text-${question.id}`}
							value={answers.find(item => item.qid === question.id) ? answers.find(item => item.qid === question.id).answer : ""}
							name={`qu-${question.id}`}
							onChange={this.handleInputChange}
							disabled={this.state.timeFinished} // Disable input if exam is finished
						/>
					</div>
				)}
				</div>
			</div>
		))
	}

	render() {
		const media = this.media;
		const questions = this.questions;
		let savedMemory = 0;
		for (let i=0; i< media.length; i++){
			const md = media[i];
			const count = questions.filter(item => item.media_id === md.media_id).length;
			savedMemory += (count - 1) * md.db_size;
		}
		const pollingConfig = {
			enabled: true,
			url: 'https://ipv4.icanhazip.com',
			interval: 5000,
			timeout: 2000,
		};
		// Calculate the number of answered questions
		const answeredCount = this.questions.filter(q => {
			const ans = this.state.answers.find(a => a.qid === q.id);
			if (!ans) return false;
			if (q.type === "text") return ans.answer && ans.answer.trim() !== "";
			if (q.type === "single") return ans.answer && ans.answer !== "";
			if (q.type === "multiple") return ans.answer && ans.answer.split(',').filter(x => x.trim() !== "").length > 0;
			return false;
		}).length;
		
		const completed = answeredCount === this.questions.length;

		return this.state.showLoading ? ( <LoadingSpinner /> ) : (
			<div className="app-container">
				<header className="fixed-top bg-light text-dark p-2">
					<div className="container cont-exam cont-header">
						<div className='header_col'>
							<div className='col col-2 css-col-countdown'>
								<Online polling={pollingConfig}>
									<div className='online'>ON</div>
								</Online>
								<Offline polling={pollingConfig}>
									<div className='offline blink'>OFF</div>
								</Offline>
								<Stopwatch 
									tid={this.props.tid} 
									uid={this.props.uid} 
									maxTime={this.exam.duration}
									finishExam={this.finishExam.bind(this)}
								/>
							</div>
							<div className='col col-8 txt d-flex flex-column justify-content-center align-items-center header-info border h-100'>
								<div className='d-flex justify-content-center align-items-center column-gap-4 w-100 h-50'>
									<div className='d-flex align-items-center h-50'>                      
										<img src={unitirIcon} alt="" className='nav_icon'/> <span>Universiteti i Tiranës</span>
									</div>
									<div className='d-flex align-items-center h-50'>                      
										<span>Fakulteti i Ekonomisë</span> <img src={ekonomikuIcon} alt="" className='nav_icon'/> 
									</div>
								</div>
								<div className='d-flex justify-content-evenly align-items-center w-100 h-50 border-top'>
									<div className='d-flex justify-content-start align-items-center  h-50 p-2'>                      
										<img src={paperIcon} alt="" className='nav_icon'/> <span>Midterm</span>
									</div>
									<div className='d-flex justify-content-start align-items-center  h-50'>                      
										<img src={userIcon} alt="" className='nav_icon'/> <span>Studenti: {this.state.userName}</span>
									</div>
									<div className='d-flex justify-content-start align-items-center h-50'>                      
										<img src={clockIcon} alt="" className='nav_icon'/> <span>Koha: {this.exam && this.exam.duration ? this.exam.duration : ""}min</span>
									</div>
									<div className='d-flex justify-content-start align-items-center h-50'>                      
										<img src={pencilIcon} alt="" className='nav_icon'/> <span>Plotësuar: {answeredCount}/{this.questions.length}</span>
									</div>
								</div>
							</div>
							{/* <div className='col col-4 txt'>
							</div> */}
							<div className='col col-1'>
								<Online polling={pollingConfig}>
									<button className="save-button" onClick={() => this.setShowSaveModal(true)}>
										<img src={completed ? sendIcon: saveImage} alt="" className='img_icon' /> {completed ? "Submit" : "Ruaj"}
									</button>
								</Online>
							</div>
							<div className='col col-1'>
								<button className="logout-button" onClick={() => this.setShowLogoutModal(true)}>
									<img src={logoutImage} alt="" className='img_icon' /> Dil
								</button>
							</div>
						</div>
					</div>
				</header>
				<div className="container overlay-container cont-exam">
					{this.generateElements()}
				</div>
				<LogoutConfirmationModal
					show={this.state.showLogoutModal}
					onClose={() => this.setShowLogoutModal(false)}
					onLogout={this.handleLogout}
				/>
				<CompleteExamModal
					show={this.state.showSaveModal}
					completed={answeredCount===this.questions.length}
					onClose={() => this.setShowSaveModal(false)}
					onSubmit={this.handleSave}
				/>
				<ExamResult
					show={this.state.showResultModal}
					points={this.state.points}
					maxPoints={this.exam ? this.exam.max_points : 0}
					onExit={this.handleExit}
				/>
			</div>
		);
	}
}

export default ExamForm;