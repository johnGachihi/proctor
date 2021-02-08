/** @jsx jsx */
import { jsx } from "@emotion/core";
import { PropsWithChildren, useMemo } from "react";
import CandidateVideo from "./candidate-video";

type Props = PropsWithChildren<{
  candidates: Candidate[],
  className?: string
}>

function SurveillanceScreen({ candidates, className }: Props) {

  const candidateVideoEls = useMemo(() => {
    return candidates
      .filter(candidate => candidate.mediaStream !== undefined)
      .sort((a, b) => a.cheatingCount - b.cheatingCount)
      .map(candidate =>
        <CandidateVideo key={candidate.id} candidate={ candidate } />)
  }, [candidates])

  return (
    <div
      className={className}
      css={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '1rem'
      }}
    >
      {candidateVideoEls}
    </div>
  )
}


export default SurveillanceScreen