import './App.css';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import Brain  from "./Brain";
import _ from 'lodash'
import React from "react";
import databaser from 'databaser';


const sample = {
    q: '問題1問題1問題1問題1問題1問題1問題1問題1問題1問題1問題1',
    c: ['A選項A選項A選項A選項A選項A選項A選項',
        'B選項B選項B選項B選項B選項B選項B選項B選項B選項B選項',
        'C選項C選項C選項C選項C選項C選項C選項C選項C選項',
        'D選項D選項D選項D選項D選項D選項D選項'],
    f: '109-地特-選擇題4',
};

function App() {
    // const self = new databaser({});
    // self.init().then();

    const brain = new Brain();
    brain.below();

    return (

        <div className="App">
            <header className="App-header">
                {_.times(20, () => sample).map((each) => getQuestion(each.q, each.f, ...each.c, brain.below()))}

            </header>
        </div>
    );
}
function AppAS() {



}

function getQuestion(question = 'Empty Question', from, ...choice) {
    return (
        <Card className='QuestionFrame'>

            <div className='LabelAnswerFrame'>

                <Typography className='Answer'
                            variant={"text"}>(C)</Typography>

                <Typography className='Label'
                            align="left"
                            variant="h7">1. {question}</Typography>

            </div>

            {_.map(choice, (each) =>
                <div className='ButtonWrapper'>
                    <Button
                        size={"large"}
                        className='Button'
                        variant={"outlined"}>{each}</Button>
                </div>)}

            <Typography className='Tip'
                        align="left"
                        variant="body2">{from}</Typography>

        </Card>
    )
}

export default App
