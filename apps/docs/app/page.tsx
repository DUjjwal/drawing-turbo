"use client"
import { useEffect, useRef, useState } from "react";


export default function Page() {

  const ref = useRef<HTMLCanvasElement>(null)
  
  const shapes: any = []

  const color = useRef<string>("blue")
  const [ C, setC ] = useState<string>("blue")

  const cursor = useRef<string>("R")
  const [cursorState, setCursorState] = useState<string>("R")

  function DrawRect() {
    
    const canvas = ref.current
    const ctx = canvas?.getContext("2d")
    if(!ctx || !canvas)return;
    
    shapes.forEach((obj: any) => {
      if(obj.type === 'rect') {
        ctx.strokeStyle = obj.color
        ctx.strokeRect(obj.x, obj.y, obj.width, obj.height)
      }
    })

  }



  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext("2d")
    if(!ctx || !canvas)return;
    canvas.width = window.innerWidth - 10
    canvas.height = window.innerHeight - 10

    let isDragging = false
    let rectX = 0, rectY = 0
  


    const mouseDown = (e) => {
      isDragging = true
      rectX = e.clientX
      rectY = e.clientY
    }

    const mouseMove = (e) => {
      if(isDragging && cursor.current === 'R') {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        DrawRect()
        ctx.strokeStyle = color.current
        ctx.strokeRect(rectX, rectY, e.clientX - rectX, e.clientY - rectY)
      }
        
    }

    const mouseUp = (e) => {
      isDragging = false
      if(cursor.current === 'R') {
          shapes.push({
          type: "rect",
          x: rectX,
          y: rectY,
          width: e.clientX - rectX,
          height: e.clientY - rectY,
          color: color.current
        })
        DrawRect()
      
      }
    }



    canvas.addEventListener("mousedown", mouseDown)
    canvas.addEventListener("mousemove", mouseMove)
    canvas.addEventListener("mouseup", mouseUp)

    return () => {
      canvas.removeEventListener("mousedown", mouseDown)
      canvas.removeEventListener("mouseup", mouseUp)
      canvas.removeEventListener("mousemove", mouseMove)
    }

  }, [])
  
  



  return (
    <div className="w-full">
      <canvas ref={ref}></canvas>
      <div className="flex flex-col p-0.5 gap-y-0.5 fixed top-[40%] left-1 border-1 border-gray-400 rounded-lg">
        <button className={`w-8 h-8 bg-blue-600 rounded-lg ${C === "blue" ? "border-1 border-y-black" : ''}`} onClick={() =>  {
          color.current = 'blue'
          setC("blue")
        }}></button>
        <button className={`w-8 h-8 bg-green-500 rounded-lg ${C === "green" ? "border-1 border-black" : ''}`} onClick={() =>  {
          color.current = 'green'
          setC("green")
        }}></button>
      </div>

      <div className="flex p-0.5 gap-x-0.5 fixed top-1 left-[45%] border-1 border-gray-400 rounded-lg">
        <button className={`w-8 h-8 rounded-lg border-1 border-y-black ${cursorState === 'A' ? "bg-blue-300" : ''}`} onClick={() =>  {
          cursor.current = 'A'
          setCursorState("A")
        
        }}>A</button>
        <button className={`w-8 h-8 rounded-lg border-1 border-y-black ${cursorState === 'R' ? "bg-blue-300" : ''}`} onClick={() =>  {
          cursor.current = 'R'
          setCursorState("R")
        }}>R</button>
      
      </div>
    </div>
    
  
  );
}
