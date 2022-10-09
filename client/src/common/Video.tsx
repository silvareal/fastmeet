import { VideoHTMLAttributes, useEffect, useRef } from "react";

type PropsType = VideoHTMLAttributes<HTMLVideoElement> & {
  srcObject?: any;
  muted?: boolean;
  peer?: any;
};

export default function Video({ srcObject, muted, peer, ...props }: PropsType) {
  const refVideo = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (srcObject) {
      if (!refVideo.current) return;
      refVideo.current.srcObject = srcObject;
      refVideo.current.autoplay = true;
    }
  }, [srcObject]);

  useEffect(() => {
    if (peer) {
      peer.on("stream", (stream: any) => {
        if (!refVideo.current) return;
        refVideo.current.srcObject = stream;
        refVideo.current.autoplay = true;
      });
    }
  }, [peer]);

  return (
    <video
      playsInline
      muted={muted}
      autoPlay
      ref={refVideo}
      width={"100%"}
      height={"100%"}
      {...props}
    />
  );
}
