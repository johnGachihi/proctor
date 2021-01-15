import React from 'react';

type AsyncState<T> = {
  status: string;
  data?: T;
  error?: any;
}

const defaultInitialState: AsyncState<any> = {
  status: 'idle', data: null, error: null}

function useAsync<T>(initialState?: AsyncState<T>) {
  const initialStateRef = React.useRef<AsyncState<T>>({
    ...defaultInitialState,
    ...initialState
  })
  const [{status, data, error}, setState] = React.useReducer(
    (s: AsyncState<T>, a: AsyncState<T>) => ({...s, ...a}),
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

  const run = React.useCallback<((promise: Promise<T>) => Promise<T>)>(
    promise => {
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

function useSafeDispatch<T>(dispatch: React.Dispatch<AsyncState<T>>) {
  const mounted = React.useRef(false)
  React.useLayoutEffect(() => {
    mounted.current = true
    return () => {mounted.current = false}
  }, [])

  return React.useCallback(
    (state: AsyncState<T>) => (mounted.current ? dispatch(state) : void 0),
    [dispatch]
  )
}

export default useAsync