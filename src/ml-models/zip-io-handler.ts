import * as tf from '@tensorflow/tfjs'
import JSZip from 'jszip'
import { fetchModelJson, fetchWeightFile, getWeightNames } from './utils'

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
    const modelJson: tf.io.ModelJSON = await fetchModelJson(modelJsonUrl)

    const modelArtifacts: tf.io.ModelArtifacts = {
      modelTopology: modelJson.modelTopology,
      format: modelJson.format,
      generatedBy: modelJson.generatedBy,
      convertedBy: modelJson.convertedBy,
    }

    let weightSpecs: tf.io.WeightsManifestEntry[] = []
    let weightData: ArrayBuffer | undefined

    if (modelJson.weightsManifest) {
      [weightSpecs, weightData]
        = await this.loadWeights(modelJson.weightsManifest)
    }

    modelArtifacts.weightSpecs = weightSpecs
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

    const weightData = await this.loadAndProcessWeights(weightsManifest)

    return [weightSpecs, weightData]
  }

  private async loadAndProcessWeights(
    weightsManifest: tf.io.WeightsManifestConfig
  ): Promise<ArrayBuffer>
  {
    const weightNames: string[] = getWeightNames(weightsManifest)
    const requests = this.getFetchWeightRequestPromises(weightNames)
    const zippedWeights = await Promise.all(requests)
    const unzipWeightsPromises =
      this.getUnzipWeightFilesPromises(zippedWeights, weightNames)
    const unzippedWeights = await Promise.all(unzipWeightsPromises)
    
    return tf.io.concatenateArrayBuffers(unzippedWeights)
  }

  private getFetchWeightRequestPromises(weightNames: string[]) {
    return weightNames.map(weightName =>
      fetchWeightFile(this.getWeightFileUrl(weightName)))
  }

  private getWeightFileUrl(weightFileName: string) {
    return this.modelUrl + weightFileName + this.weightNameSuffix
  }

  private getUnzipWeightFilesPromises(
    zippedWeightFiles: ArrayBuffer[],
    weightNames: string[]
  ): Promise<ArrayBuffer>[]
  {
    return zippedWeightFiles.map(async (zippedWeightFile, idx) => {
      const zip = await JSZip.loadAsync(zippedWeightFile)
      return await zip.file(weightNames[idx])!.async('arraybuffer')
    })
  }
}


export default ZipIOHandler