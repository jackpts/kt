import React from 'react';
let createReactClass = require('create-react-class');
// import musURL from '../../build/muson.json';
let musURL = 'http://localhost:8000/assets/build/muson.json';
import _ from 'lodash';

export default class App extends React.Component {
    render () {
        return (
            <div>
                <DoMain />
            </div>
        );
    }
}

export class DoMain extends React.Component {
    constructor () {
        super();
        this.state = {
            musCols : ['please wait..'],
            musData : []
        }
    }
    componentDidMount() {
        // this.fetchData().done()
        this.getMusonJSON()
    }

    render () {
        let cols=this.state.musCols;
        let data=this.state.musData;
        return (
            <section role="main">
                <Table cols={cols} data={data} />
                <Filter cols={cols} data={data} />
            </section>
        )
    }

    getMusonJSON () {
        fetch(musURL)
            .then((response) => response.json())
            .then((responseJSON) => {
                console.info('Success to get muson.json');
                //console.log(responseJSON);
                this.setState({
                    musCols: responseJSON.columns,
                    musData: responseJSON.data
                });
            })
            .catch((error) => { console.warn(error); });
    }
    /* async fetchData () {
        const response = await fetch(musURL);
        const json = await response.json();
        const musData = json.data;
        this.setState({musData: musData})
    } */
}

let Table = createReactClass({

    componentDidUpdate: function() {
        console.log('componentDidUpdate');
    },

    render: function () {
        let headerComponents = this.generateHeaders(),
            rowComponents = this.generateRows();

        return (
            <table className='mus-table'>
                <caption>Плейлист</caption>
                <thead>{headerComponents}</thead>
                <tbody>{rowComponents}</tbody>
            </table>
        );
    },

    generateHeaders: function() {
        let cols = this.props.cols;
        let cells = cols.map(function(colData) {
            return <th key={colData.key}>{colData.label}</th>;
        });
        return <tr key={'0'}>{cells}</tr>
    },

    generateRows: function() {
        let cols = this.props.cols,
            data = this.props.data;

        return data.map(function(item) {
            let cells = cols.map(function(colData) {
                return <td key={colData.key + item.id}>{item[colData.key]}</td>;
            });
            return <tr key={item.id}>{cells}</tr>;
        });
    }
});

let Filter = createReactClass({

    render: function () {
        let generateFilterContent = this.generateFilterContent();

        return (
            <div className='table-filter'>
                <h4>Фильтр</h4>
                <ul>{generateFilterContent}</ul>
            </div>
        );
    },

    generateFilterContent: function() {
        let cols = this.props.cols || [],
            data = this.props.data || [];

        return cols.map(function(colData) {
            if (colData.key && colData.key !== 'song') {
                let options = _.map(data, colData.key);
                return <li key={colData.key}>
                    <label>{colData.label}</label>
                    <select defaultValue={'Все'}>
                        <option key={'0'} defaultValue={'All'}>Все</option>
                        {options.map((opt, i) =>
                            <option key={i+1} value={opt}>{opt}</option>
                        )}
                    </select>
                </li>;
            }
        });
    }
});