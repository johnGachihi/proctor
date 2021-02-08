/** @jsx jsx */
import { jsx, css } from "@emotion/core";
import styled from "@emotion/styled";
import { Body2 } from "@material/react-typography";
import { PropsWithChildren, useRef } from "react";
import CandidateVideoLoader from "./candidate-video-loader";

type CandidateVideoProps = PropsWithChildren<{
  candidate: Candidate
}>

function CandidateVideo({ candidate }: CandidateVideoProps) {
  const overlayElRef = useRef<HTMLDivElement>(null)

  function onMouseEnter() {
    if (overlayElRef && overlayElRef.current) {
      overlayElRef.current.style.visibility = 'visible'
      overlayElRef.current.style.opacity = '1'
    }
  }

  function onMouseLeave() {
    if (overlayElRef && overlayElRef.current) {
      overlayElRef.current.style.visibility = 'hidden'
      overlayElRef.current.style.opacity = '0'
    }
  }

  return (
    <div>
      <div
        css={{ position: 'relative' }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <Video
          autoPlay
          ref={videoEl => {
            if (videoEl)
              videoEl.srcObject = candidate.mediaStream!
          }}
        />

        <VideoOverlay ref={overlayElRef}>
          <div css={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '10px'
          }}>
            <Body2 css={overlayTextStyling}>{ candidate.user.name }</Body2>
            <Body2 css={overlayTextStyling}>Cheat count: { candidate.cheatingCount }</Body2>
          </div>
        </VideoOverlay>

        {candidate.connectionState !== 'connected' &&
          <StyledCandidateVideoLoader candidateName={candidate.user.name} />}
        </div>
    </div>
  )
}

const Video = styled.video`
  width: 100%;
  height: auto;
  border-radius: 7px;
`

const VideoOverlay = styled.div`
  width: 100%;
  height: 20%;
  visibility: hidden;
  border-top-left-radius: 7px;
  border-top-right-radius: 7px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.5) 40%,rgba(0,0,0,0));
  position: absolute;
  top: 0;
  transition: visibility 0s, opacity 0.5s;
`

const StyledCandidateVideoLoader = styled(CandidateVideoLoader)`
  position: absolute;
  width: 100%;
  height: 240px;
  border-radius: 7px;
  top: 0;
`

const overlayTextStyling = css`
  margin: 0;
  color: white;
`

export default CandidateVideo