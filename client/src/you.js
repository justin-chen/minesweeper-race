
import React, { Component } from 'react';
import * as board from './board';
import './css/square.css';
import './css/border.css';

class You extends Component {
    constructor(props) {
        super(props);
        this.socket = props.socket;
        this.state = {
            mine_field: board.renderMinefield(this),
            mines_remaining: 40,
            timer_started: false,
            face: '',
            game_over: false
        };

        this.flags_placed = new Set();
        this.revealed = new Set();
        this.header = board.renderHeader(this);
        this.footer = board.renderFooter();
    }

    componentDidMount() {
        this.socket.on('mine', function (mine_coords, x, y) {
            board.gameOver(this, mine_coords, x, y);
        }.bind(this));

        this.socket.on('single', function (value, x, y) {
            board.reveal(this, value, x, y);
        }.bind(this));

        this.socket.on('fill', function (coords) {
            board.reveal(this, coords);
        }.bind(this));

        this.socket.on('new-game', function () {
            board.restart(this);
        }.bind(this));

        this.socket.on('get-reveal-neighbours', function (x, y) {
            var flag_array = [];
            this.flags_placed.forEach(coord => flag_array.push(coord));
            this.socket.emit('reveal-neighbours', x, y, flag_array);
        }.bind(this));

        this.socket.on('add-flag', function (x, y) {
            this.flags_placed.add(x + ',' + y);
            if (this.flags_placed.size === 40 && this.revealed.size === 216) {
                board.gameComplete(this);
            } else {
                this.setState({ mines_remaining: this.state.mines_remaining - 1 });
            }
        }.bind(this));

        this.socket.on('remove-flag', function (x, y) {
            this.flags_placed.delete(x + ',' + y);
            this.setState({ mines_remaining: this.state.mines_remaining + 1 });
        }.bind(this));

        this.socket.on('opponent-joined', function () {
            board.restart(this);
        }.bind(this));

        this.socket.on('opponent-left', function () {
            board.restart(this);
        }.bind(this));
    }

    render() {
        var mine_rows = this.state.mine_field.map(row =>
            <tr>
                <td className="v"></td>
                {row.map(cell => <td draggable="true"
                    onMouseDown={(e) => {
                        if (e.button === 0 && this.state.face !== 'cool' && this.props.player === 'you') this.setState({ face: 'surprise' });
                    }}
                    onMouseUp={(e) => { if (e.button === 0 && this.state.face !== 'cool' && this.props.player === 'you') this.setState({ face: '' }) }}
                    onDragEnd={(e) => { if (e.button === 0 && this.state.face !== 'cool' && this.props.player === 'you') this.setState({ face: '' }) }}>
                    {cell}
                </td>)}
                <td className="v"></td>
            </tr>
        );
        return (
            <table cellSpacing="0" cellPadding="0" className="game mine-field">
                <thead>
                    {board.renderHeader(this)}
                </thead>
                <tbody >
                    {mine_rows}
                </tbody>
                <tfoot>
                    {this.footer}
                </tfoot>
            </table>
        );
    }
}

export default You;