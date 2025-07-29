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
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    shapes.current.forEach((obj: any) => {
      if(obj.type === 'rect') {
        ctx.strokeStyle = obj.color
        ctx.strokeRect(obj.x, obj.y, obj.width, obj.height)
      }
      else if(obj.type === 'line') {
        ctx.beginPath()
        ctx.moveTo(obj.startX, obj.startY)
        ctx.strokeStyle = obj.color
        ctx.lineTo(obj.endX, obj.endY)
        ctx.stroke()
      }
    })

  }

  function isPointNearLine(x1: number, y1: number, x2: number, y2: number, px: number, py: number): boolean {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    const tolerance = 5

    const rect = ref.current?.getBoundingClientRect()

    
    px = px - (rect?.left ?? 0);
    py = py - (rect?.top ?? 0);


    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;

    if (len_sq !== 0) param = dot / len_sq;

    let nearestX, nearestY;

    if (param < 0) {
      nearestX = x1;
      nearestY = y1;
    } else if (param > 1) {
      nearestX = x2;
      nearestY = y2;
    } else {
      nearestX = x1 + param * C;
      nearestY = y1 + param * D;
    }

    const dx = px - nearestX;
    const dy = py - nearestY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance <= tolerance;
  }


  function onLine(e): number {
    const x = e.clientX, y = e.clientY
    let idx = -1
    shapes.current.forEach((obj, index) => {
      if(isPointNearLine(obj.startX, obj.startY, obj.endX, obj.endY, x, y)) {
        idx = index
      }
    })
    return idx
  }

  function onRectangle(e: MouseEvent): number {
    const tolerance = 3;

    const rect = ref.current?.getBoundingClientRect()

    
    const x = e.clientX - (rect?.left ?? 0);
    const y = e.clientY - (rect?.top ?? 0);

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

    let lineX = 0, lineY = 0, lineIdx = -1
    let dx1 = 0, dy1 = 0, dx2 = 0, dy2 = 0

    let selectedIdx = -1

    let animationFrameId: number;

    const drawLineFrame = (e: MouseEvent) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      DrawRect()

      ctx.beginPath()
      ctx.strokeStyle = color.current
      ctx.moveTo(lineX, lineY)
      ctx.lineTo(e.clientX, e.clientY)
      ctx.stroke()
    };
    
    const mouseDown = (e) => {
      isDragging = true
      rectX = e.clientX
      rectY = e.clientY
      lineX = e.clientX
      lineY = e.clientY
      if(cursor.current === 'A') {
        if(rectIdx !== -1) {
          const rect = shapes.current[rectIdx]
          if(rect) {
            dx = rect.x - e.clientX
            dy = rect.y - e.clientY
          }
        } 
        if(lineIdx !== -1) {
          const line = shapes.current[lineIdx]
          if(line) {
            dx1 = line.startX - e.clientX
            dy1 = line.startY - e.clientY

            dx2 = line.endX - e.clientX
            dy2 = line.endY - e.clientY
          }
        }
      }
    }

    const drawRectFrame = (e) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      DrawRect()
      ctx.strokeStyle = color.current
      ctx.strokeRect(rectX, rectY, e.clientX - rectX, e.clientY - rectY)
    }

    const mouseMove = (e) => {
      if(isDragging && cursor.current === 'R') {        
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(() => drawRectFrame(e));
      }
      if(cursor.current === 'A') {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        DrawRect()
        
        if(isDragging) {
          if(rectIdx !== -1) {
            const rect = shapes.current[rectIdx]
            if(rect) {
              rect.x = dx + e.clientX
              rect.y = dy + e.clientY
              DrawRect()
            }
          }
          else if(lineIdx !== -1) {
            const line = shapes.current[lineIdx]
            if(line) {
              line.startX = dx1 + e.clientX
              line.startY = dy1 + e.clientY

              line.endX = dx2 + e.clientX
              line.endY = dy2 + e.clientY
              DrawRect()
            }
          }
        }
        else {
          
          if((rectIdx = onRectangle(e)) !== -1 || (lineIdx = onLine(e)) !== -1) {
            document.body.style.cursor = "all-scroll"
          }
          else 
            document.body.style.cursor = "default"
          

          console.log(lineIdx, rectIdx)
        }
        
      }
      if(isDragging && cursor.current === 'L') {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(() => drawLineFrame(e));
      
      }        
    }

    const mouseUp = (e) => {
      if(isDragging) {

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
          if(rectIdx !== -1)
              selectedIdx = rectIdx
            else
              selectedIdx = lineIdx
          rectIdx = -1
          lineIdx = -1
        }
        else if(cursor.current === 'L') {
          console.log("hua")
          shapes.current.push({
            type: "line",
            startX: lineX,
            startY: lineY,
            endX: e.clientX,
            endY: e.clientY,
            color: color.current
          })
          DrawRect()
        }
      }
      isDragging = false
    }



    canvas.addEventListener("mousedown", mouseDown)
    canvas.addEventListener("mousemove", mouseMove)
    canvas.addEventListener("mouseup", mouseUp)
    window.addEventListener("keydown", (e) => {
      if(e.key === 'Delete' && cursor.current === 'A') {
        if(selectedIdx !== -1) {
          const updated = shapes.current.filter((obj, index) => index !== selectedIdx)
          shapes.current = updated
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          DrawRect()
          selectedIdx = -1
        }
      }
    })

    return () => {
      canvas.removeEventListener("mousedown", mouseDown)
      canvas.removeEventListener("mouseup", mouseUp)
      canvas.removeEventListener("mousemove", mouseMove)
      cancelAnimationFrame(animationFrameId); 
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

        <button className={`w-8 h-8 rounded-lg border-1 border-y-black ${cursorState === 'L' ? "bg-blue-300" : ''}`} onClick={() =>  {
          cursor.current = 'L'
          setCursorState("L")
        }}>L</button>
      
      </div>
    </div>
    
  
  );
}
