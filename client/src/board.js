import io from 'socket.io-client';
import React, { Component } from 'react';
import Square from './square';
import Counter from './counter';
import Timer from './timer';
import Header from './header';
import './css/square.css';
import './css/border.css';


const socket = io('http://localhost:5000');
var flags_placed = new Set();
var revealed = new Set();
export { flags_placed };

class Board extends Component {
    constructor(props) {
        super(props);

        this.state = {
            mine_field: this.renderMinefield(),
            mines_remaining: 40,
            timer_started: false,
            face: '',
            game_over: false
        };

        this.header = this.renderHeader();
        this.footer = this.renderFooter();
    }

    componentDidMount() {
        socket.on('mine', function (mine_coords, x, y) {
            this.gameOver(mine_coords, x, y);
        }.bind(this));

        socket.on('single', function (value, x, y, ) {
            this.reveal(value, x, y);
        }.bind(this));

        socket.on('fill', function (coords) {
            this.reveal(coords);
        }.bind(this));

        socket.on('new-game', function () {
            this.restart();
        }.bind(this));

        socket.on('add-flag', function (x, y) {
            flags_placed.add(x + ',' + y);
            if (flags_placed.size === 40 && revealed.size === 216) {
                this.gameComplete();
            } else {
                this.setState({ mines_remaining: this.state.mines_remaining - 1 });
            }
        }.bind(this));

        socket.on('remove-flag', function (x, y) {
            flags_placed.delete(x + ',' + y);
            this.setState({ mines_remaining: this.state.mines_remaining + 1 });
        }.bind(this));

    }

    renderMinefield() {
        var mine_field = [];
        for (let i = 0; i < 16; i++) {
            mine_field.push([]);
            for (let j = 0; j < 16; j++) {
                mine_field[i].push(<Square coordinate={[i, j]} socket={socket} value={null} revealed={false} game_over={false} flag={''} />);
            }
        }
        return mine_field;
    }

    renderHeader() {
        var rows = [];
        var border = [];
        for (let i = 0; i < 16; i++) {
            border.push(<td className="hor" />);
        }
        rows.push(<tr><td className="tlc" />{border}<td className="trc" /></tr>);
        rows.push(
            <tr className="board-header">
                <td className="v l" colSpan={1} />
                <td colSpan={16}>
                    <Counter key={[1, 1]} {...this.state} />
                    {!this.state.game_over ? <Header key={[1, 2]} socket={socket} face={this.state.face} /> : <Header key={[1, 2]} socket={socket} face={"dead"} />}
                    <Timer key={[1, 3]} {...this.state} />
                </td>
                <td className="v l" colSpan={1} />
            </tr>
        );
        rows.push(<tr><td className="ltc" />{border}<td className="rtc" /></tr>);

        return rows;
    }

    renderFooter() {
        var footer = [];
        for (let i = 0; i < 16; i++) {
            footer.push(<td className="hor" />);
        }
        return <tr><td className="blc" />{footer}<td className="brc" /></tr>;
    }

    restart() {
        flags_placed.clear();
        revealed = new Set();
        this.setState({
            mine_field: this.renderMinefield(),
            mines_remaining: 40,
            timer_started: false,
            face: '',
            game_over: false
        });
    }

    gameComplete() {
        var mine_field_copy = this.state.mine_field.slice();
        for (let i = 0; i < 16; i++) {
            for (var j = 0; j < 16; j++) {
                mine_field_copy[i][j] = <Square revealed={true} updateType={'win'} game_over={true}/>;
            }
        }
        this.setState({
            mine_field: mine_field_copy,
            timer_started: false,
            mines_remaining: 0,
            face: 'cool'
        });
    }



    gameOver(mine_coords, x, y) {
        var mine_field_copy = this.state.mine_field.slice();

        for (let i = 0; i < 16; i++) {
            for (var j = 0; j < 16; j++) {
                if (flags_placed.has(i + ',' + j)) {
                    mine_field_copy[i][j] = <Square value={-3} revealed={true} flag={''} game_over={true} socket={socket} updateType={'game-over'} />;
                } else {
                    mine_field_copy[i][j] = <Square revealed={true} game_over={true} socket={socket} updateType={'game-over'} />;
                }
            }
        }
        for (let i in mine_coords) {
            if (x === mine_coords[i][0] && y === mine_coords[i][1]) {
                mine_field_copy[mine_coords[i][0]][mine_coords[i][1]] = <Square value={-2} revealed={true} socket={socket} updateType={'game-over'} />;
            } else {
                mine_field_copy[mine_coords[i][0]][mine_coords[i][1]] = <Square value={-1} revealed={true} socket={socket} updateType={'game-over'} />;
            }
        }

        flags_placed.clear();

        this.setState({
            mine_field: mine_field_copy,
            timer_started: false,
            game_over: true
        });
    }

    reveal(value, x, y) {
        var mine_field_copy = this.state.mine_field.slice();
        var flags = 0;
        if (arguments.length === 1) {
            for (var i in value) {
                mine_field_copy[value[i][0]][value[i][1]] = <Square value={value[i][2]} revealed={true} flag={''} socket={socket} />;
                let flag = value[i][0] + ',' + value[i][1];
                if (flags_placed.has(flag)) {
                    flags++;
                    flags_placed.delete(flag);
                }
                if (!revealed.has(value[i][0] + ',' + value[i][1])) {
                    revealed.add(value[i][0] + ',' + value[i][1]);
                }
            }
        } else {
            mine_field_copy[x][y] = <Square value={value} revealed={true} flag={''} socket={socket} />;
            if (!revealed.has(x + ',' + y)) {
                revealed.add(x + ',' + y);
            }
        }
        console.log(revealed.size + '   ' + flags_placed.size);
        if (flags_placed.size === 40 && revealed.size === 216) {
            this.gameComplete();
        } else {
            this.setState({
                mine_field: mine_field_copy,
                timer_started: true,
                mines_remaining: this.state.mines_remaining + flags
            });
        }
    }

    render() {
        var mine_rows = this.state.mine_field.map(row =>
            <tr>
                <td className="v"></td>
                {row.map(cell => <td draggable="true"
                    onMouseDown={(e) => {
                        if (e.button === 0 && this.state.face !== 'cool') this.setState({ face: 'surprise' });
                    }}
                    onMouseUp={(e) => { if (e.button === 0 && this.state.face !== 'cool') this.setState({ face: '' }) }}
                    onDragEnd={(e) => { if (e.button === 0 && this.state.face !== 'cool') this.setState({ face: '' }) }}>
                    {cell}
                </td>)}
                <td className="v"></td>
            </tr>
        );
        return (
            <div>
                <table cellSpacing="0" cellPadding="0" className="mine-field">
                    <thead>
                        {this.renderHeader()}
                    </thead>
                    <tbody >
                        {mine_rows}
                    </tbody>
                    <tfoot>
                        {this.footer}
                    </tfoot>
                </table>
            </div>
        );
    }
}

export default Board;