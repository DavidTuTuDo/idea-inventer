import {makeAutoObservable,
    action,
    observable,
    comparer, computed, autorun, runInAction} from "mobx";

class Question {

    questions = [];

    @action
    setChoice(index, value) {
        if (this.questions.length > 0) {
            this.questions[index].self = `${value}`;
        }
    }

   getAll(){
        return this.questions;
    }

    @action
    addQuestion(q) {
        this.questions.push(q);
    }

    constructor(props) {
        makeAutoObservable(this);
    }

}

export default Question;

