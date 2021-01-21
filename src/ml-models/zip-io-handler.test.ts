import client from '../network/client'
import moxios from 'moxios'
import ZipIOHandler from './zip-io-handler'
import * as tf from '@tensorflow/tfjs'


describe('Test ZipIOHandler', () => {
  let zipIoHandler: ZipIOHandler
  const modelUrl = 'https://example.com/'
  const modelJson = {
    modelTopology: { node: [] },
    format: 'format',
    generatedBy: 'generatedBy',
    convertedBy: 'convertedBy',
    weightsManifest:[{
      paths: [
          "group1-shard1of3.bin",
          "group1-shard2of3.bin",
      ],
        weights: [
        {
          name: "StatefulPartitionedCall/model_3/resize_and_rescale/resizing_2/resize/size",
          shape: [2],
          dtype: "int32"
        },
        {
          name: "StatefulPartitionedCall/model_3/mobilenetv2_1.00_224/block_1_pad/Pad/paddings",
          shape: [4, 2],
          dtype: "int32"
        },
      ]
    }]
  }

  beforeEach(() => {
    zipIoHandler = new ZipIOHandler(modelUrl)
    // @ts-ignore
    moxios.install(client)
  })

  afterEach(() => {
    // @ts-ignore
    moxios.uninstall(client)
  })

  it('Loads correct model artifacts from remote model topology file', async (done) => {
    moxios.stubRequest(modelUrl + 'model.json', {
      status: 200,
      response: modelJson
    })
    moxios.stubRequest(modelUrl + 'group1-shard1of3.bin', {
      status: 200,
      response: 'ble'
    })
    moxios.stubRequest(modelUrl + 'group1-shard2of3.bin', {
      status: 200,
      response: 'ble'
    })

    const modelArtifacts = await zipIoHandler.load()

    moxios.wait(() => {
      const request = moxios.requests.mostRecent()
      console.log(request.url)
      expect(modelArtifacts).toMatchObject({
        modelTopology: {},
        format: 'format',
        generatedBy: 'generatedBy',
        convertedBy: 'convertedBy',
        weightSpecs: [
          {
            name: "StatefulPartitionedCall/model_3/resize_and_rescale/resizing_2/resize/size",
            shape: [2],
            dtype: "int32"
          },
          {
            name: "StatefulPartitionedCall/model_3/mobilenetv2_1.00_224/block_1_pad/Pad/paddings",
            shape: [4, 2],
            dtype: "int32"
          },
        ]
      })
      console.log(modelArtifacts.weightData?.byteLength)
      done()
    })

    // moxios.wait(() => {
    //   const request = moxios.requests.mostRecent()
    //   console.log(request.url)
    //   request.respondWith({
    //     status: 200,
    //     response: 'ble'
    //   })
    //   done()
    // })
  })

  /* it('Loads correct weightSpecs', async done => {
    moxios.stubRequest(modelUrl + 'model.json', {
      status: 200,
      response: modelJson
    })
    moxios.stubRequest(modelUrl + 'group1-shard1of3.bin', {
      status: 200,
      response: 'ble'
    })
    moxios.stubRequest(modelUrl + 'group1-shard2of3.bin', {
      status: 200,
      response: 'ble'
    })

    const modelArtifacts = await zipIoHandler.load()

    moxios.wait(() => {
      expect(modelArtifacts.weightSpecs)
        .toMatchObject(modelJson.weightsManifest[0].weights)
    })
    moxios.wait(() => {
      done()
    })
  }) */
})
