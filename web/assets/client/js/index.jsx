import React from 'react';
import {render} from 'react-dom';
let createReactClass = require('create-react-class');
import App from './app.jsx';
require("../scss/layout.scss");

import {
    Router,
    Route,
    browserHistory,
    IndexRoute,
    Link,
    Redirect,
    IndexRedirect
} from 'react-router';

/*import {
    Router,
    Route
} from 'react-router-dom'; */

// let history = require('history').createHistory || {};

let Homepage = createReactClass({
    render: function() {
        return (
            <App />
    )
    }
});


let Homepage2 = createReactClass({
    render: function() {
        return (
            <App />
    )
    }
});

let Homepage404 = createReactClass({
    render: function() {
        return (
            <img src="http://images5.fanpop.com/image/photos/26100000/MORE-LOL-ANIMALS-mintys-funny-stuff-26135012-500-375.jpg" />
        )
    }
});

render((
    <Router history = {browserHistory}>
        <Route path="/">
            <IndexRoute component={Homepage}/>
            <Route path="muson" component={Homepage2}/>
            <Route path="*" component={Homepage404}/>
        </Route>
    </Router>
), document.getElementById('root'));