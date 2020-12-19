import "@tensorflow/tfjs";
import { load, MobileNet } from "@tensorflow-models/mobilenet"
import Model from "./Model";
import { Tensor3D } from "@tensorflow/tfjs";

async function loadMobilenet() {
  return new MobileNetModel(await load())
}

class MobileNetModel implements Model {
  private model: MobileNet;

  constructor(model: MobileNet) {
    this.model = model
  }

  classify(img: Tensor3D): any {
    return this.model.classify(img)
  }

  dispose(): void {}
}

export default loadMobilenet