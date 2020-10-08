/** @jsx jsx */
import { jsx } from '@emotion/core'
import PulseLoader from 'react-spinners/PulseLoader';

function FullPageSpinner() {
  return (
    <div css={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <PulseLoader loading size={150}/>
    </div>
  )
}

export default FullPageSpinner