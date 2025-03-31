import type { Route } from "./+types/home";
import { socket } from "../socket";
import { use, useEffect, useRef, useState } from "react";
import { data } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

function convertDataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new Blob([u8arr], { type: mime });
}

export default function Home() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [imageDataPrefix, setImageDataPrefix] = useState("");
  const [receivedPieces, setReceivedPieces] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const imagePrefixRef = useRef("");

  useEffect(() => {
    if (!imageCanvasRef.current) return;

    const incomingPieces: {
      x: number;
      y: number;
      incomingImage: HTMLImageElement;
    }[] = [];
    const ctx = imageCanvasRef.current!.getContext(
      "2d"
    ) as CanvasRenderingContext2D;

    function drawIncomingPieces() {
      if (incomingPieces.length === 0) return;

      const newIncomingLength = incomingPieces.length;
      setReceivedPieces((prv) => prv + newIncomingLength);
      for (let i = 0; i < newIncomingLength; i++) {
        const firstIncoming = incomingPieces.shift()!;
        ctx.drawImage(
          firstIncoming?.incomingImage,
          firstIncoming?.x,
          firstIncoming?.y
        );
      }
    }

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onDrawEvent(value: { x: number; y: number; data: string }) {
      const incomingImage = new Image();
      incomingImage.src = imagePrefixRef.current + value.data;

      incomingImage.onload = () => {
        incomingPieces.push({ x: value.x, y: value.y, incomingImage });
        requestAnimationFrame(drawIncomingPieces);
      };
    }

    function onChangeMetaDataEvent(
      value: {
        prefix: string;
        imageId: string;
        numberOfChunks: number;
      },
      callback: Function
    ) {
      setReceivedPieces(() => 0);
      setTotalChunks(value.numberOfChunks);
      imagePrefixRef.current = value.prefix;
      callback();
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("draw", onDrawEvent);
    socket.on("image-metadata", onChangeMetaDataEvent);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("draw", onDrawEvent);
      socket.off("image-metadata", onChangeMetaDataEvent);
    };
  }, [imageCanvasRef?.current]);
  return (
    <div className="flex flex-col gap-3 items-center w-full">
      <h1>IMAGE STREAM</h1>
      <canvas
        id="image-canvas"
        width={720}
        height={720}
        className="border-2"
        ref={imageCanvasRef}
      ></canvas>
      <button
        className="bg-green-600 px-3 py-2 rounded-md mt-3"
        onClick={() => socket.emit("start-stream")}
      >
        START
      </button>
      <button
        className="bg-red-400 px-3 py-2 rounded-md"
        onClick={() =>
          imageCanvasRef?.current
            ?.getContext("2d")!
            .clearRect(
              0,
              0,
              imageCanvasRef?.current.width,
              imageCanvasRef?.current.height
            )
        }
      >
        CLEAR
      </button>
      <p className="capitalize">
        total received - {receivedPieces} / {totalChunks}
      </p>
    </div>
  );
}
