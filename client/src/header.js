import React, { Component } from 'react';
import './css/header.css';

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            face: ''
        }
    }

    createNewGame(){
        this.props.socket.emit('new-game');
    }

    render() {
        return (
            <div className={"header " + (this.props.face ||this.state.face)} onClick={() => this.createNewGame()} onContextMenu={e => e.preventDefault()}
                onMouseDown={e => { if (e.button === 0) this.setState({ face: "mouse-down" }) }} onMouseUp={() => this.setState({ face: '' })}
                onMouseLeave={() => this.setState({ face: '' })} />
        );
    }
}

export default Header;
