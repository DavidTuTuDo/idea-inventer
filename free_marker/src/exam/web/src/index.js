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
import {
    utiller as Util,
    exceptioner as ERROR,
    pooller as InfinitePool,
} from "utiller";
import EventBus from "./base/CommonEventBus";
import UserInfo from "./userInfo";
import Cookie from './Cookie';

class App extends BaseApp {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

    anotherExam;

    mount() {
        super.mount();
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
        this.pushPage(page999);
    }

    registerEvent() {
        const self = this;
        EventBus.self().on('onAuthStateChange', async () => {
            const store = self.getNavigatorStore()
            if (UserInfo.isLoginInSucceed()) {
                const user = UserInfo.getCurrentUser(false)
                /** 應該在login 以及 signInByCrendential 就會把 crendentail 存到 cache */
                const credential = Cookie.getCredential();
                store.setUserInfo(user);
                store.setCredential(credential);
            }
            store.updateLoginButtonStatus();
        });
    }

    /** -------------------- async api -------------------- **/

}

const self = new App();
self.registerEvent();
self.mount();
export {self as Application} ;
