import Question from './question';

class RootStore {

    constructor() {
        this.question = new Question(this);
    }


}

export default RootStore;
