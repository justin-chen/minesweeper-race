import React, { Component } from 'react';

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            face: ''
        }
    }

    createNewGame(){
        if (this.props.face === 'dead' || this.props.face === 'cool' || this.props.timer_started) {
            this.props.socket.emit('new-game');
        }
        
    }

    render() {
        return (
            <div className={"header " + (this.props.face ||this.state.face)} onClick={() => this.createNewGame()} onContextMenu={e => e.preventDefault()}
                onMouseDown={e => { if (e.button === 0 && this.props.player === 'you') this.setState({ face: "mouse-down" }) }} onMouseUp={() => this.setState({ face: '' })}
                onMouseLeave={() => this.setState({ face: '' })} />
        );
    }
}

export default Header;
