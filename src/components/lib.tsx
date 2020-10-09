/** @jsx jsx */
import { jsx } from '@emotion/core'

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
      <BarLoader loading/>
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

export {FullPageSpinner, FullPageErrorFallback}