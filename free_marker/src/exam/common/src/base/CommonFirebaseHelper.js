
import { utiller as Util, exceptioner as ERROR } from "utiller";
import _ from "lodash";
import config from "../config";
import BaseFirebase from "./BaseFirebase";
import CommonPoolHelper from "./CommonPoolHelper";

class CommonFirebaseHelper extends BaseFirebase {

   firestore() {
       return this.core().firestore();
   }

   database() {
       return this.core().database();

   }

    auth() {
       return this.core().auth();
    }

    getCurrentUser(){
        return this.auth().currentUser;
    }

    getUid(){
       const user = this.auth().currentUser;
       return user? user.uid : '';

    }

    getServerTimeSymbol() {
        return this.getFirebaseLibrary().FieldValue.serverTimestamp();
    }

    currentUser() {
        return this.auth().currentUser;
    }

    async logout() {
        await this.auth().signOut();
    }

    getTimeStampObj(millis){
       const timestamp = this.getFirebaseLibrary().Timestamp.fromMillis(millis);
       return  timestamp;
    }

    async getCurrentServerTimeStamp(){
        await this.firestore().collection('public').doc('timestamp').set({serverTime:this.getServerTimeSymbol()})
        const timestamp = await this.firestore().collection('public').doc('timestamp').get();
        return timestamp.data().serverTime;
    }

    async signInWithCredential(credential) {
        const self = this;
        const asyncTask = async () => {
            Util.appendInfo('signInWithCredential start...');
            await self.auth().signOut();
            let token = self.getAuthLibrary().GoogleAuthProvider.credential(Util.getExistOne(credential.idToken, credential.oauthIdToken));
            try {
                const result = await self.auth().signInWithCredential(token);
                Util.appendInfo('signInWithCredential finished...');

                return {
                    credential: result.credential,
                    user: result.user
                }
            } catch (error) {
                throw new ERROR(error)
            }
        }
        return await CommonPoolHelper.submitTo('submit', asyncTask, 'high','signInWithCredential');
    }



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


    getLoginConfig(component, pathOfAfterSucceed = '/') {
        return {
            signInFlow: 'popup',
            /**
             Redirect to / after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
             */
            signInSuccessUrl: pathOfAfterSucceed,
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

                    component.props.navigator.setCredential(authResult.credential);
                    component.props.navigator.setUserInfo(authResult.user);
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

}


export default new CommonFirebaseHelper();
