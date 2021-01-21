/** @jsx jsx */
import { jsx } from '@emotion/core'
import styled from '@emotion/styled';
import { Body1, Caption } from '@material/react-typography';

import BarLoader from 'react-spinners/BarLoader';


function FullPageSpinner() {
  return (
    <div css={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <BarLoader aria-label={'loading'} loading/>
    </div>
  )
}


type FullPageMessageProps = {
  message: string
}
function FullPageMessage({message}: FullPageMessageProps) {
  return (
    <div css={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Body1>{message}</Body1>
    </div>
  )
}


type Error = {
  error: any;
}

function FullPageErrorFallback({error}: Error) {
  return (
    <div
      role='alert'
      css={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Body1>Uh oh... There's a problem. Try refreshing the app.</Body1>
      <Caption>{error.message}</Caption>
    </div>
  )
}


const ErrorMessage = styled(Caption)`
  color: red;
  margin-left: 7px;
`;


export {
  FullPageSpinner,
  FullPageMessage,
  FullPageErrorFallback,
  ErrorMessage
}