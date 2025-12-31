import { useEffect, useState } from "react";

interface BrandLoaderProps {
  text?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function BrandLoader({ 
  text = "Loading...", 
  size = "md",
  className = "" 
}: BrandLoaderProps) {
  const [activeSquare, setActiveSquare] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSquare((prev) => (prev + 1) % 3);
    }, 400);

    return () => clearInterval(interval);
  }, []);

  const sizeMap = {
    sm: { square: 10, gap: 0 },
    md: { square: 16, gap: 0 },
    lg: { square: 24, gap: 0 },
  };

  const { square: squareSize, gap } = sizeMap[size];

  return (
    <div className={`flex flex-col items-center gap-8 ${className}`}>
      {/* Logo Animation - 3 squares in > shape */}
      <div 
        className="relative"
        style={{
          width: `${squareSize * 2 + gap}px`,
          height: `${squareSize * 2 + gap}px`,
        }}
      >
        {/* Top Left Square */}
        <div
          className="absolute transition-all duration-300"
          style={{
            width: `${squareSize}px`,
            height: `${squareSize}px`,
            top: 0,
            left: 0,
            backgroundColor: "#f97316",
            opacity: activeSquare === 0 ? 1 : 0.4,
            transform: activeSquare === 0 ? 'scale(1.1)' : 'scale(1)',
          }}
        />
        
        {/* Center Square */}
        <div
          className="absolute transition-all duration-300"
          style={{
            width: `${squareSize}px`,
            height: `${squareSize}px`,
            top: `${squareSize + gap}px`,
            left: `${squareSize + gap}px`,
            backgroundColor: "#f97316",
            opacity: activeSquare === 1 ? 1 : 0.4,
            transform: activeSquare === 1 ? 'scale(1.1)' : 'scale(1)',
          }}
        />
        
        {/* Bottom Left Square */}
        <div
          className="absolute transition-all duration-300"
          style={{
            width: `${squareSize}px`,
            height: `${squareSize}px`,
            top: `${squareSize * 2 + gap * 2}px`,
            left: 0,
            backgroundColor: "#f97316",
            opacity: activeSquare === 2 ? 1 : 0.4,
            transform: activeSquare === 2 ? 'scale(1.1)' : 'scale(1)',
          }}
        />
      </div>

      {/* Loading Text */}
      {text && (
        <p className="text-white font-medium text-sm animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}