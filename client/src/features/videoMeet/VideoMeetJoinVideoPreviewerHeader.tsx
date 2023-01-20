import React, { useState } from "react";
import Popper from "@mui/material/Popper";
import PopupState, { bindToggle, bindPopper } from "material-ui-popup-state";
import Fade from "@mui/material/Fade";
import Paper from "@mui/material/Paper";

import { Icon as Iconify } from "@iconify/react";
import { Fab, Icon, MenuItem } from "@mui/material";
import VideoMeetSettingsActionModal from "./VideoMeetSettingsActionModal";

export default function VideoMeetJoinVideoPreviewerHeader({
  localMediaStream,
}: {
  localMediaStream: MediaStream | undefined;
}) {
  const [openVideoSettings, setOpenVideoSettings] = useState(false);

  const videoSettingsActions = [
    {
      title: "Settings",
      action: () => setOpenVideoSettings(true),
    },
    {
      title: "Filter",
      action: () => console.log("testi"),
    },
  ];

  return (
    <>
      <div className="flex justify-end">
        <div>
          <PopupState variant="popper" popupId="demo-popup-popper">
            {(popupState) => (
              <div>
                <Fab
                  variant="opaque"
                  color="primary"
                  {...bindToggle(popupState)}
                >
                  <Icon>
                    <Iconify icon="bi:three-dots-vertical" />
                  </Icon>
                </Fab>
                <Popper
                  {...bindPopper(popupState)}
                  sx={{ zIndex: 100 }}
                  transition
                >
                  {({ TransitionProps }) => (
                    <Fade {...TransitionProps} timeout={350}>
                      <Paper>
                        {videoSettingsActions.map((setting, index) => (
                          <MenuItem key={index} onClick={setting.action}>
                            {setting.title}
                          </MenuItem>
                        ))}
                      </Paper>
                    </Fade>
                  )}
                </Popper>
              </div>
            )}
          </PopupState>
        </div>
      </div>

      {openVideoSettings && (
        <VideoMeetSettingsActionModal
          open={openVideoSettings}
          handleClose={() => setOpenVideoSettings(false)}
          localMediaStream={localMediaStream}
        />
      )}
    </>
  );
}
