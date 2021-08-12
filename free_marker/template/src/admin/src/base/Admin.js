import firebaser  from "./Firebaser";
class Admin {

    firestore() {
        return firebaser.firestore();
    }

    getServerTime() {
        return firebaser.getServerTimeSymol();
    }

}

export default Admin;
