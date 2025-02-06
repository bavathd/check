'use client';
import '@google/model-viewer';
import React ,{ useEffect, useRef, useState } from 'react';
import { redirect, useRouter } from 'next/navigation';

const Model = ({
  src,
  poster,
  alt,
  iosSrc,
  shadowIntensity = 1,
  cameraControls = true,
  autoRotate = false,
  ar = false,
  page,
  className = "w-96 h-96",
  ...props
}) => {
  const modelViewerRef = useRef(null);
  const [isARSupported, setIsARSupported] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [srcFile, setSrcFile] = useState(null);
  const [srcIosFile, setSrcIosfile] = useState(null);
  const [isVisible, setvisisble] = useState(false);
  const [loadset, setloader] = useState(false);
  const [arStatus, setArStatus] = useState("")
  const router = useRouter();
  useEffect(() => {
 
      setIsPageLoaded(true);
      const modelViewer = modelViewerRef.current;
      if (modelViewer) {
        setIsARSupported(modelViewer.canActivateAR);
      }
      if(modelViewer) {
      const observer = new MutationObserver(() => {
        const status = modelViewer.getAttribute("ar-status")
        setArStatus(status || "");
        console.log("Ar Status:", status);

      })
      observer.observe(modelViewer, { attributes: true, attributeFilter: ["ar-status"] })
      return () => {
        observer.disconnect();
      }
    }
  
  }, []);
  useEffect(() => {
    const loadfiles = async() => {

      await fetch(src)
      .then(async (response) => await response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob)
        setSrcFile(url)
      })
      .catch((error) => console.error("Error SRC: ", error))

      await fetch(iosSrc)
      .then(async (response) => await response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob)
        setSrcIosfile(url)
      })
      .catch((error) => console.error("Error IOS: ", error))
  }
  if(!loadset) {
  loadfiles();
  
  }
  
  },[loadset, iosSrc, src])

  useEffect(() => {
   
    if(srcFile && srcIosFile) {
      setloader(true);
      console.log(srcFile, srcIosFile)
      setvisisble(true)

      // activateAR();
    }
    else {
      console.log("Files not loaded")
    }
   
  },[srcFile, srcIosFile, isVisible]) //, [srcFile, srcIosFile, arStatus, router, page]

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
        src={srcFile}
        ios-src={srcIosFile}
        poster={poster}
        alt={alt}
        ar={true}
        ar-mode
        shadow-intensity={shadowIntensity}
        camera-controls={cameraControls}
        auto-rotate={autoRotate}
        autoplay
        className={className}
        {...props}
      >
        <button
          slot="ar-button"
          onClick={activateAR}
          className={`${isVisible ? "block" : "hidden"} custom-ar-button mt-auto bg-blue-500 text-white px-4 py-2 rounded`}
        > activate ar mode
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
