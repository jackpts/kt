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
            musData : [],
            searchFields : [],
            searchValues : []
        };
        this.myFilterCallback = this.myFilterCallback.bind(this);
        this.myTableCallback = this.myTableCallback.bind(this);
    }
    componentDidMount() {
        // this.fetchData().done()
        this.getMusonJSON();
    }

    myFilterCallback(field, value) {
        let searchFields = this.state.searchFields,
            searchValues = this.state.searchValues,
            ind = searchFields.indexOf(field);
        if(value === 'Все' && ind > -1) {
            searchFields.splice(ind, 1);
            searchValues.splice(ind, 1);
        } else if(value !== 'Все' && ind > -1){
            searchValues[ind] = value;
        } else {
            searchFields.push(field);
            searchValues.push(value);
        }
        this.setState({
            searchValues: searchValues,
            searchFields: searchFields
        });
    }

    //TODO to check if needed
    myTableCallback(sortedData) {
        console.log('sortedData=',sortedData);
        this.setState({
            musData: sortedData
        });
    }

    render () {
        let cols = this.state.musCols,
            data = this.state.musData,
            fields = this.state.searchFields,
            values = this.state.searchValues,
            sortCol = this.state.sortColumn,
            sortDir = this.state.sortDir;

        return (
            <section role="main">
                <Table cols={cols} data={data} fields={fields} values={values} sortCol={sortCol} sortDir={sortDir} callbackFromTable={this.myTableCallback} />
                <Filter cols={cols} data={data} callbackFromFilter={this.myFilterCallback} />
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

class Table extends React.Component {

    constructor() {
        super();
        this.thClick = this.thClick.bind(this);
        this.state = {
            sortDir: 0,
            sortColumn: 'name'
        };
    }

    render () {
        let headerComponents = this.generateHeaders(),
            rowComponents = this.generateRows();

        return (
            <table className='mus-table'>
                <caption>Плейлист</caption>
                <thead>{headerComponents}</thead>
                <tbody>{rowComponents}</tbody>
            </table>
        );
    }

    componentWillUpdate(nextProps, nextState) {
        this.sortMusTable(nextState);
    }

    thClick(e) {
        let sortColumn = this.state.sortColumn;
        let sortDir = this.state.sortDir;
        let curColumn = e.target.className.split(' ')[0];
        if(curColumn !== sortColumn) {
            sortDir = 1;
        } else {
            sortDir++;
            if(sortDir > 2) {
                sortDir = 0;
            }
        }
        sortColumn = curColumn;

        let columns = document.querySelectorAll('.mus-table th');
        Array.from(columns).map((col) => {
            if(col.className.indexOf(sortColumn) > -1) {
                if(sortDir === 0) {
                    col.className = sortColumn + ' unsorted';
                }
                if(sortDir === 1) {
                    col.className = sortColumn + ' asc';
                }
                if(sortDir === 2) {
                    col.className = sortColumn + ' desc';
                }
            } else {
                col.className = col.className.replace(/[a,d]e?sc/, 'unsorted');
            }
        });

        this.setState({
            sortDir: sortDir,
            sortColumn: sortColumn
        });
    }

    sortMusTable(lastState) {
        let sortColumn = lastState.sortColumn,
            sortDir = lastState.sortDir;

        if(sortDir === 0) {
            sortColumn = 'name';
            return this.props.data.sort(function(a, b){
                if (a[sortColumn] === b[sortColumn]) return 0;

                if (a[sortColumn] > b[sortColumn])
                    return 1;

                if (a[sortColumn] < b[sortColumn])
                    return -1;
            });
        }

        return this.props.data.sort(function(a, b){
            if (a[sortColumn] === b[sortColumn]) return 0;

            if ((a[sortColumn] > b[sortColumn] && sortDir === 1)
                || (a[sortColumn] < b[sortColumn] && sortDir === 2))
                return 1;

            if ((a[sortColumn] < b[sortColumn] && sortDir === 1)
                || (a[sortColumn] > b[sortColumn] && sortDir === 2))
                return -1;
        });
    }

    generateHeaders() {
        let cols = this.props.cols;
        let self = this;
        let cells = cols.map(colData =>{
            return <th key={colData.key} className={colData.key + ' unsorted'} onClick={self.thClick}>{colData.label}</th>;
        });
        return <tr key={'0'}>{cells}</tr>
    }

    generateRows() {
        let cols = this.props.cols,
            data = this.props.data,
            fields = this.props.fields,
            values = this.props.values;

        let filteredMusic = data.filter(
            (music) => {
                let fieldsArray = [];
                fields.map(f => fieldsArray.push(music[f]));
                return _.isEqual(fieldsArray, values);
            }
        );

        if(filteredMusic.length < 1) {
            return <tr key={'1'}><td colSpan="4" key={'1'}>Sorry, nothing found!</td></tr>
        }
        return filteredMusic.map(function(item) {
            let cells = cols.map(function(colData) {
                return <td key={colData.key + item.id}>{item[colData.key]}</td>;
            });
            return <tr key={item.id}>{cells}</tr>;
        });
    }
}

class Filter extends React.Component {
    constructor() {
        super();
        this.state = {
            search: ''
        };
    }

    render () {
        let generateFilterContent = this.generateFilterContent();

        return (
            <div className='table-filter'>
                <h4>Фильтр</h4>
                <ul>{generateFilterContent}</ul>
            </div>
        );
    }

    generateFilterContent() {
        let cols = this.props.cols || [],
            data = this.props.data || [];
        let self = this;

        return cols.map(function(colData) {
            if (colData.key && colData.key !== 'song') {
                let options = _.map(data, colData.key);
                return <li key={colData.key}>
                    <label>{colData.label}</label>
                    <select defaultValue={'Все'} onChange={event => self.props.callbackFromFilter(colData.key, event.target.value) } >
                        <option key={'0'} defaultValue={'All'}>Все</option>
                        {options.map((opt, i) =>
                            <option key={i+1} value={opt}>{opt}</option>
                        )}
                    </select>
                </li>;
            }
        });
    }
}