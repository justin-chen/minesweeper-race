import React, { Component } from 'react';
import { FormControl } from 'react-bootstrap';

class Chat extends Component {
    constructor(props) {
        super(props);
        this.socket = this.props.socket;
        this.socket.on('opponent-msg', msg => this.opponentMessage(msg));
        this.socket.on('opponent-joined', this.opponentJoined.bind(this, true));
        this.socket.on('opponent-left', this.opponentJoined.bind(this, false));
    }

    type(target) {
        if (target.charCode === 13) {
            var ul = document.getElementById("list");
            var msg = document.getElementById("msg");
            if (msg.value) {
                var li = document.createElement("li");
                li.className = "message-player";
                li.appendChild(document.createTextNode(msg.value));
                ul.appendChild(li);
                ul.scrollTop = ul.scrollHeight;
                this.socket.emit('msg', msg.value);            
                msg.value = null;
            }
        }
    }

    opponentMessage(msg) {
        var ul = document.getElementById("list");
        var li = document.createElement("li");
        li.className = "message-opponent";
        li.appendChild(document.createTextNode(msg));
        ul.appendChild(li);
        ul.scrollTop = ul.scrollHeight;
    }

    opponentJoined(joined) {
        var ul = document.getElementById("list");
        var li = document.createElement("li");
        var msg = joined ? 'Your opponent has joined the room.' : 'Your opponent has left the room.';
        li.className = "message-opponent join";
        li.appendChild(document.createTextNode(msg));
        ul.appendChild(li);
        ul.scrollTop = ul.scrollHeight;
    }

    render() {
        return (
            <div className="chat" style={{ marginTop: "90px", position: "relative" }}>
                <div className="chat-area">
                    <ul className="messages style-1" id="list">
                    </ul>
                </div>
                <FormControl className="chat-input" id="msg" type="text" placeholder="Type a message..." onKeyPress={this.type.bind(this)} />
            </div>
        );
    }
}

export default Chat;