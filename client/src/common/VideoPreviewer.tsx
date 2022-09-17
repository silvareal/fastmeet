import { Container } from "@mui/system";
import Video from "./Video";
import "./VideoPreviewer.css";

interface VideoPreviewerProps {
  pin?: boolean;
  name?: string;
  camera: boolean;
  mic: boolean;
  srcObject?: MediaStream;
  peer?: any;
  muted?: boolean;
  header?: JSX.Element;
  footer?: JSX.Element;
  [rest: string]: any;
}

export default function VideoPreviewer(props: VideoPreviewerProps) {
  const {
    pin,
    name,
    camera,
    mic,
    srcObject,
    peer,
    muted,
    header,
    footer,
    className,
    ...rest
  } = props;

  return (
    <Container
      {...rest}
      className={`${className} vids-preview-container relative `}
    >
      <div className="absolute top-0 py-5 px-10">{header}</div>

      <div className="flex justify-center">
        {camera ? (
          <Video srcObject={srcObject} peer={peer} muted={muted} />
        ) : (
          name && <div className="vids-preview-avatar">{name}</div>
        )}
      </div>

      <div className="absolute bottom-0 py-5 px-10">{footer}</div>
    </Container>
  );
}
