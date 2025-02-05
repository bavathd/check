import '@google/model-viewer';
import React ,{ useEffect, useRef, useState } from 'react';

const Model = ({
  src,
  poster,
  alt,
  iosSrc,
  shadowIntensity = 1,
  cameraControls = true,
  autoRotate = false,
  ar = false,
  className = "w-96 h-96",
  ...props
}) => {
  const modelViewerRef = useRef(null);
  const [isARSupported, setIsARSupported] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  useEffect(() => {
 
      setIsPageLoaded(true);
      const modelViewer = modelViewerRef.current;
      if (modelViewer) {
        setIsARSupported(modelViewer.canActivateAR);
      }
  
  }, []);
  const activateAR = async () => {
    if (modelViewerRef.current) {
      const arView = await modelViewerRef.current.activateAR();
      if (arView) {
        console.log("AR View activated");
        setIsPageLoaded(true);
      } else {
        console.error("Failed to activate AR");
      }
    }
  };
// useEffect(() => {
  
//   activateAR()
// })
  

  return (
    <div className="flex flex-col items-center">
    {isPageLoaded ? (
      <>
      <model-viewer
        ref={modelViewerRef}
        src={src}
        ios-src={iosSrc}
        poster={poster}
        alt={alt}
        ar={true}
        ar-mode
        shadow-intensity={shadowIntensity}
        camera-controls={cameraControls}
        auto-rotate={autoRotate}
        className={className}
        {...props}
      >
        <button
          // slot="ar-button"
          className="custom-ar-button"
          onClick={activateAR}
        >
          
        </button>
      </model-viewer>
      <p className="mt-4 text-cyan-600">
        AR Support: {isARSupported ? "Supported" : "Not Supported"}
      </p>
      </>

      ) : (
        <p>Loading, please wait...</p>
      )}
    </div>
  );
}

export default Model;
