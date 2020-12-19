import loadMobilenet from './mobilenet'
import loadCustomModel from './custom-model'

async function getModel(modelName: string) {
  switch(modelName) {
    case 'mobilenet':
      return await loadMobilenet()
    case 'custom-model':
      return await loadCustomModel()
  }
}

export default getModel