"use client"
import { useEffect, useRef, useState } from "react";


export default function Page() {

  const ref = useRef<HTMLCanvasElement>(null)
  
  const shapes = useRef<any[]>([])

  const color = useRef<string>("blue")
  const [ C, setC ] = useState<string>("blue")

  const cursor = useRef<string>("R")
  const [cursorState, setCursorState] = useState<string>("R")

  function DrawRect() {
    
    const canvas = ref.current
    const ctx = canvas?.getContext("2d")
    if(!ctx || !canvas)return;
    
    shapes.current.forEach((obj: any) => {
      if(obj.type === 'rect') {
        ctx.strokeStyle = obj.color
        ctx.strokeRect(obj.x, obj.y, obj.width, obj.height)
      }
    })

  }


  function onRectangle(e: MouseEvent): number {
    const tolerance = 3;
    const x = e.clientX;
    const y = e.clientY;

    let idx = -1;

    shapes.current.forEach((obj, index) => {
      if (obj.type !== 'rect') return;

      const left = obj.x;
      const right = obj.x + obj.width;
      const top = obj.y;
      const bottom = obj.y + obj.height;

      const onLeft = Math.abs(x - left) <= tolerance && y >= top && y <= bottom;
      const onRight = Math.abs(x - right) <= tolerance && y >= top && y <= bottom;
      const onTop = Math.abs(y - top) <= tolerance && x >= left && x <= right;
      const onBottom = Math.abs(y - bottom) <= tolerance && x >= left && x <= right;

      if (onLeft || onRight || onTop || onBottom) {
        idx = index;
      }
    });

    return idx; 
  }




  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext("2d")
    if(!ctx || !canvas)return;
    canvas.width = window.innerWidth - 10
    canvas.height = window.innerHeight - 10

    let isDragging = false
    let rectX = 0, rectY = 0, rectIdx = -1
    let dx = 0, dy = 0


    const mouseDown = (e) => {
      isDragging = true
      rectX = e.clientX
      rectY = e.clientY
      if(cursor.current === 'A') {
        if(rectIdx !== -1) {
          const rect = shapes.current[rectIdx]
          if(rect) {
            dx = rect.x - e.clientX
            dy = rect.y - e.clientY
          }
        } 
      }
    }

    const mouseMove = (e) => {
      if(isDragging && cursor.current === 'R') {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        DrawRect()
        ctx.strokeStyle = color.current
        ctx.strokeRect(rectX, rectY, e.clientX - rectX, e.clientY - rectY)
      }
      else if(cursor.current === 'A') {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        DrawRect()
        
        if(isDragging) {
          const rect = shapes.current[rectIdx]
          if(rect) {
            rect.x = dx + e.clientX
            rect.y = dy + e.clientY
            DrawRect()
          }
        }
        else {
          if((rectIdx = onRectangle(e)) !== -1) {
            document.body.style.cursor = "all-scroll"
          }
          else
            document.body.style.cursor = "default"
        }
        
      }
        
    }

    const mouseUp = (e) => {
      isDragging = false
      if(cursor.current === 'R') {
          shapes.current.push({
          type: "rect",
          x: rectX,
          y: rectY,
          width: e.clientX - rectX,
          height: e.clientY - rectY,
          color: color.current
        })
        DrawRect()
      
      }
      else if(cursor.current === 'A') {
        rectIdx = -1
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
