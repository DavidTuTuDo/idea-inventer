import React, {createContext} from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {Provider} from 'mobx-react';
import {Route, BrowserRouter as Router, Switch} from "react-router-dom";
import {RouterStore, syncHistoryWithStore} from "mobx-react-router";
import {createBrowserHistory} from "history";

const history = syncHistoryWithStore(createBrowserHistory(), new RouterStore())

import Store from './store';

const store = new Store();
import Exam from './component/exam';
import Result from './component/result';

ReactDOM.render(
    <Provider question={store.question}>
        <Router
            history={history}>
            <Switch>

                <Route
                    key={'test0'}
                    exact={true}
                    path={"/"}
                    component={Exam}/>

                <Route
                    path={"/test0"}
                    component={Result}/>

                <Route
                    key={'test1'}
                    path={"/test1"}
                    render={(props) => <Exam
                        extra={'test1'}
                        {...props} />}/>

                <Route
                    key={'test2'}
                    path={"/test2/:id?"}
                    render={(props) => <Exam
                        extra={'test2'}
                        {...props} />}/>
            </Switch>
        </Router>
    </Provider>,
    document.getElementById('app'));

module.hot.accept();
