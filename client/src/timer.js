import React, { Component } from 'react';
import './css/timer.css';

class Timer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            seconds_elapsed: 0
        }
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.setState({ seconds_elapsed: this.state.seconds_elapsed + 1 });
        }, 1000);
    }

    stopTimer() {
        clearInterval(this.timer);
    }

    resetTimer() {
        clearInterval(this.timer);
        this.setState({ seconds_elapsed: 0 });
    }

    getIntAsString(i) {
        switch (i) {
            case 1:
                i = 'one';
                break;
            case 2:
                i = 'two';
                break;
            case 3:
                i = 'three';
                break;
            case 4:
                i = 'four';
                break;
            case 5:
                i = 'five';
                break;
            case 6:
                i = 'six';
                break;
            case 7:
                i = 'seven';
                break;
            case 8:
                i = 'eight';
                break;
            case 9:
                i = 'nine';
                break;
            default:
                i = 'zero';
        }
        return i;
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.timer_started === false && this.props.timer_started === true) {
            this.startTimer();
        } else if (this.props.timer_started === false) {
            if(this.props.game_over || this.props.face === 'cool'){
                this.stopTimer();
            } else if (this.state.seconds_elapsed > 0) {
                this.resetTimer();
            }
        }
    }

    render() {
        var ones = this.state.seconds_elapsed % 10;
        var tens = Math.floor((this.state.seconds_elapsed % 100) / 10);
        var hundreds = Math.floor((this.state.seconds_elapsed % 1000) / 100);

        return (
            <div className="timer">
                <div className={"digit hundreds " + this.getIntAsString(hundreds) + "-digit"}></div>
                <div className={"digit " + this.getIntAsString(tens) + "-digit"}></div>
                <div className={"digit " + this.getIntAsString(ones) + "-digit"}></div>
            </div>
        );
    }
}

export default Timer;
