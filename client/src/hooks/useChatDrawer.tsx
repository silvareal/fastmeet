import { useSelector, useDispatch } from "react-redux";
import { GlobalInitialStateType } from "common/GlobalType";
import { toggleChatDrawerAction } from "store/StoreSlice";

function useChatDrawer(): {
  isChatDrawer: boolean;
  toggleChatDrawer?: (payload?: boolean) => void;
} {
  const dispatch = useDispatch();
  const isChatDrawer: boolean = useSelector(
    (state: { global: GlobalInitialStateType }) => state.global.isChatDrawer
  );

  function toggleChatDrawer(payload?: boolean) {
    dispatch(
      toggleChatDrawerAction(
        typeof payload === "boolean" ? payload : !isChatDrawer
      )
    );
  }

  return { isChatDrawer, toggleChatDrawer };
}

export default useChatDrawer;
