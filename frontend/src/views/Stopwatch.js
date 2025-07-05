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
				this.setState({ elapsedTime });
				this.saveElapsedTime();
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
		const { tid, uid } = this.props;
		const savedTime = localStorage.getItem(`time-exam-${tid}-${uid}`);
		if (!savedTime) return 0;
		const parsedTime = JSON.parse(savedTime);
		const currentTime = Date.now();
		const timeDifference = currentTime - parsedTime.saved_at;	
		return parsedTime.elapsedTime + timeDifference;
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