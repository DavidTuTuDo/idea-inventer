import _ from 'lodash'
import React from "react";
import moment from 'moment';
import {utiller as Util, exceptioner as ERROR,} from "utiller";

class BaseView extends React.Component {

    handleTextString(object) {
        if(typeof object === 'string') {
            return object
        } else {
            return _.toString(object)
        }
    }

}

export default BaseView
