import React, { Component } from 'react';
import Board from './board';
import './css/App.css';
import './css/square.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      response: ''
    };
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
      <div className="game" >
        <div className="game-board player">
          <Board />
        </div>
        {/*<div className="game-board" className="opponent">
          <Board />
    </div>*/}

      </div>


    );
  }
}

export default App;
