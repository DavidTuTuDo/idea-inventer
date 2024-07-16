/** this code are generated, modify is no sense.
 author:David Tu,
 email:freshingmoon0725@gmail.com
 updateTime:2021-04-28-15-15-13
 */
import {observer, inject} from "mobx-react";
import {withStyles} from '@mui/styles';
import {isMobile} from 'react-device-detect'
import ModularizedNavigatorComponent from "./ModularizedNavigatorComponent";

const useStyles = theme => ({
    paper: {
        marginTop: "50px",
        width: isMobile? '55%': '40%',
        backgroundColor: '#000000'
    }
});

@inject("navigator")
@observer
class NavigatorComponent extends ModularizedNavigatorComponent {
    /** -------------------- fields -------------------- **/
    /** -------------------- functions -------------------- **/

}

export default withStyles(useStyles)
(
    NavigatorComponent
)
;
