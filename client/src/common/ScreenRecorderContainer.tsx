import React from "react";
import { createPortal } from "react-dom";

export default function ScreenRecorderContainer() {
  return (
    <section>
      {createPortal(
        <section>
          {" "}
          <div className="recording__container">
            <div className="recording__circle"></div>
            <div className="recording__text">Recording</div>
          </div>
        </section>,
        document.body
      )}
    </section>
  );
}
