import React, { Component } from 'react'
import { HashRouter, Route } from "react-router-dom"
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import Heatmap from './Heatmap'

class App extends Component {

  render() {
    
    return (
      <HashRouter basename='/'>
        <Route path="/" component={Heatmap} />
      </HashRouter>
    );
  }
}

export default App;
