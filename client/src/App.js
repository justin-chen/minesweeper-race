import React, { Component } from 'react';
import You from './you';
import Opponent from './opponent';
import Chat from './chat';
import { Grid, Col, Row, Button, FormControl } from 'react-bootstrap';


import io from 'socket.io-client';

class App extends Component {
  constructor(props) {
    super(props);

    this.socket = io('/');

    this.socket.on('connect', function () {
      this.setState({ socket_ready: true });
    }.bind(this));

    this.socket.on('redirect', function () {
      window.location.replace('https://' + window.location.hostname + ':' + window.location.port);
    });

    this.socket.on('opponent-joined', function () {
      this.setState({ opponent_joined: true });
    }.bind(this));

    this.socket.on('opponent-left', function () {
      this.setState({ opponent_joined: false });
    }.bind(this));

    this.state = {
      opponent_joined: window.location.pathname === '/' ? false : true
    };
  }

  copyToClipboard() {
    var copyText = document.getElementById("InviteLink");
    copyText.select();
    document.execCommand("Copy");
    copyText.blur();
  }

  render() {
    return (
      <div className="bgimg">
        <Grid fluid className="page ">
          <Row className="game page-height">
            <Col className="col-xl-4 col-lg-12" >
              <div>
                <You player='you' socket={this.socket} />
              </div>
            </Col>
            <Col className="col-xl-4 col-lg-12"  >
              <Chat socket={this.socket} />
            </Col>
            <Col className="col-xl-4 col-lg-12" >
              <div className="opponent-field">
                <Opponent player='opponent' socket={this.socket} />
              </div>
              <div className="invite-friend" style={{ zIndex: this.state.opponent_joined ? "-1" : "1" }}>
                <h3>Race against a friend</h3>
                Send the link below to your opponents:
                <br />
                {this.state.socket_ready &&
                  <div >
                    <FormControl style={{ display: 'inline-block' }} bsSize="small" readOnly type="text" className="invite-link" id="InviteLink" value={'https://' + window.location.hostname + '/' + this.socket.io.engine.id} />
                    <Button style={{ marginBottom: '4px' }} bsStyle="primary" onClick={this.copyToClipboard.bind(this)}>Copy</Button>
                  </div>
                }
              </div>
              <div className="footer">
                <a href="https://github.com/justin-chen" target="_blank">
                  <img src={require('./images/github.png')} style={{ height: "24px", width: "24px", marginBottom: "5px", marginRight: "5px" }} />
                  <div style={{ display: "inline-block" }}>Justin Chen</div>
                </a>
              </div>

            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default App;
