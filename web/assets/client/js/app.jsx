import React from 'react';
let musURL = '/assets/build/muson.json';
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
            musData0 : [],
            searchFields : [],
            searchValues : [],
            pageOfItems: [],
            filterOn: false,
            sortDir: 0,
            sortColumn: 'name',
            filteredOptions: []
        };
        this.filterChanged = this.filterChanged.bind(this);
        this.onChangePage = this.onChangePage.bind(this);
        this.setSortParams = this.setSortParams.bind(this);
    }
    
    componentWillMount() {
        this.getMusonJSON();
    }

    shouldComponentUpdate(nextProps, nextState) {
        return JSON.stringify(this.state) !== JSON.stringify(nextState);
    }

    filterChanged(field, value) {
        let fields = this.state.searchFields,
            values = this.state.searchValues,
            ind = fields.indexOf(field);
        if(value === 'Все' && ind > -1) {
            fields.splice(ind, 1);
            values.splice(ind, 1);
        } else if(value !== 'Все' && ind > -1){
            values[ind] = value;
        } else {
            fields.push(field);
            values.push(value);
        }

        console.log('values, fields:', values, fields);

        this.setState({
            searchValues: values,
            searchFields: fields,
            filterOn: !!fields.length
        });

        // table-filter multiselect working fix
        this.forceUpdate();
    }

    onChangePage(pageOfItems) {
        //console.log('call onChangePage=');
        this.setState({ pageOfItems: pageOfItems });
    }

    setSortParams(sortDir, sortColumn) {
        this.setState({
            sortColumn: sortColumn,
            sortDir: sortDir,
            musData: this.sortData(this.state.musData)
        });

    }

    sortData(dataToSort) {
        let sortColumn = this.state.sortColumn,
            sortDir = this.state.sortDir;

        return dataToSort.sort((a, b) => {
            if (a[sortColumn] === b[sortColumn]) return 0;

            if ((a[sortColumn] > b[sortColumn] && sortDir === 1)
                || (a[sortColumn] < b[sortColumn] && sortDir === 2))
                return 1;

            if ((a[sortColumn] < b[sortColumn] && sortDir === 1)
                || (a[sortColumn] > b[sortColumn] && sortDir === 2))
                return -1;
        });
    }

    filterData(dataToFilter) {
        let fields = this.state.searchFields,
            values = this.state.searchValues;

        return dataToFilter.filter(
            (music) => {
                let fieldsArray = [];
                fields.map(f => fieldsArray.push(music[f]));
                return _.isEqual(fieldsArray, values);
            }
        );
    }

    render () {
        let cols = this.state.musCols,
            data = this.state.musData,
            pageOfItems = this.state.pageOfItems,
            filterOn = this.state.filterOn,
            sortDir = this.state.sortDir,
            filteredOptions = this.state.filteredOptions;

        let paginationData = data,
            tableData = pageOfItems;

        paginationData = (sortDir > 0) ? this.sortData(paginationData) : this.state.musData0;
        if(filterOn) {
            paginationData = this.filterData(paginationData);
            tableData = this.filterData(tableData);
        }

        return (
            <section role="main">
                <main>
                    <Table cols={cols} data={tableData} setSortParams={this.setSortParams} />
                    <Filter cols={cols} options={filteredOptions} onChangeFilter={this.filterChanged} />
                </main>
                <Pagination data={paginationData} onChangePage={this.onChangePage} filterOn={filterOn} sortOn={sortDir} />
            </section>
        )
    }

    getMusonJSON () {
        fetch(musURL)
            .then((response) => response.json())
            .then((responseJSON) => {
                console.info('Success to get muson.json');
                this.setState({
                    musCols: responseJSON.columns,
                    musData: responseJSON.data,
                    musData0: responseJSON.data.slice(0)
                });
                this.setFilteredOptions();
            })
            .catch((error) => { console.warn(error); });
    }

    setFilteredOptions() {
        let cols = this.state.musCols || [],
            data = this.state.musData || [],
            filteredOptions = [];

        cols.map((colData) => {
            if (colData.key && colData.key !=='song') {
                let options = _.map(data, colData.key);
                let uniqOptions = options.filter((elem, index, self) => {
                    return index === self.indexOf(elem);
                });
                filteredOptions.push(
                    uniqOptions.sort((a,b) => {
                        if (a > b) return 1;
                        return -1;
                    })
                );
            }
        });

        this.setState({
            filteredOptions: filteredOptions
        });
    }
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
        this.props.setSortParams(sortDir, sortColumn);
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
            data = this.props.data;

        if(data.length < 1) {
            return <tr key={'1'}><td colSpan="4" key={'1'}>Sorry, nothing found!</td></tr>
        }
        return data.map((item) => {
            let cells = cols.map((colData) => {
                return <td key={colData.key + item.id}>{item[colData.key]}</td>;
            });
            return <tr key={item.id}>{cells}</tr>;
        });
    }
}

class Filter extends React.Component {

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
        let cols = this.props.cols,
            options = this.props.options;
        let self = this;

        //return if no options awhile
        if(options.length < 1) return;

        //remove object with song field
        let filteredCols = _.clone(cols);
        filteredCols = filteredCols.filter((el) => {
           return el.key !== 'song';
        });

