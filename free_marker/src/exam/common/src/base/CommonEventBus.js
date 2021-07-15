import EventBus from "js-event-bus";
class CommonEventBus {

    constructor() {
        this.instance = new EventBus();
    }

    self(){
        return this.instance;
    }

}

export default new CommonEventBus()
