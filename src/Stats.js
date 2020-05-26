import React, { Component } from 'react';
import Navigation from './Navigation';
import StatsIcon from './icons/stats.svg';
import { Spinner } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from "react-bootstrap-table2-paginator";
import './Stats.css';

const paginationOptions = {
    paginationSize: 10,
    hideSizePerPage: true
}

class Stats extends Component {

    render() {

        const columns = [
            {
              dataField: "id",
              hidden: true
            },
            {
              dataField: "city",
              text: "City"
            },
            {
              dataField: "activities",
              text: "Activities",
              sort: true
            },
            {
              dataField: "miles",
              text: "Distance (Miles)",
              sort: true
            },
            {
              dataField: "elevation",
              text: "Elevation Gain (Feet)",
              sort: true
            },
            {
              dataField: "hours",
              text: "Time (Hours)",
              sort: true
            }
        ]

        return (
            <div>
                <Modal 
                    show={this.props.data.cities.length === 0}
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                    <Modal.Body>
                    <div className="loading-center">
                        <p className="loading-text">Loading Statistics ...</p>
                        <Spinner animation="border" className="loading-spinner" />
                    </div>
                    </Modal.Body>
                </Modal>

                <Navigation />

                <img class="img-stats" src={StatsIcon}></img>
                <h1 className="black-header"> Workout Statistics </h1>

                <h3 className="stats-header">Activities by City</h3>

                <div class="bootstrap-table">
                    <BootstrapTable 
                        keyField='id' 
                        data={ this.props.data.cities } 
                        columns={ columns } 
                        bordered={ true }
                        striped
                        hover
                        condensed
                        pagination={paginationFactory(paginationOptions)}
                    />
                </div>
            </div>
        )
    }
}

export default Stats;