import Video from "./Video";
import "./VideoPreviewer.css";

interface VideoPreviewerProps {
  pin: boolean;
  name: string;
  camera: boolean;
  mic: boolean;
  srcObject: MediaStream;
  peer: any;
  muted: boolean;
  active: boolean;
  avatar: string;
  header: JSX.Element;
  footer: JSX.Element;
  body: JSX.Element;
  [rest: string]: any;
}

export default function VideoPreviewer(props: Partial<VideoPreviewerProps>) {
  const {
    pin,
    name,
    camera,
    active,
    mic,
    srcObject,
    peer,
    avatar,
    muted,
    header,
    footer,
    body,
    className,
    ...rest
  } = props;

  return (
    <div
      {...rest}
      className={`${className ? className : ""} ${
        active ? "vids-preview-active" : ""
      } vids-preview-container relative `}
    >
      <div className="absolute top-0 py-3 px-5  w-full">{header}</div>
      <div className="absolute top-0 bottom-0 px-5  left-0 right-0 m-auto py-5 flex justify-center items-center w-full">
        {body}
      </div>

      <div className="flex justify-center items-center h-full">
        <Video
          style={{ display: `${camera ? "block" : "none"}` }}
          srcObject={srcObject}
          peer={peer}
          muted={muted}
        />
        {!camera && name && (
          <div className="vids-preview-avatar">
            <img className="w-full" src={`${avatar || ""}`} alt={name} />
          </div>
        )}
      </div>

      <div className="absolute bottom-0 py-3 px-5  w-full">{footer}</div>
    </div>
  );
}
