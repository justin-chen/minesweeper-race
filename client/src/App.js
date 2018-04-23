import React, { Component } from 'react';
import You from './you';
import Opponent from './opponent';
import { Grid, Col, Row, Button, FormControl } from 'react-bootstrap';
import './css/App.css';
import './css/square.css';
import io from 'socket.io-client';

class App extends Component {
  constructor(props) {
    super(props);

    this.socket = io('http://localhost:5000');

    this.socket.on('connect', function () {
      this.setState({ socket_ready: true });
    }.bind(this));

    this.socket.on('redirect', function () {
      window.location.replace('http://' + window.location.hostname + ':' + window.location.port);
    }.bind(this));

    this.socket.on('opponent-joined', function () {
      console.log('Opponent joined');
      this.setState({ opponent_joined: true });
    }.bind(this));

    this.socket.on('opponent-left', function () {
      console.log('Opponent left');
      this.setState({ opponent_joined: false });
    }.bind(this));

    this.state = {
      response: ''
    };
  }

  copyToClipboard() {
    var copyText = document.getElementById("InviteLink");
    copyText.select();
    document.execCommand("Copy");
    copyText.blur();
  }

  /*componentDidMount() {
    this.callApi()
      .then(res => this.setState({ response: res.express }))
      .catch(err => console.log(err));
  }

  callApi = async () => {
    const response = await fetch('/api/hello');
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);
    console.log(body);
    return body;
  };*/

  render() {
    return (
      <div>
        <Grid fluid className="page">
          <Row className="game">
            <Col className="col-xl-5 col-lg-12">
              <div>
                <You player='you' socket={this.socket} />
              </div>
            </Col>
            <Col className="col-xl-2 col-lg-12 ">
              Chat
          </Col>
            <Col className="col-xl-5 col-lg-12 ">
              <div className="opponent-field">
                <Opponent player='opponent' socket={this.socket} />
              </div>
              {!this.state.opponent_joined && window.location.pathname === '/' && 
                <div className="invite-friend">
                  <h3>Play against a friend</h3>
                  Send the link below to your opponent:
                <br />
                  {this.state.socket_ready &&
                    <div >
                      <FormControl style={{ display: 'inline-block' }} bsSize="small" readOnly type="text" className="invite-link" id="InviteLink" value={"localhost:3000/" + this.socket.io.engine.id} />
                      <Button style={{ marginBottom: '4px' }} bsStyle="primary" onClick={this.copyToClipboard.bind(this)}>Copy</Button>
                    </div>
                  }
                </div>
              }
            </Col>
          </Row>
        </Grid>

      </div>
    );
  }
}

export default App;
