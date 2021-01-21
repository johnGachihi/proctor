import * as tf from "@tensorflow/tfjs";
import Model from "./Model";
import ZipIOHandler from "./zip-io-handler"
const modelUrl = process.env.REACT_APP_CUSTOM_MODEL

async function loadCustomModel() {
  // const model = await tf.loadGraphModel(modelUrl
    // ?? 'http://johngachihi.com/ml-models/custom-model-js/model.json');

  // http://johngachihi.com/ml-models/custom-model-js/model.json
  // http://johngachihi.com/ml-models/custom-model-js/model.json
  const ioHandler = new ZipIOHandler('http://johngachihi.com/ml-models/custom-model-js');
  const model = await tf.loadGraphModel(ioHandler);

  return new CustomModel(model)
}

class CustomModel implements Model {
  private model: tf.GraphModel;

  constructor(model: tf.GraphModel) {
    this.model = model
  }

  private infer(img: tf.Tensor3D) {
    return tf.tidy(() => {
      img = img.toFloat()
      img = img.reshape([-1, ...img.shape])
      return this.model.predict(img) as tf.Tensor2D
    })
  }

  async classify(img: tf.Tensor3D) {
    const logits = this.infer(img) as tf.Tensor2D
    // const prediction = this.getReadablePrediction(logits)

    // logits.dispose()

    return await logits.data()
  }

  async getReadablePrediction(logits: tf.Tensor2D) {
    const softmax = logits.softmax()
    const values = await softmax.data()
    softmax.dispose()

    const classMap = [
      'irregular' ,'regular'
    ]

    const valuesWithClasses = []
    for (const idx in values) {
      valuesWithClasses.push({
        className: classMap[idx],
        value: values[idx]
      })
    }

    valuesWithClasses.sort((a, b) => b.value - a.value)

    return values
  }

  dispose() {
    this.model.dispose()
  }

}

export default loadCustomModel