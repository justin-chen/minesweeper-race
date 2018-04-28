import React, { Component } from 'react';

class Counter extends Component {

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
                i = 'zero'
        }
        return i;
    }

    render() {
        var ones = this.props.mines_remaining % 10;
        var tens = Math.floor((this.props.mines_remaining % 100) / 10);
        var hundreds = Math.floor((this.props.mines_remaining % 1000) / 100);
        
        return (
            <div className="counter" >
                <div className={"digit hundreds " + this.getIntAsString(hundreds) + "-digit"}></div>
                <div className={"digit " + this.getIntAsString(tens) + "-digit"}></div>
                <div className={"digit " + this.getIntAsString(ones) + "-digit"}></div>
            </div>
        );
    }
}

export default Counter;
