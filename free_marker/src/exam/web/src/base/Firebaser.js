import _ from "lodash";
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/firestore';
import React from 'react';
import config from "../config";
import { utiller as Util, exceptioner as ERROR } from "utiller";

class Firebaser {

    app;
    database;
    firestore;
    authentication;

    constructor(props) {
        this.initFirebase();
    }

    db() {
        return this.database;
    }

    fire(){
        return this.firestore;
    }

    auth() {
        return this.authentication;
    }

    currentUser() {
        return this.authentication.currentUser
    }

    getServerTime() {
        return firebase.firestore.FieldValue.serverTimestamp();
    }

    initFirebase() {
        if (!firebase.apps.length) {
            this.app = firebase.initializeApp(config.firebase);
        } else {
            this.app = firebase.app();
        }
        this.authentication = this.app.auth();
        this.database = this.app.database();
        this.firestore = this.app.firestore();
    }

    async authByCredential(credential) {
        await this.authentication.signOut();
        let token = firebase.auth.GoogleAuthProvider.credential(Util.getExistOne(credential.idToken,credential.oauthIdToken));
        try {
            const result = await this.authentication.signInWithCredential(token);
            return {
                credential: result.credential,
                user: result.user
            }
        } catch (error) {
            console.error(`code`, 1001,
                `authByCredential`,
                error, credential);
        }
    }


    getLoginConfig(component,pathOfAfterSucceed = '/') {
        return {
            signInFlow: 'popup',
            /**
             Redirect to / after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
             */
             signInSuccessUrl: pathOfAfterSucceed,
            signInOptions: [
                firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                firebase.auth.FacebookAuthProvider.PROVIDER_ID,
                firebase.auth.TwitterAuthProvider.PROVIDER_ID,
            ],
            callbacks: {
                signInSuccessWithAuthResult: function (authResult, redirectUrl) {
                    /**
                     User successfully signed in.
                     Return type determines whether we continue the redirect automatically
                     or whether we leave that to developer to handle.

                     console.log(`authResult`, authResult);
                     console.log(`redirectUrl`, redirectUrl);
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


export default new Firebaser();
