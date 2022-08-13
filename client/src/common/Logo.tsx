import { ReactComponent as FastMeetSVG } from "assets/svg/logo.svg";
import React from "react";

function Logo({ ...props }) {
  return <FastMeetSVG {...props} />;
}

export default Logo;
