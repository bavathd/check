"use client";

import React, { useEffect, useRef, useState,useCallback } from "react";
import { useRouter } from "next/navigation";
import { LuScanLine } from "react-icons/lu";
;

export default function Home() {
  const videoRef = useRef(null);
  // const [fullscreen, setFullscreen] = useState<boolean>(false);
  const photoRef = useRef(null);
  const cropRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  // const [orientation, setOrientation] = useState("portrait");
  const [cleanBase64, setBase64] = useState("");
  const [send, setData] = useState(false);
  // const [winWidth, setWidth] = useState(null);
  // const [winHeight, setHeight] = useState(null);
  const [change, setchange] = useState(false);
  const [items, setItem] = useState([])
  const router = useRouter();
  const getModels = useCallback(async() => {
        try {
        const response = await fetch(
          `https://e60tr3t3xe.execute-api.ap-south-1.amazonaws.com/dev/models`,
          {
          
            method: "GET",
            body: null
          
          }
        );
  
        if (!response.ok) {
          throw new Error(`Failed to complete upload: ${response.statusText}`);
        }
        
        console.log("Upload completed successfully!");
        console.log(response)
        return response.json()
      } catch (error) {
        console.error("Error in completeUpload:", error);
        throw error;
      }
      
      },[]);

    
  const getVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
        },
      });
  
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
  
        // Apply autofocus if supported
        const videoTrack = stream.getVideoTracks()[0];
        const capabilities = videoTrack.getCapabilities();
        const settings = videoTrack.getSettings();
  
        if (capabilities.focusMode && capabilities.focusMode.includes("continuous")) {
          await videoTrack.applyConstraints({
            advanced: [{ focusMode: "continuous" }],
          });
          console.log("Autofocus applied:", settings.focusMode);
        } else {
          console.warn("Autofocus is not supported on this device.");
        }
  
      
      }
    } catch (error) {
      console.error("Error getting video stream", error);
    }
  };

  const analyzeImage = async (base64Image) => {
    console.log("entered url");
    const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_API_KEY;
    const endpoint = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_API_KEY}`;

    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image, // Base64 image data
          },
          features: [
            {
              type: "DOCUMENT_TEXT_DETECTION", // Feature type
            },
          ],
        },
      ],
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Ensure JSON content type
        },
        body: JSON.stringify(requestBody), // Send the request body
      });

      const data = await response.json();
      if (response.ok && items) {
        const word = data.responses[0].fullTextAnnotation.text;
        if(!word) return;
        console.log(word);
        console.log(items);
        word.split("\n").forEach((element) => {
          const x = element.toLowerCase();
          const lowerCaseItems = items.map((item) => item.toLowerCase()); 
          if (lowerCaseItems.includes(x)) {
            window.sessionStorage.setItem("word", x);
            setchange(true);
          }
        });
      } else {
        console.error("Error from API:", data.error.message);
      }
    } catch (error) {
      setIsVisible(false);
    }
  };

  const takePhoto = () => {
    console.log("clicked")
    if (!videoRef.current || !photoRef.current) return;
    if (typeof window !== "undefined") {
      // Define the dimensions of the area of interest (scanner box)
      const boxWidth = 320; // width of the scanner box in pixels
      const boxHeight = 320; // height of the scanner box in pixels
      

      const video = videoRef.current;
      const photo = photoRef.current;
      if (!photo)
        return () => {
          console.error("Can not opencanvas");
        };
        const offsetX = (video.videoWidth - boxWidth) / 2; // X offset for centering
        const offsetY = (video.videoHeight - boxHeight) / 2; // Y offset for centering
      photo.width = boxWidth;
      photo.height = boxHeight;
      
      const ctx = photo.getContext("2d");
      if (!ctx)
        return () => {
          console.error("Can not opencanvas");
        };
      ctx.clearRect(0,0, boxWidth, boxHeight);
      ctx.drawImage(
        video,
        offsetX, // Source X
        offsetY, // Source Y
        boxWidth, // Source width
        boxHeight, // Source height
        0, // Destination X
        0, // Destination Y
        boxWidth, // Destination width
        boxHeight // Destination height
      );
      setIsVisible(true);
      const image = photo.toDataURL("image/base64", 0.5);
      const imgData = image.split(",")[1];
      setBase64(imgData);
      console.log(cleanBase64);
      setData(true);
    } else {
    }
  };

  const drawToCanvas = () => {
  
    const video = videoRef.current;

    if (video) {
      const drawFrame = () => {
        const canvas = cropRef.current;
        const boxWidth = 320; // width of the scanner box in pixels
        const boxHeight = 320; // height of the scanner box in pixel
        if (!canvas) return;
        canvas.width = boxWidth;
        canvas.height = boxHeight;
       
        const ctx = canvas.getContext("2d");
        const offsetX = (video.videoWidth - boxWidth) / 2; // X offset for centering
        const offsetY = (video.videoHeight - boxHeight) / 2; // Y offset for centering
        // Draw the current video frame to the canvas
        ctx.drawImage(
          video,
          offsetX, // Source X
          offsetY, // Source Y
          boxWidth, // Source width
          boxHeight, // Source height
          0, // Destination X
          0, // Destination Y
          boxWidth, // Destination width
          boxHeight // Destination height
        );
        // Continue drawing frames
        requestAnimationFrame(drawFrame);
      };

      drawFrame();
    }
  };

  if (change) {
    console.log("pagechange");
    
  } else {
  } // Add your else condition here if needed.

  if (send) {
    analyzeImage(cleanBase64);
    setData(false);
  } else {
  }
  
  useEffect(()=>{
    (async () => {
      try {
        const data = await getModels();
        console.log("Data fetched:", data);
        const objectNames = data.map((item) => item.object_name);
        console.log("Objects fetched:", objectNames); 
        setItem(objectNames || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    })();
  },[getModels])



  useEffect(() => {
    if (typeof window !== "undefined") {
      getVideo();
    } else {
    }
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") {
      drawToCanvas();
    } else {
    }
  }, [videoRef]);

  useEffect(() => {
    if(!change) return;
    router.push("/model");
    setchange(false);
  },[router, change])
 



  return (
    <div className="relative flex justify-center items-center h-screen ">
       
      {/* Video Stream */}
      <video
        className="absolute w-full h-full object-cover inset-0"
        ref={videoRef}
        autoPlay
        playsInline
        muted
      />
     

      <canvas className= {`absolute z-50 ${
          isVisible ? "block" : "hidden"
      }`} ref={photoRef}></canvas>
      <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-lg z-10"></div>
      <div className="relative z-30">
      <canvas className="z-30 shadow-lg" ref={cropRef}>
        
      </canvas>
      {/* Top-left corner */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500"></div>
        {/* Top-right corner */}
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500"></div>
        {/* Bottom-left corner */}
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 "></div>
        {/* Bottom-right corner */}
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500"></div>
      </div>

      <div className="absolute bottom-16 z-10">
        <button
          className="flex items-center gap-3 bg-blue-700 text-white font-bold rounded-full px-8 py-3 shadow-lg hover:bg-blue-100 focus:outline-none focus:ring-4 focus:ring-blue-500 transition-all duration-300"
          onClick={takePhoto}
        >
          <LuScanLine size={24} className="text-white" />
          Click to Scan
        </button>
      </div>
      {/* QR Scanner Overlay */}
      {/* <div className="relative z-20 flex flex-col items-center">
        <div className="relative w-80 h-80 border border-black rounded-2xl flex justify-center items-center">
          <IoIosQrScanner
            size={550}
            className="text-gray-800 animate-pulse"
            style={{ strokeWidth: 0 }}
          />
        </div>
        <p className="mt-4 text-black text-base font-semibold animate-bounce transition-transform">
          Align the text inside the box to scan
        </p>
      </div> */}

      {/* Button for Scanning */}
   
    </div>
  );
}
