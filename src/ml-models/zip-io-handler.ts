import * as tf from '@tensorflow/tfjs'
import JSZip from 'jszip'
import client from '../network/client'

class ZipIOHandler implements tf.io.IOHandler {
  private modelUrl: string
  private modelJsonName: string = 'model.json'
  private weightNameSuffix: string

  constructor(
    modelUrl: string,
    modelJsonName = 'model.json',
    weightNameSuffix = '.zip',
  ) {
    this.modelUrl = modelUrl.endsWith('/') ? modelUrl : modelUrl + '/'
    this.modelJsonName = modelJsonName
    this.weightNameSuffix = weightNameSuffix
  }

  async load(): Promise<tf.io.ModelArtifacts> {
    const modelJsonUrl = this.modelUrl + this.modelJsonName
    const modelJson: tf.io.ModelJSON = await client.get(modelJsonUrl, {withCredentials: false})

    const modelArtifacts: tf.io.ModelArtifacts = {
      modelTopology: modelJson.modelTopology,
      format: modelJson.format,
      generatedBy: modelJson.generatedBy,
      convertedBy: modelJson.convertedBy,
    }

    let weightSpecs: tf.io.WeightsManifestEntry[] = []
    let weightData: ArrayBuffer

    if (modelJson.weightsManifest) {
      [weightSpecs, weightData]
        = await this.loadWeights(modelJson.weightsManifest)
    }

    modelArtifacts.weightSpecs = weightSpecs
    // @ts-ignore
    modelArtifacts.weightData = weightData

    return modelArtifacts
  }

  private async loadWeights(
    weightsManifest: tf.io.WeightsManifestConfig,
  ): Promise<[tf.io.WeightsManifestEntry[], ArrayBuffer]>
  {
    const weightSpecs: tf.io.WeightsManifestEntry[] = []
    for (const group of weightsManifest) {
      weightSpecs.push(...group.weights)
    }

    const weightNames: string[] = getWeightNames(weightsManifest)
    const requests = this.getFetchWeightRequestPromises(weightNames)
    const zippedWeights = await Promise.all(requests)

    const unzipWeightsPromises = zippedWeights.map(async (zippedWeightFile, idx) => {
      return (await JSZip.loadAsync(zippedWeightFile))
        .file(weightNames[idx])?.async('arraybuffer')
    })

    // @ts-ignore
    const buffers: ArrayBuffer[] = await Promise.all(unzipWeightsPromises)

    return [weightSpecs, tf.io.concatenateArrayBuffers(buffers)]
  }

  private getFetchWeightRequestPromises(weightNames: string[]) {
    return weightNames.map(weightName => {
      const fetchUrl = this.modelUrl + weightName + this.weightNameSuffix
      return client.get(fetchUrl, {
        responseType: 'arraybuffer', withCredentials: false
      }) as Promise<ArrayBuffer>
    })
  }

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

export default ZipIOHandler