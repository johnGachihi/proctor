import React from 'react';

type AsyncState = {
  status: string;
  data?: any;
  error?: any;
}

const defaultInitialState: AsyncState = {
  status: 'idle', data: null, error: null}

function useAsync(initialState?: AsyncState) {
  const initialStateRef = React.useRef<AsyncState>({
    ...defaultInitialState,
    ...initialState
  })
  const [{status, data, error}, setState] = React.useReducer(
    (s: AsyncState, a: AsyncState) => ({...s, ...a}),
    initialStateRef.current
  )

  const safeSetState = useSafeDispatch(setState)

  const setData = React.useCallback(
    data => safeSetState({data, status: 'resolved'}),
    [safeSetState]
  )

  const setError = React.useCallback(
    error => safeSetState({error, status: 'rejected'}),
    [safeSetState]
  )

  const reset = React.useCallback(
    () => safeSetState(initialStateRef.current),
    [safeSetState]
  )

  const run = React.useCallback(
    promise => {
      if (!promise || !promise.then) {
        throw new Error('The argument passed to useAsync().run must be a promise. Maybe the function that was passed does not return anything.')
      }
      safeSetState({status: 'pending'})
      return promise.then(
        (data: any) => {
          setData(data)
          return data
        },
        (error: any) => {
          setError(error)
          return Promise.reject(error)
        }
      )
    },
    [safeSetState, setData, setError]
  )

  return {
    isIdle: status === 'idle',
    isLoading: status === 'pending',
    isError: status === 'rejected',
    isSuccess: status === 'resolved',
    setData,
    setError,
    error,
    status,
    data,
    run,
    reset
  }
}

function useSafeDispatch(dispatch: React.Dispatch<AsyncState>) {
  const mounted = React.useRef(false)
  React.useLayoutEffect(() => {
    mounted.current = true
    return () => {mounted.current = false}
  }, [])

  return React.useCallback(
    (state: AsyncState) => (mounted.current ? dispatch(state) : void 0),
    [dispatch]
  )
}

export default useAsync