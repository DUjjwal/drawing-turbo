"use client"
import { useEffect, useRef } from "react";


export default function Page() {

  const ref = useRef<HTMLCanvasElement>(null)
  
  const shapes: any = []

  function DrawRect() {
    
    const canvas = ref.current
    const ctx = canvas?.getContext("2d")
    if(!ctx || !canvas)return;
    
    shapes.forEach((obj: any) => {
      if(obj.type === 'rect') {
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
      if(isDragging) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        DrawRect()
        ctx.strokeRect(rectX, rectY, e.clientX - rectX, e.clientY - rectY)
      }
        
    }

    const mouseUp = (e) => {
      isDragging = false
      shapes.push({
        type: "rect",
        x: rectX,
        y: rectY,
        width: e.clientX - rectX,
        height: e.clientY - rectY
      })
      DrawRect()
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

    </div>
    
  
  );
}
