import "./Exam.css";
import {Button, Typography, Card} from '@material-ui/core';
import _ from 'lodash'
import React from "react";
import moment from 'moment';
import {utiller as Util} from "utiller";
import firebase from 'firebase/app';
import 'firebase/database';
import {configerer} from "configerer";
import {Link} from 'react-router-dom';

import {observer, inject} from "mobx-react";
import {makeObservable, observable, computed, action} from "mobx";

const QUESTION_COUNT = 25;

@inject('question')
@observer
class Index extends React.Component {

    componentDidMount() {
        this.App()
    }

    nextPath(path) {
        this.props.history.push(path);
    }

    constructor(props) {
        super(props);
        makeObservable(this);
        this.startTime = _.now();
        this.questionStore = this.props.question;
        this.questions = this.questionStore.getAll();
        console.log('extra props: ' + this.props.extra);
        console.log('id props: ' + this.props.match.params.id);
    }

    @observable
    finish = false;

    @action
    setFinish() {
        this.finish = true;
    }

    App = () => {
        const self = this;
        const firebaseConfig = {
            apiKey: "AIzaSyDGYMHixa7JZXGubz9gfTy9mgOSzXStdr0",
            authDomain: "mimi19up.firebaseapp.com",
            databaseURL: "https://mimi19up.firebaseio.com",
            projectId: "mimi19up",
            storageBucket: "mimi19up.appspot.com",
            messagingSenderId: "885949564208",
            appId: "1:885949564208:web:1e67065baff3c73d6ab4f5",
            measurementId: "G-21K036VD7M"
        };
        let app = undefined;
        if (!firebase.apps.length) {
            app = firebase.initializeApp(firebaseConfig);
        } else {
            app = firebase.app(); // if already initialized, use that one
        }
        this.database = app.database();
        this.getValues(this.database, `${configerer.REFERENCE_ROOT}/${configerer.REFERENCE_QUESTION}`)
            .then((result) => {
                const _qs = _.sampleSize(_.values(result.val()), QUESTION_COUNT);
                for (const q of _qs) {
                    this.questionStore.addQuestion(q);
                }
            });
    }

    getSplitStringByABCD(string) {
        const choice = string.split(new RegExp(`\\([A-D]\\)`, `g`));
        return _.tail(choice).map((c, index) => `(${this.getABCDString(index + 1)}) ${_.trim(c)}`);
    }

    getABCDString(index) {
        switch (index) {
            case 1:
                return 'A';
            case 2:
                return 'B';
            case 3:
                return 'C';
            case 4:
                return 'D';
            case 5:
                return 'E';
            default:
                return 'Wow~';
        }
    }

    async fetchOnceByConstraint(db, refPath, key) {
        let ref = db.ref(refPath);
        const snapshot = await ref.orderByKey().startAt(`${key.trim()}`).endAt(`${key.trim()}\uf8ff`).once("value");
        return snapshot;
    }

    async getValues(db, refPath) {
        return await db.ref(refPath).once('value');

    }

    async setValue(db, refPath, obj) {
        return await db.ref(refPath).set(obj);

    }

    /** self 就是你選擇的答案 */
    getQuestion(index, question) {
        const self = question.self;
        const questionIndex = index;
        const answer = question.answer;
        const topic = _.trim(question.topic);
        const from = `${question.year}年-${question.subject}-${question.type}-選擇 ${question.cid}-${question.uid}`;
        const choices = this.getSplitStringByABCD(question.choice);

        return (
            <Card
                key={`questionOf${index}`}
                className='QuestionFrame'>

                <div className='LabelAnswerFrame'>

                    <div className='TopicFrame'>
                        <Typography
                            className='Topic'
                            variant={'h4'}
                            align="left"> {index + 1}.{topic}</Typography>
                    </div>
                </div>

                <div style={{height: '2vh'}}/>

                {_.map(choices, (choice, choiceIndex) =>
                    <div className='ButtonWrapper'
                         key={`choiceButtonOf${choiceIndex}`}
                    >

                        <Button
                            style={{
                                fontSize: '1.6vh',
                                minHeight: '5.5vh',
                                textAlign: 'left'
                            }}
                            variant={"outlined"}
                            size={"large"}
                            onClick={() => self ? false : this.updateChoice(question, questionIndex, choiceIndex)}
                            color={this.getChoiceButtonColor(question, choiceIndex)}
                        >{Util.getNormalizedStringNotEndWith(choice, ' ', ',')}</Button>

                    </div>)}

                <Typography
                    className='Tip'
                    align="left"
                    variant={'h6'}>{from}</Typography>

            </Card>
        )
    }

    updateChoice = async (question, questionIndex, choiceIndex) => {
        const self = `${this.getABCDString(choiceIndex + 1)}`;
        this.questionStore.setChoice(questionIndex, self);
        if (!_.isEqual(self, question.answer)) {
            /** do upload wrong */
            const reply = {
                timestamp: _.now(),
                dateTime: moment().format("YYYY-MM-DD-HH-mm-ss"),
                spendTime: _.now() - this.startTime,
                qid: question.uid,
                wrongOfAnswer: self,
            }

            if (configerer.DEBUG_MODE) {
                await this.setValue(this.database,
                    `${configerer.REFERENCE_ROOT}/${configerer.REFERENCE_QUESTION_REPLY_RECORD}/${configerer.REFERENCE_QUESTION_REPLY_WRONG}/${reply.dateTime}`,
                    reply);
            }

            this.startTime = _.now();
        }

    }


    getChoiceButtonColor(question, index) {
        if (!question.self) return 'default';

        if (_.isEqual(question.answer, `${this.getABCDString(index + 1)}`))
            return 'primary';

        if (_.isEqual(question.self, `${this.getABCDString(index + 1)}`))
            return 'secondary';

        return 'default';

    }

    renderQsView() {
        if (!_.isEmpty(this.questions)) {
            return this.questions.map((each, index) => this.getQuestion(index, each));
        } else {
            return <div/>
        }
    }

    render() {
        return (
            <div className="App">
                <Typography className='Label'
                            align="center"
                            variant="h4">題目下載中</Typography>

                <Button
                    style={{
                        fontSize: '2vh',
                        minHeight: '5.5vh',
                        textAlign: 'left',
                        marginTop: '2vh',
                        marginLeft: '2vh',
                        marginRight: '2vh',
                        marginBottom: '2vh',
                    }}
                    variant={"contained"}
                    size={"large"}
                    component={ Link }
                    to="/test2/ewjiojr"
                    color={"primary"}
                >到下一頁</Button>

            </div>
        );
    }
}

// const sample = {
//     q: '問題1問題1問題1問題1問題1問題1問題1問題1問題1問題1問題1',
//     c: ['A選項A選項A選項A選項A選項A選項A選項',
//         'B選項B選項B選項B選項B選項B選項B選項B選項B選項B選項',
//         'C選項C選項C選項C選項C選項C選項C選項C選項C選項',
//         'D選項D選項D選項D選項D選項D選項D選項'],
//     f: '109-地特-選擇題4',
// };

// let question = _.times(10, () => sample).map((each) => getQuestion(each.q, each.f, ...each.c));


export default Index
