import client from "../network/client"
import * as tf from '@tensorflow/tfjs'

function fetchWeightFile(url: string): Promise<ArrayBuffer> {
  return client.get(url, {
    responseType: 'arraybuffer',
    withCredentials: false
  })
}

function fetchModelJson(url: string): Promise<tf.io.ModelJSON> {
  return client.get(url, {withCredentials: false})
}

function getWeightNames(
  weightsManifest: tf.io.WeightsManifestConfig,
) {
  const weightNames: string[] = []
  for (const group of weightsManifest) {
    for (const path of group.paths) {
      weightNames.push(path)
    }
  }
  return weightNames
}

export {
  fetchModelJson,
  fetchWeightFile,
  getWeightNames,
}