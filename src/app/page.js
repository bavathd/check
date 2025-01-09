"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LuScanLine } from "react-icons/lu";
import { IoIosQrScanner } from "react-icons/io";
import { Armata } from "next/font/google";

export default function Home() {
  const screenRef = useRef(null);
  const videoRef = useRef(null);
  // const [fullscreen, setFullscreen] = useState<boolean>(false);
  const photoRef = useRef(null);
  // const [orientation, setOrientation] = useState("portrait");
  const [cleanBase64, setBase64] = useState("");
  const [send, setData] = useState(false);
  const [winWidth, setWidth] = useState(null);
  const [winHeight, setHeight] = useState(null);
  const [change, setchange] = useState(false);
  const wordList = ["apple", "orange", "grapes"];
  const router = useRouter();

  const getVideo = () => {
    navigator.mediaDevices
      .getUserMedia({
        video: { width: 1920, height: 1080, facingMode: "environment" },
      })
      .then((stream) => {
        if (videoRef !== null) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      })
      .catch((error) => {
        console.error("Error getting video stream", error);
      });
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
      if (response.ok) {
        const word = data.responses[0].fullTextAnnotation.text;
        console.log(word);
        word.split("\n").forEach((element) => {
          const x = element.toLowerCase();
          if (wordList.includes(x)) {
            window.sessionStorage.setItem("word", x);
            setchange(true);
          }
        });
      } else {
        console.error("Error from API:", data.error.message);
      }
    } catch (error) {
      console.error("Network or API error:", error);
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
      
      const image = photo.toDataURL("image/base64", 0.5);
      const imgData = image.split(",")[1];
      setBase64(imgData);
      console.log(cleanBase64);
      ctx.clearRect(0,0, boxWidth, boxHeight);
      setData(false);
    } else {
    }
  };
  useEffect(() => {
    if (typeof window !== "undefined") {
      getVideo();
    } else {
    }
  }, []);

  // Only access window dimensions in the client
  useEffect(() => {
    if (typeof window !== "undefined") {
      setWidth(window.innerWidth || 1080);
      setHeight(window.innerHeight || 1920);
    } else {
    }
  }, []);

  if (change) {
    router.push("/model");
    console.log("pagechange");
    setchange(false);
  } else {
  } // Add your else condition here if needed.

  if (send) {
    analyzeImage(cleanBase64);
    setData(false);
  } else {
  }

  return (
    <div className="relative flex justify-center items-center h-screen ">
      {/* Video Stream */}
      <video
        className="absolute w-full h-full object-cover"
        ref={videoRef}
        autoPlay
        playsInline
        muted
      />
      <canvas className="absolute z-0" ref={photoRef}></canvas>
      {/* QR Scanner Overlay */}
      <div className="relative z-20 flex flex-col items-center">
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
      </div>

      {/* Button for Scanning */}
      <div className="absolute bottom-16 z-30">
        <button
          className="flex items-center gap-3 bg-blue-700 text-white font-bold rounded-full px-8 py-3 shadow-lg hover:bg-blue-100 focus:outline-none focus:ring-4 focus:ring-blue-500 transition-all duration-300"
          onClick={takePhoto}
        >
          <LuScanLine size={24} className="text-white" />
          Click to Scan
        </button>
      </div>
    </div>
  );
}
