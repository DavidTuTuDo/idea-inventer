const edit = true;
import "swiper/css/pagination";
import "swiper/css";
import { inject } from "mobx-react";
import BaseBacchusComponent from "./BaseBacchusComponent";
import { utiller as Util, exceptioner as ERROR, pooller as InfinitePool } from "utiller";
import _ from "lodash";
import libpath from "path";
import maenads from "../maenads";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import NavigateNext from "@mui/icons-material/NavigateNext";
import Typography from "@mui/material/Typography";
import { Swiper } from "swiper/react";
import { observer } from "mobx-react";
import { SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import Style from "../../style";
import i18n from "../../i18n";
import React from "react";
import UserInfoRef from "../../base/BaseUserInfo";
import { Application } from "../../";
import Config from "../../config";
import Router from "../../router";
import Cookie from "../../cookie";
import BaseComponent from "../../base/BaseComponent";

@inject("bacchus")
@observer
class BacchusComponent extends BaseBacchusComponent {
  /** -------------------- fields -------------------- **/

  /** -------------------- functions -------------------- **/

  constructor(props) {
    super(props);
  }

  onBacchusBackToHomeChipClicked(param) {
    Router.gotoDionysusPage(this);
  }

  /** -------------------- async api -------------------- **/
}

export default BacchusComponent;
