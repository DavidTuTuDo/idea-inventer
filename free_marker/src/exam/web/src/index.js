/** this code are generated, modify is no sense.
 author:David Tu,
 email:freshingmoon0725@gmail.com
 updateTime:2021-04-14-20-30-47
 */
import BaseApp from "./app";
import {Provider} from "mobx-react";
import Exam from "./component/exam";
import {Route} from "react-router-dom";
import React from "react";
import ExamStore from './store/exam';

class App extends BaseApp {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    anotherExam;

    mount() {
        super.mount();
    }

    setUserInfo(userInfo){
        this.store.userInfo.initial(userInfo);
    }

    pushNewPageIntoProviderSample = () => {
        if (this.anotherExam === undefined) {
            this.anotherExam = new ExamStore();
        }

        const page999 = <Route
            path={"/result9981"}
            render={(props) =>
                <Provider
                    exam={this.anotherExam}>
                    <Exam {...props}/>
                </Provider>
            }
        />
        this.pushPage( page999 );
    }

    /** -------------------- async api -------------------- **/

}

const self = new App();
self.mount();
export {self as Application} ;
