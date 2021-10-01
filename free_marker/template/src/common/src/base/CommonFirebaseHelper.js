import {utiller as Util, exceptioner as ERROR} from "utiller";
import _ from "lodash";
import BaseFirebase from "./BaseFirebase";
import CommonPoolHelper from "./CommonPoolHelper";
import EventBus from "./CommonEventBus";
import libpath from 'path';

class CommonFirebaseHelper extends BaseFirebase {

    constructor() {
        super();
        if (this.auth() === undefined) return;

        if (_.isFunction(this.auth().onAuthStateChanged)) {
            this.auth().onAuthStateChanged((user) => {
                const event = require('../event').default;
                event.emitAuthStateChanged(user);
            })
        }

    }

    firestore() {
        return this.core().firestore();
    }

    database() {
        return this.core().database();
    }

    auth() {
        return this.core().auth();
    }

    storage() {
        return this.core().storage();
    }

    getCurrentUser() {
        return this.auth().currentUser;
    }

    getUid() {
        const user = this.auth().currentUser;
        return Util.exist(user) ? user.uid : '';
    }

    getServerTimeSymbol() {
        return this.getFirebaseLibrary().FieldValue.serverTimestamp();
    }

    currentUser() {
        return this.auth().currentUser;
    }


    async logout() {
        Util.appendInfo('sign out called');
        await this.auth().signOut();
    }

    credential() {
    }

    getTimeStampObj(millis) {
        const timestamp = this.getFirebaseLibrary().Timestamp.fromMillis(millis);
        return timestamp;
    }

    async getCurrentServerTimeStamp() {
        await this.firestore().collection('public').doc('timestamp').set({serverTime: this.getServerTimeSymbol()})
        const timestamp = await this.firestore().collection('public').doc('timestamp').get();
        return timestamp.data().serverTime;
    }

    async signInWithExistedCredential(credential) {
        const self = this;
        const asyncTask = async () => {
            Util.appendInfo('signInWithExistedCredential start...');
            let token = self.getAuthLibrary().GoogleAuthProvider.credential(Util.getExistOne(credential.idToken, credential.oauthIdToken));
            try {
                const result = await self.auth().signInWithCredential(token);
                Util.appendInfo('signInWithExistedCredential finished...');

                return {
                    credential: result.credential,
                    user: result.user
                }
            } catch (error) {
                /** 如果已經是登入狀況又呼叫的話, 可能會跑進去 stale in log-in */
                throw new ERROR(error)
            }
        }
        return await CommonPoolHelper.submitTo('submit', asyncTask, 'high', 'signInWithExistedCredential');
    }

    getLoginConfig(component, pathOfAfterSucceed = '/', succeedAsyncTask) {
        return {
            signInFlow: 'popup',
            /**
             Redirect to / after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
             */
            // signInSuccessUrl: pathOfAfterSucceed,
            signInOptions: [
                this.getAuthLibrary().GoogleAuthProvider.PROVIDER_ID,
                this.getAuthLibrary().FacebookAuthProvider.PROVIDER_ID,
                this.getAuthLibrary().TwitterAuthProvider.PROVIDER_ID,
            ],
            callbacks: {
                signInSuccessWithAuthResult: function (authResult, redirectUrl) {
                    /**
                     User successfully signed in.
                     Return type determines whether we continue the redirect automatically
                     or whether we leave that to developer to handle.

                     Util.appendInfo(`authResult`, authResult);
                     Util.appendInfo(`redirectUrl`, redirectUrl);
                     */

                    const Cookie = require('../cookie').default;
                    Cookie.setCredential(authResult.credential);
                    if (_.isFunction(succeedAsyncTask)) {
                        succeedAsyncTask(authResult.user).then()
                    }
                    return true;
                },
                /**
                 uiShown: function() {
                Hide the loader.
                document.getElementById('loader').style.display = 'none';
            }
                 */
            },
        };
    }

    /**
     * @deprecated 根本沒用到
     */
    async reAuthWithCredential(credential) {
        await this.auth().signOut();
        let token = this.getAuthLibrary().GoogleAuthProvider.credential(Util.getExistOne(credential.idToken, credential.oauthIdToken));
        try {
            const result = await this.auth().reauthenticateWithCredential(token);
            return {
                credential: result.credential,
                user: result.user
            }
        } catch (error) {
            throw new ERROR(error)
        }
    }

    async uploadImage(blob, folder = 'public') {
        const asyncTask = async () => {
            const ref = this.storage().ref();
            const uploadPath = libpath.join('./', folder, blob.name);
            Util.appendInfo(`storage upload path => ${uploadPath}`);
            const uploadTask = await ref.child(uploadPath).put(blob);
            const url = await uploadTask.ref.getDownloadURL();
            return url;
        }
        return await CommonPoolHelper.submitTo('submit', asyncTask, 'high', 'uploadImage');
    }

}


export default new CommonFirebaseHelper();
