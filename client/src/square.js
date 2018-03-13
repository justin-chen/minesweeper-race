import React, { Component } from 'react';
import { flags_placed } from './board';
import './css/square.css';

class Square extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.value,
            flag: this.props.flag,
            coordinate: this.props.coordinate,
        };
    }

    componentWillReceiveProps(nextProps) {
        switch (nextProps.updateType) {
            case 'win':
                this.setState({ value: this.state.value, flag: this.state.flag });
                break;
            case 'game-over':
                this.setState({
                    value: nextProps.value < 0 ? nextProps.value : this.state.value,
                    flag: nextProps.value === -3 ? '' : this.state.flag
                });
                break;
            default:
                this.setState({ value: nextProps.value, flag: nextProps.flag });
                break;
        }
    }

    getServerResponse(coordinate) {
        if (!this.props.revealed && this.state.flag === '') {
            this.props.socket.emit('click', coordinate[0], coordinate[1]);
        }
    }

    flag(coordinate) {
        if (!this.props.revealed) {
            if (this.state.flag === '') {
                this.props.socket.emit('add-flag', coordinate[0], coordinate[1]);
                this.setState({ flag: 'flag' });
            } else {
                this.props.socket.emit('remove-flag', coordinate[0], coordinate[1]);
                this.setState({ flag: '' });
            }
        } else if (this.state.value > 0 && !this.props.game_over) {
            var flag_array = [];
            flags_placed.forEach(coord => flag_array.push(coord));
            this.props.socket.emit('reveal-neighbours', this.state.coordinate[0], this.state.coordinate[1], flag_array);
        }
    }

    getIntAsString(i) {
        switch (i) {
            case -3:
                i = 'mine-false';
                break;
            case -2:
                i = 'mine-active';
                break;
            case -1:
                i = 'mine';
                break;
            case 0:
                i = 'zero';
                break;
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
            default:
                i = 'null'
        }
        return i;
    }

    render() {
        return (
            <div draggable="true" className={"square " + this.getIntAsString(this.state.value) + "-square " + this.state.flag}
                onMouseDown={(e) => { if (!this.props.revealed && !this.state.flag && e.button === 0) this.setState({ value: 0 }) }}
                onMouseLeave={e => { if (e.button === 0 && !this.props.revealed) this.setState({ value: null }) }}
                onClick={this.getServerResponse.bind(this, this.props.coordinate)}
                onContextMenu={(e) => { e.preventDefault(); this.flag(this.props.coordinate) }}
                onDragStart={e => e.dataTransfer.setDragImage(new Image(), 0, 0)} onDragEnd={() => { if (!this.props.revealed) this.setState({ value: null }) }} />
        );
    }
}

export default Square;
