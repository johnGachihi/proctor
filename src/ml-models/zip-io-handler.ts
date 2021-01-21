import * as tf from '@tensorflow/tfjs'
import client from '../network/client'

class ZipIOHandler implements tf.io.IOHandler {
  private modelUrl: string
  private modelJsonName: string = 'model.json'

  constructor(modelUrl: string, modelJsonName?: string) {
    this.modelUrl = modelUrl.endsWith('/') ? modelUrl : modelUrl + '/'
    if (modelJsonName) {
      this.modelJsonName = modelJsonName
    }
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
    weightPathSuffix: string = ""
  ): Promise<[tf.io.WeightsManifestEntry[], ArrayBuffer]>
  {
    const weightSpecs: tf.io.WeightsManifestEntry[] = []
    for (const group of weightsManifest) {
      weightSpecs.push(...group.weights)
    }

    const fetchUrls: string[] = []
    for (const group of weightsManifest) {
      for (const path of group.paths) {
        const fetchUrl = this.modelUrl + path + weightPathSuffix
        fetchUrls.push(fetchUrl)
      }
    }

    const requests = fetchUrls.map(fetchUrl => 
      client.get(fetchUrl, {responseType: 'arraybuffer', withCredentials: false})
    )

    // @ts-ignore
    const buffers: ArrayBuffer[] = await Promise.all(requests)
    console.log(tf.io.concatenateArrayBuffers(buffers))

    return [weightSpecs, tf.io.concatenateArrayBuffers(buffers)]
  }

}

export default ZipIOHandler