import Firebaser from "./Firebaser";

class Admin {

    constructor() {
    }

    firestore() {
        const firestore =  Firebaser.fire();
        return firestore;
    }

    getServerTime() {
        return Firebaser.getServerTime();
    }

}

export default Admin
