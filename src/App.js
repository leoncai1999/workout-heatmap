import React, { Component } from 'react'
import { BrowserRouter, HashRouter, Route } from "react-router-dom"
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import Heatmap from './Heatmap'
import Welcome from './Welcome'
import Stats from './Stats'

class App extends Component {

  render() {
    
    return (
      <BrowserRouter>
        <Route exact path={'/'} component={Welcome} />
        <Route path={'/map'} component={Heatmap} />
        <Route path={'/map-sample'} component={Heatmap} />
        <Route path={'/callback'} component={Heatmap} />
        <Route path={'/stats'} component={Stats} />
      </BrowserRouter>
    );
  }
}

export default App;
