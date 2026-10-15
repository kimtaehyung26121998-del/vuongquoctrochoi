export const FilesetResolver={async forVisionTasks(){globalThis.cameraTest.resolvers++;return {}}}
export const PoseLandmarker={async createFromOptions(){
  globalThis.cameraTest.detectors++
  return {detectForVideo(){globalThis.cameraTest.inferences++;return {landmarks:globalThis.cameraTest.landmarks?[globalThis.cameraTest.landmarks]:[]}},close(){globalThis.cameraTest.closes++}}
}}
