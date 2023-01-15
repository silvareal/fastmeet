import { createSlice } from "@reduxjs/toolkit";
import { GlobalInitialStateType } from "common/GlobalType";

export const globalInitialState: GlobalInitialStateType = {
  camera: true,
  mic: true,
  handRaised: true,
  screenShare: true,
};

const slice = createSlice({
  name: "global",
  initialState: globalInitialState,
  reducers: {
    toggleCameraAction: (state, { payload }) => {
      state.camera = payload !== undefined ? !!payload : !state.camera;
    },
    toggleMicAction: (state, { payload }) => {
      state.mic = payload !== undefined ? !!payload : !state.mic;
    },
    toggleHandRaisedAction: (state, { payload }) => {
      state.handRaised = payload !== undefined ? !!payload : !state.handRaised;
    },
    toggleScreenShareAction: (state, { payload }) => {
      state.screenShare =
        payload !== undefined ? !!payload : !state.screenShare;
    },
    setLocalMediaStreamAction: (state, { payload }) => {
      state.localMediaStream =
        payload !== undefined ? payload : state.localMediaStream;
    },
    addPeerAction: (state, { payload }) => {
      if (payload !== undefined) {
        state?.peers?.push(payload);
      }
      state.localMediaStream = payload !== undefined ? payload : state.peers;
    },
    removePeerAction: (state, { payload }) => {
      state.localMediaStream =
        payload !== undefined ? payload : state.localMediaStream;
    },
  },
});

export const {
  toggleCameraAction,
  toggleMicAction,
  toggleHandRaisedAction,
  toggleScreenShareAction,
  setLocalMediaStreamAction,
} = slice.actions;

export default slice;
