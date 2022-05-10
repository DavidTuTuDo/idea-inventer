import { inject } from "mobx-react";
import BaseCelestialComponent from "./BaseCelestialComponent";
import {
  utiller as Util,
  exceptioner as ERROR,
  pooller as InfinitePool,
} from "utiller";
import _ from "lodash";
import libpath from "path";
import Button from "@material-ui/core/Button";
import AudioPlayer from "react-h5-audio-player";
import Typography from "@material-ui/core/Typography";
import { observer } from "mobx-react";
import Style from "../../style";
import React from "react";
import UserInfoRef from "../../base/BaseUserInfo";
import { Application } from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import BaseComponent from "../../base/BaseComponent";

@inject("celestial")
@observer
class CelestialComponent extends BaseCelestialComponent {
  /** -------------------- fields -------------------- **/
  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }
  /** -------------------- async api -------------------- **/
}
export default CelestialComponent;
