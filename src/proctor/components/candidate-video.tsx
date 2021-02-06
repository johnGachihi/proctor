/** @jsx jsx */
import { jsx } from "@emotion/core";
import { PropsWithChildren } from "react";

type CandidateVideoProps = PropsWithChildren<{
  stream: MediaStream,
  isCheating: boolean,
}>

function CandidateVideo({ stream, isCheating }: CandidateVideoProps) {
  return (
    <div>
      <div
        css={{
          position: 'relative'
        }}
      >
        <video
          autoPlay
          ref={videoEl => {
            if (videoEl)
              videoEl.srcObject = stream
          }}
          css={{
            width: '100%',
            height: 'auto',
            borderRadius: '5px'
          }}/>
          <span>{isCheating ? 'cheating' : ''}</span>

          {/* For text overlay
              use linear-gradient or radial-gradient */}
          <div
            css={{
              width: '150px',
              height: '150px',
              border: '1px solid black',
              position: 'absolute',
              top: 0
            }}
          ></div>
        </div>
    </div>
  )
}

export default CandidateVideo