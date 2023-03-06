import React, { useEffect, useState } from "react";

type VoicePitchProps = {
  stream: MediaStream | undefined;
};

export default function VoicePitch({ stream }: VoicePitchProps) {
  const [freqPercentage, setFreqPercentage] = useState(0);

  function captureStream(stream: MediaStream) {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    source.connect(analyser);

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const onFrame = () => {
      analyser.getByteFrequencyData(dataArray);
      const lastData = dataArray.at(1);
      const freqPercentage = Math.round(((lastData || 0) / 256) * 100);
      setFreqPercentage(freqPercentage);

      document.documentElement.style.setProperty(
        "--width",
        `${300 + freqPercentage / 2}px`
      );
      document.documentElement.style.setProperty(
        "--height",
        `${300 + freqPercentage / 2}px`
      );
      window.requestAnimationFrame(onFrame);
    };
    window.requestAnimationFrame(onFrame);
  }

  useEffect(() => {
    // if (middleEl !== null) {
    if (stream !== undefined) {
      captureStream(stream);
    }

    // }
  }, [stream]);

  return (
    <div className="audio-level__container audio-level__container--active">
      <div className="audio-level__indicator__container">
        <div
          style={{ height: `${freqPercentage}%` }}
          className="audio-level__indicator"
        ></div>
        <div
          style={{ height: `${freqPercentage}%` }}
          className="audio-level__indicator"
        ></div>
        <div
          style={{ height: `${freqPercentage}%` }}
          className="audio-level__indicator"
        ></div>
      </div>
    </div>
  );
}
