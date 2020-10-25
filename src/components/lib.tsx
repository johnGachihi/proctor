/** @jsx jsx */
import { jsx } from '@emotion/core'
import styled from '@emotion/styled';
import { Caption } from '@material/react-typography';

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
      <p>Uh oh... There's a problem. Try refreshing the app.</p>
      <pre>{error.message}</pre>
    </div>
  )
}


const ErrorMessage = styled(Caption)`
  color: red;
  margin-left: 7px;
`;


export {FullPageSpinner, FullPageErrorFallback, ErrorMessage}