        return filteredCols.map((colData, ind) => {
            if (colData.key && colData.key !== 'song') {
                return <li key={colData.key}>
                    <label>{colData.label}</label>
                    <select defaultValue={'Все'} onChange={event => self.props.onChangeFilter(colData.key, event.target.value) } >
                        <option key={'0'}>Все</option>
                        { options[ind].map((opt, i) =>
                                <option key={i+1} value={opt}>{opt}</option>
                            )
                        }
                    </select>
                </li>;
            }
        });
    }
}

class Pagination extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            pager: {},
            pageSet: [4, 6, 10, 20],
            pageSize: 4
        };
    }

    componentDidMount() {
        window.addEventListener("resize", this.setPagingStyle.bind(this));
    }

    componentWillMount() {
        let data = this.props.data;
        if (data && data.length) {
            this.setPage(this.props.initialPage);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (
            this.props.data !== prevProps.data ||
            this.props.filterOn !== prevProps.filterOn ||
            this.props.sortOn !== prevProps.sortOn
        ) {
            this.setPage(this.state.pager.currentPage);
          }
        if (this.state.pageSize !== prevState.pageSize) {
              this.setPage(this.props.initialPage);
        }

        this.setPagingStyle();
    }

    setPage(page) {
        let data = this.props.data,
            pager = this.state.pager,
            pageSize = this.state.pageSize;

        pager.totalPages = Math.ceil(data.length / pageSize);

        if (page < 1 || page > pager.totalPages) { return; }
        // get new pager object for specified page
        pager = this.getPager(data.length, page);
        // get new page of items from items array
        let pageOfItems = data.slice(pager.startIndex, pager.endIndex + 1);
        this.setState({ pager: pager });
        // call change page function in parent component
        this.props.onChangePage(pageOfItems);
    }

    getPager(totalItems, currentPage) {
        // default to first page
        currentPage = currentPage || 1;
        // default page size is pageSize
        let pageSize = this.state.pageSize;
        // calculate total pages
        let totalPages = Math.ceil(totalItems / pageSize);

        let startPage, endPage;
        if (totalPages <= pageSize) {
            // less than pageSize total pages so show all
            startPage = 1;
            endPage = totalPages;
        } else {
            // more than pageSize total pages so calculate start and end pages
            let middlePage = Math.ceil(pageSize / 2);
            if (currentPage <= middlePage + 1) {
                startPage = 1;
                endPage = pageSize;
            } else if (currentPage + 1 >= totalPages) {
                startPage = totalPages - (middlePage + 1);
                endPage = totalPages;
            } else {
                startPage = currentPage - middlePage;
                endPage = currentPage + 1;
            }
        }

        // calculate start and end item indexes
        let startIndex = (currentPage - 1) * pageSize;
        let endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

        // create an array of pages to ng-repeat in the pager control
        let pages = _.range(startPage, endPage + 1);

        // return object with all pager properties required by the view
        return {
            totalItems: totalItems,
            currentPage: currentPage,
            pageSize: pageSize,
            totalPages: totalPages,
            startPage: startPage,
            endPage: endPage,
            startIndex: startIndex,
            endIndex: endIndex,
            pages: pages
        };
    }

    setPagingStyle() {
        let table = document.querySelector('.mus-table'),
            tfilter = document.querySelector('.table-filter');
        if (table && tfilter) {
            let pagingOffset = Math.ceil((document.documentElement.clientWidth - table.offsetWidth - tfilter.offsetWidth) / 2 - 15);
            let paging = document.querySelector('.paging');
            paging && (paging.style.right = pagingOffset + 'px');
        }
    }

    paging() {
        let curPage = this.state.pageSize;
        return <ul className="paging">
                    {this.state.pageSet.map((p) => {
                       return <li key={p} className={curPage === p ? 'active' : ''}
                                  onClick={() => this.setState({ pageSize: p })}>{p}</li>
                    })}
              </ul>;
    }

    render() {
        let pager = this.state.pager,
            paging = this.paging();

        if (!pager.pages || pager.pages.length <= 1) {
                // don't display pager if there is only 1 page (return null)
                // but return a paging anyway;
            return  (
                    <footer>
                        {paging}
                    </footer>
            );
        }

        return (
            <footer>
                <ul className="pagination">
                    {/*<li className={pager.currentPage === 1 ? 'disabled' : ''}>
                        <a href='#' onClick={() => this.setPage(1)}>First</a>
                    </li>*/}
                    <li className={pager.currentPage === 1 ? 'disabled' : ''}>
                        <a href='#' onClick={() => this.setPage(pager.currentPage - 1)} className={'prev'}>&#60;</a>
                    </li>
                    <li className={pager.startPage > 1 ? 'more' : 'more disabled'}>
                        <span>...</span>
                    </li>
                    {pager.pages.map((page, index) =>
                        <li key={index} className={pager.currentPage === page ? 'active' : ''}>
                            <a href='#' onClick={() => this.setPage(page)}>{page}</a>
                        </li>
                    )}
                    <li className={pager.endPage < pager.totalPages ? 'more' : 'more disabled'}>
                        <span>...</span>
                    </li>
                    <li className={pager.currentPage === pager.totalPages ? 'disabled' : ''}>
                        <a href='#' onClick={() => this.setPage(pager.currentPage + 1)} className={'next'}>&#62;</a>
                    </li>
                    {/*<li className={pager.currentPage === pager.totalPages ? 'disabled' : ''}>
                        <a href='#' onClick={() => this.setPage(pager.totalPages)}>Last</a>
                    </li>*/}
                </ul>

                {paging}
            </footer>
        );
    }
}
Pagination.defaultProps = {
    initialPage: 1
};