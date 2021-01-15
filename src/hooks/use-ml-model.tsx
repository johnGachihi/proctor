import { useCallback, useEffect, useRef } from "react";
import loadCustomModel from "../ml-models/custom-model";
import useAsync from "../utils/use-async";
import * as tf from '@tensorflow/tfjs'
import Model from "../ml-models/Model";

function useProctorModel() {
  const { run, data: model, isSuccess: isModelLoaded, ...asyncStatus } = useAsync<Model>()
  const shouldRunRef = useRef<boolean>(false) 

  useEffect(() => {
    run(loadCustomModel())
  }, [run])

  // TODO: How to dispose model

  const initiateProctoring = useCallback(async (
    videoEl: HTMLVideoElement,
    onPrediction?: (prediction: any) => void
  ) => {
    if (isModelLoaded) {
      shouldRunRef.current = true

      const webcam = await tf.data.webcam(videoEl)
      while(shouldRunRef.current){
        const img = await webcam.capture()
        const result = await model?.classify(img)
        img.dispose()
        
        if (onPrediction) {
          onPrediction(result)
        }

        await tf.nextFrame()
      }
    }
  }, [isModelLoaded, model])

  const terminateProctoring = useCallback(() => {
    shouldRunRef.current = false
  }, [])

  return {
    modelStatus: asyncStatus.status,
    modelLoadingError: asyncStatus.error,
    isModelLoadingError: asyncStatus.isError,
    isModelLoading: asyncStatus.isLoading,
    initiateProctoring,
    terminateProctoring
  }
}

export default useProctorModel