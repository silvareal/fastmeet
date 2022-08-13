import React from "react";
import {
  AppBar,
  Icon,
  IconButton,
  Toolbar,
  Container,
  Tooltip,
  Typography,
} from "@mui/material";
import format from "date-fns/format";

import { useLayoutEffect, useState } from "react";
import Logo from "common/Logo";

function AppHeader() {
  const [elevateHeader, setElevateHeader] = useState(false);

  useLayoutEffect(() => {
    function handleScroll() {
      setElevateHeader(window.scrollY >= 20);
    }
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <AppBar
      color="transparent"
      className="bg-gray-100"
      elevation={elevateHeader ? 1 : 0}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Logo />

          <div className="flex-1" />
          <Typography>{format(new Date(), "p . E, LLL qo")}</Typography>

          <div className="flex items-center">
            <Tooltip title="Settings">
              <IconButton>
                <Icon>settings</Icon>
              </IconButton>
            </Tooltip>
          </div>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default AppHeader;
