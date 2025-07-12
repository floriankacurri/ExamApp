import React, { Component } from 'react';
import '../css/exam.css';

class Stopwatch extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isRunning: false,
			elapsedTime: this.getElapsedTime() || 0, // Initialize with saved time or 0
		};
		this.interval = null;
	}

	componentDidMount() {
		if (this.state.isRunning) {
			clearInterval(this.interval);
		} else {
			const startTime = Date.now() - this.state.elapsedTime;
			this.interval = setInterval(() => {
				const elapsedTime = Date.now() - startTime;
				const elasedTimeInMin = Math.floor(elapsedTime / 60000);
				console.log(`Elapsed time in minutes: ${elasedTimeInMin}`);
				this.setState({ elapsedTime });
				this.saveElapsedTime();
				if (elasedTimeInMin >= this.props.maxTime){
					clearInterval(this.interval);
					this.setState({ isRunning: false });
					this.props.finishExam(); // Notify parent component that time is up
					return;
				}
			}, 1000);
		}
		this.setState({ isRunning: !this.state.isRunning });
	}

	componentWillUnmount() {
		clearInterval(this.interval);
		this.saveElapsedTime();
		this.setState({
			isRunning: false,
			elapsedTime: 0,
		});
	}

	saveElapsedTime = () => {
		const { tid, uid } = this.props;
		localStorage.setItem(`time-exam-${tid}-${uid}`, JSON.stringify({elapsedTime:this.state.elapsedTime, saved_at: Date.now()}));
	}

	getElapsedTime = () => {
		const { tid , uid } = this.props;
		const savedTime = localStorage.getItem(`time-exam-${tid}-${uid}`);
		if (!savedTime){
			console.log('No saved time found for this exam.');
			return 0;
		}
		const parsedTime = JSON.parse(savedTime);
		const currentTime = Date.now();
		const timeDifference = currentTime - parsedTime.saved_at;
		const totalTime = parsedTime.elapsedTime + timeDifference;	
		return totalTime > this.props.maxTime * 60000 ? this.props.maxTime * 60000 : totalTime; // Ensure it does not exceed max time
	}

	formatTime = (time) => {
		const hours = Math.floor(time / 3600000);
		const minutes = Math.floor((time % 3600000) / 60000);
		const seconds = Math.floor((time % 60000) / 1000);

		return (
			(hours < 10 ? '0' : '') + hours + ':' +
			(minutes < 10 ? '0' : '') + minutes + ':' +
			(seconds < 10 ? '0' : '') + seconds
		);
	}

	render() {
		const formattedTime = this.formatTime(this.state.elapsedTime);
		return (
			<div className="countdown">
				<span id="hours">{formattedTime}</span>
			</div>
		);
	}
}

export default Stopwatch;