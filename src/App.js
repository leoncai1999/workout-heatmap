import React, { Component } from 'react'
import { BrowserRouter, HashRouter, Route } from "react-router-dom"
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import Heatmap from './Heatmap'
import Welcome from './Welcome'
import About from './About'

class App extends Component {

  render() {
    
    return (
      <BrowserRouter>
        <Route exact path={'/'} component={Welcome} />
        <Route path={'/map'} component={Heatmap} />
        <Route path={'/map-sample'} component={Heatmap} />
        <Route path={'/callback'} component={Heatmap} />
        <Route path={'/stats'} component={Heatmap}/>
        <Route path={'/about'} component={About}/>
      </BrowserRouter>
    );
  }
}

export default App;
