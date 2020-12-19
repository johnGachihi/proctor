import * as tf from "@tensorflow/tfjs";

interface Model {
  classify(img: tf.Tensor3D): any
  dispose(): void
}

export default Model