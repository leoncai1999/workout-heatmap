import React, { Component } from 'react';
import Navigation from './Navigation';
import StatsIcon from './icons/stats.svg';
import BootstrapTable from 'react-bootstrap-table-next';
import './Stats.css';

class Stats extends Component {

    render() {
        console.log("props are")
        console.log(this.props.data)
        return (
            <div>
                <Navigation />
                <img class="img-stats" src={StatsIcon}></img>
                <h1 className="black-header"> Workout Statistics </h1>
            </div>
        )
    }
}

export default Stats;