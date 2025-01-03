import '@google/model-viewer';

const Model = () => (

  <model-viewer
    src="/Astronaut.glb"
    ios-src=""
    poster="https://cdn.glitch.com/36cb8393-65c6-408d-a538-055ada20431b%2Fposter-astronaut.png?v=1599079951717"
    alt="A 3D model of an astronaut"
    shadow-intensity="1"
    camera-controls
    auto-rotate
    ar
    className="w-96 h-96"
  ></model-viewer>

)

export default Model;
