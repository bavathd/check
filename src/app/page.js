"use client"

import React , {  useEffect, useRef, useState } from "react";
import { useRouter } from 'next/navigation'



export default function Home() {
  const screenRef = useRef(null)
  const videoRef = useRef(null);
  // const [fullscreen, setFullscreen] = useState<boolean>(false);
  const photoRef = useRef(null);
  // const [orientation, setOrientation] = useState("portrait");
  const [cleanBase64, setBase64] = useState(""); 
  const [send, setData] = useState(false);
  const [winWidth, setWidth] = useState(null);
  const [winHeight, setHeight] = useState(null);
  const [change, setchange] = useState(false);
  const wordList = ['apple', 'orange', 'grapes'];
  const router = useRouter();


  const getVideo = () => {

      navigator.mediaDevices.getUserMedia({ video:{ width: 1920, height: 1080, facingMode:"environment" } })
        .then((stream) => {
          if(videoRef !== null) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        })
        .catch((error) => {
          console.error("Error getting video stream", error);
        });
      }


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
        word.split('\n').forEach((element) => {
          const x = element.toLowerCase();
          if(wordList.includes(x)){
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

    if (!videoRef.current || !photoRef.current) return;
    if (typeof window !== "undefined") {
        const width = winWidth
        const height = winHeight;

        const video = videoRef.current;
        const photo = photoRef.current;
        if(!photo) return(() => {console.error("Can not opencanvas");});
      
        photo.width = width;
        photo.height = height;


        const ctx = photo.getContext("2d");
        if(!ctx) return(() => {console.error("Can not opencanvas");});
        ctx.drawImage(video, 0, 0, photo.width, photo.height);

        const image = photo.toDataURL("image/base64", 0.5);
        const imgData = image.split(",")[1];
        setBase64(imgData);
        console.log(cleanBase64);
        setData(true);
      }else{}
  };
  useEffect(() => {
    if (typeof window !== "undefined") {
      getVideo();
    } else{}   
  }, []);

  // Only access window dimensions in the client
  useEffect(() => {
    if (typeof window !== "undefined") {
      setWidth(window.innerWidth || 1080);
      setHeight(window.innerHeight || 1920);
    } else{}
  }, []);
 
    if (change) {
      router.push('/model');
      console.log("pagechange");
      setchange(false);
    }
    else {}  // Add your else condition here if needed.
 

  if (send) {
    analyzeImage(cleanBase64);
    setData(false);
  }
  else {}

  return (
    
    <div 
      className="2xl:container align-middle  overflow-hidden"
      ref={screenRef}>
      <video
       className="absolute  w-full h-full object-cover z-30"  // Use the full viewport size and cover the image
        ref={videoRef}
        autoPlay
        playsInline
        muted
      ></video>
      <canvas  className="hidden" ref={photoRef}></canvas>
      <button className="absolute  size-24 z-30 bg-black rounded-full border-4 border-trans-white backdrop-blur" onClick={takePhoto} >click</button>
      {/* <canvas ref={photoRef}></canvas>
      <button
        onClick={takePhoto}
      >
        {orientation === "portrait" ? "Portrait Mode" : "Landscape Mode"}
      </button> */}
    </div>
  );
}


