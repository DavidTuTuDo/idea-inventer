const edit = true;
import EventBus from "js-event-bus";

class CommonEventBus {
    constructor() {
        this.instance = new EventBus();
    }

    self() {
        return this.instance;
    }

    emit(eventName, ...params) {
        this.instance.emit(eventName, null, ...params);
    }
}

export default new CommonEventBus();
