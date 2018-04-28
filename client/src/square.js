import React, { Component } from 'react';

class Square extends Component {
    constructor(props) {
        super(props);
        this.socket = this.props.socket;
        this.state = {
            value: this.props.value,
            flag: this.props.flag,
            coordinate: this.props.coordinate,
        };

        this.socket.on('add-flag-opponent', function (x, y) {
            if (this.state.coordinate[0] === x && this.state.coordinate[1] === y && this.props.player === 'opponent') this.setState({ flag: 'flag' });
        }.bind(this));

        this.socket.on('remove-flag-opponent', function (x, y) {
            if (this.state.coordinate[0] === x && this.state.coordinate[1] === y && this.props.player === 'opponent') this.setState({ flag: '' });
        }.bind(this));
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
        if (!this.props.revealed && this.state.flag === '' && this.props.player === 'you') {
            this.socket.emit('click', coordinate[0], coordinate[1]);
        }
    }

    flag(coordinate) {
        if (!this.props.revealed) {
            if (this.state.flag === '') {
                this.socket.emit('add-flag', coordinate[0], coordinate[1]);
                this.setState({ flag: 'flag' });
            } else {
                this.socket.emit('remove-flag', coordinate[0], coordinate[1]);
                this.setState({ flag: '' });
            }
        } else if (this.state.value > 0 && !this.props.game_over) {
            this.socket.emit('get-reveal-neighbours', this.state.coordinate[0], this.state.coordinate[1]);
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
        var allow_mouse_down = (!this.props.revealed && !this.state.flag && this.props.player === 'you');
        return (
            <div draggable="true" className={"square " + this.getIntAsString(this.state.value) + "-square " + this.state.flag}
                onMouseDown={e => { if (allow_mouse_down && e.button === 0) this.setState({ value: 0 }) }}
                onMouseLeave={e => { if (e.button === 0 && !this.props.revealed) this.setState({ value: null }) }}
                onClick={this.getServerResponse.bind(this, this.props.coordinate)}
                onContextMenu={e => {e.preventDefault(); if (this.props.player === 'you') this.flag(this.props.coordinate) }}
                onDragStart={e => e.dataTransfer.setDragImage(new Image(), 0, 0)} onDragEnd={() => { if (!this.props.revealed) this.setState({ value: null }) }} />
        );
    }
}

export default Square;
