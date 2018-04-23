import React from 'react';
import Square from './square';
import Counter from './counter';
import Timer from './timer';
import Header from './header';

function renderMinefield(player) {
    var mine_field = [];
    for (let i = 0; i < 16; i++) {
        mine_field.push([]);
        for (let j = 0; j < 16; j++) {
            mine_field[i].push(<Square coordinate={[i, j]} socket={player.socket} value={null} revealed={false} game_over={false} flag={''} player={player.props.player}/>);
        }
    }
    return mine_field;
};

function renderHeader(player) {
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
                <Counter key={[1, 1]} {...player.state} />
                {!player.state.game_over ? <Header key={[1, 2]} socket={player.socket} face={player.state.face} timer_started={player.state.timer_started } player={player.props.player}/> :
                    <Header key={[1, 2]} socket={player.socket} face={"dead"} player={player.props.player}/>}
                <Timer key={[1, 3]} {...player.state} />
            </td>
            <td className="v l" colSpan={1} />
        </tr>
    );
    rows.push(<tr><td className="ltc" />{border}<td className="rtc" /></tr>);
    return rows;
};

function renderFooter() {
    var footer = [];
    for (let i = 0; i < 16; i++) {
        footer.push(<td className="hor" />);
    }
    return <tr><td className="blc" />{footer}<td className="brc" /></tr>;
};

function restart(player) {
    player.flags_placed.clear();
    player.revealed = new Set();
    player.setState({
        mine_field: renderMinefield(player),
        mines_remaining: 40,
        timer_started: false,
        face: '',
        game_over: false
    });
};

function gameComplete(player) {
    var mine_field_copy = player.state.mine_field.slice();
    for (let i = 0; i < 16; i++) {
        for (var j = 0; j < 16; j++) {
            mine_field_copy[i][j] = <Square revealed={true} updateType={'win'} game_over={true} />;
        }
    }
    player.setState({
        mine_field: mine_field_copy,
        timer_started: false,
        mines_remaining: 0,
        face: 'cool'
    });
};

function gameOver(player, mine_coords, x, y) {
    var mine_field_copy = player.state.mine_field.slice();

    for (let i = 0; i < 16; i++) {
        for (var j = 0; j < 16; j++) {
            if (player.flags_placed.has(i + ',' + j)) {
                mine_field_copy[i][j] = <Square value={-3} revealed={true} flag={''} game_over={true} socket={player.socket} updateType={'game-over'} />;
            } else {
                mine_field_copy[i][j] = <Square revealed={true} game_over={true} socket={player.socket} updateType={'game-over'} />;
            }
        }
    }
    for (let i in mine_coords) {
        if (x === mine_coords[i][0] && y === mine_coords[i][1]) {
            mine_field_copy[mine_coords[i][0]][mine_coords[i][1]] = <Square value={-2} revealed={true} socket={player.socket} updateType={'game-over'} />;
        } else {
            mine_field_copy[mine_coords[i][0]][mine_coords[i][1]] = <Square value={-1} revealed={true} socket={player.socket} updateType={'game-over'} />;
        }
    }
    player.flags_placed.clear();

    player.setState({
        mine_field: mine_field_copy,
        timer_started: false,
        game_over: true
    });
};

function reveal(player, value, x, y) {
    var mine_field_copy = player.state.mine_field.slice();
    var flags = 0;
    if (arguments.length === 2) {
        for (var i in value) {
            mine_field_copy[value[i][0]][value[i][1]] = <Square value={value[i][2]} revealed={true} flag={''} socket={player.socket} player={player.props.player}/>;
            let flag = value[i][0] + ',' + value[i][1];
            if (player.flags_placed.has(flag)) {
                flags++;
                player.flags_placed.delete(flag);
            }
            if (!player.revealed.has(value[i][0] + ',' + value[i][1])) {
                player.revealed.add(value[i][0] + ',' + value[i][1]);
            }
        }
    } else {
        mine_field_copy[x][y] = <Square value={value} revealed={true} flag={''} socket={player.socket} player={player.props.player}/>;
        if (!player.revealed.has(x + ',' + y)) {
            player.revealed.add(x + ',' + y);
        }
    }
    if (player.flags_placed.size === 40 && player.revealed.size === 216) {
        gameComplete(player);
    } else {
        player.setState({
            mine_field: mine_field_copy,
            timer_started: true,
            mines_remaining: player.state.mines_remaining + flags
        });
    }
};

export {renderMinefield, renderHeader, renderFooter, restart, gameComplete, gameOver, reveal};
