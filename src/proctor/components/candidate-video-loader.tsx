/** @jsx jsx */
import { jsx, css } from "@emotion/core";
import { Body2 } from "@material/react-typography";
import BounceLoader from "react-spinners/BounceLoader";
import '@material/elevation/mdc-elevation.scss';

type Props = {
  className?: string
  candidateName: string
}

function CandidateVideoLoader({ candidateName, className }: Props) {
  return (
    <div className={className + ' mdc-elevation--z5'} css={styling}>
      <BounceLoader aria-label={'loading'} loading size={40}/>
      <Body2 css={{ color: '#505050' }}>
        Connecting to {candidateName}...
      </Body2>
    </div>
  )
}

const styling = css`
  background-color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

export default CandidateVideoLoader