import React, { Component } from 'react';
import { HashRouter, Route } from "react-router-dom";
import Heatmap from './Heatmap'

class App extends Component {

  render() {
    
    return (
      <HashRouter basename='/'>
        <Route exact path="/" component={Heatmap} />
        <Route path="/callback" component={Heatmap} />
      </HashRouter>
    );
  }
}

export default App;
