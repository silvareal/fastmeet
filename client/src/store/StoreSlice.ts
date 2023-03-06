import { createSlice } from "@reduxjs/toolkit";
import { GlobalInitialStateType } from "common/GlobalType";
import fastmeetApi from "./StoreQuerySlice";

export const globalInitialState: GlobalInitialStateType = {
  camera: true,
  mic: true,
  handRaised: false,
  screenShare: false,
  peers: [],
  iceServers: [],
  isChatDrawer: false,
};

const slice = createSlice({
  name: "global",
  initialState: globalInitialState,
  reducers: {
    toggleCameraAction: (state, { payload }) => {
      console.log("payload", payload);
      state.camera = payload !== undefined ? payload : !state.camera;
    },
    toggleMicAction: (state, { payload }) => {
      state.mic = payload !== undefined ? payload : !state.mic;
    },
    toggleChatDrawerAction: (state, { payload }) => {
      state.isChatDrawer =
        payload !== undefined ? payload : !state.isChatDrawer;
    },
    toggleHandRaisedAction: (state, { payload }) => {
      state.handRaised = payload !== undefined ? payload : !state.handRaised;
    },
    toggleScreenShareAction: (state, { payload }) => {
      state.screenShare = payload !== undefined ? payload : !state.screenShare;
    },
    setLocalMediaStreamAction: (state, { payload }) => {
      if (payload) {
        state.localMediaStream = payload;
      }
    },
    addPeerAction: (state, { payload }) => {
      if (payload !== undefined) {
        state.peers = [...state?.peers, payload];
      }
    },
    removePeerAction: (state, { payload }) => {
      if (payload !== undefined) {
        const index = state?.peers?.findIndex(
          (peer) => peer.peerId === payload.peerId
        );
        state.peers = state?.peers?.slice(index, 1);
      }
    },
    editPeerAction: (state, { payload }) => {
      if (payload !== undefined) {
        const index = state?.peers?.findIndex(
          (peer) => peer.peerId === payload.peerId
        );

        if (index) {
          state.peers[index] = payload;
        }
      }
    },
  },
  extraReducers: (builder: any) =>
    builder.addMatcher(
      fastmeetApi.endpoints.getTurnServer.matchFulfilled,
      (state: GlobalInitialStateType, { payload }: any) => {
        if (payload !== undefined && payload.data)
          state.iceServers = payload?.data?.iceServers;
      }
    ),
});

export const {
  toggleCameraAction,
  toggleMicAction,
  toggleHandRaisedAction,
  toggleScreenShareAction,
  setLocalMediaStreamAction,
  addPeerAction,
  editPeerAction,
  removePeerAction,
  toggleChatDrawerAction,
} = slice.actions;

export default slice;
