import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCw, Move, Loader2 } from "lucide-react";

function ImageCropDialog({ 
  isOpen, 
  onClose, 
  imageUrl, 
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  imageUrl: string;
  onSave: (blob: Blob) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [initialScale, setInitialScale] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Reset everything when dialog opens or imageUrl changes
  useEffect(() => {
    if (!isOpen) {
      // Clean up when dialog closes
      setImage(null);
      setIsImageLoaded(false);
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      setIsSaving(false);
      return;
    }

    if (imageUrl) {
      setIsImageLoaded(false);
      const img = new Image();
      
      img.onload = () => {
        // Calculate initial scale to fit image in canvas
        const canvasSize = 300;
        const imgWidth = img.width;
        const imgHeight = img.height;
        
        // Calculate scale to fit the entire image in the canvas
        // Add some padding (0.9) so it's not right at the edges
        const scaleToFit = Math.min(
          (canvasSize * 0.9) / imgWidth,
          (canvasSize * 0.9) / imgHeight
        );
        
        setImage(img);
        setInitialScale(scaleToFit);
        setScale(scaleToFit);
        setRotation(0);
        setPosition({ x: 0, y: 0 });
        setIsImageLoaded(true);
      };
      
      img.onerror = () => {
        console.error('Failed to load image');
        setIsImageLoaded(false);
      };
      
      img.src = imageUrl;
    }
  }, [isOpen, imageUrl]);

  useEffect(() => {
    if (image && canvasRef.current && isImageLoaded) {
      drawImage();
    }
  }, [image, scale, rotation, position, isImageLoaded]);

  const drawImage = () => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 300;
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);
    ctx.save();

    // Move to center
    ctx.translate(size / 2 + position.x, size / 2 + position.y);
    
    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);
    
    // Apply scale
    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;
    
    ctx.drawImage(
      image,
      -scaledWidth / 2,
      -scaledHeight / 2,
      scaledWidth,
      scaledHeight
    );

    ctx.restore();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isSaving) return;
    setIsDragging(true);
    setDragStart({ 
      x: e.clientX - position.x, 
      y: e.clientY - position.y 
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isSaving) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isSaving) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ 
      x: touch.clientX - position.x, 
      y: touch.clientY - position.y 
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || isSaving) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas || isSaving || !isImageLoaded) return;

    setIsSaving(true);

    try {
      // Create output canvas with proper circular crop
      const size = 400; // Higher resolution output
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = size;
      outputCanvas.height = size;
      const ctx = outputCanvas.getContext('2d');
      
      if (!ctx) {
        setIsSaving(false);
        return;
      }

      // Scale factor between display canvas and output canvas
      const scaleFactor = size / 300;

      // Clear and setup
      ctx.clearRect(0, 0, size, size);
      ctx.save();

      // Create circular clipping path FIRST
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // Now draw the image with the same transformations as preview
      ctx.translate(size / 2 + (position.x * scaleFactor), size / 2 + (position.y * scaleFactor));
      ctx.rotate((rotation * Math.PI) / 180);
      
      if (image) {
        const scaledWidth = image.width * scale * scaleFactor;
        const scaledHeight = image.height * scale * scaleFactor;
        
        ctx.drawImage(
          image,
          -scaledWidth / 2,
          -scaledHeight / 2,
          scaledWidth,
          scaledHeight
        );
      }

      ctx.restore();

      // Convert to blob
      outputCanvas.toBlob((blob) => {
        if (blob) {
          onSave(blob);
        }
        setIsSaving(false);
      }, "image/jpeg", 0.95);
    } catch (error) {
      console.error('Error saving image:', error);
      setIsSaving(false);
    }
  };

  // Update scale limits based on initial scale
  const minScale = initialScale * 0.5;
  const maxScale = initialScale * 5;

  const handleClose = () => {
    if (!isSaving) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crop Profile Picture</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Canvas container */}
          <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            {!isImageLoaded && (
              <div className="w-full aspect-square flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            
            <canvas 
              ref={canvasRef}
              className={`w-full cursor-move touch-none ${!isImageLoaded ? 'hidden' : ''}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />
            
            {isImageLoaded && (
              <>
                {/* Circular overlay */}
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle at center, transparent 45%, rgba(0,0,0,0.5) 45%)'
                  }}
                />
                
                {/* Border circle */}
                <div 
                  className="absolute inset-0 pointer-events-none flex items-center justify-center"
                >
                  <div 
                    className="border-4 border-white border-dashed rounded-full"
                    style={{ width: '90%', height: '90%' }}
                  />
                </div>
              </>
            )}
          </div>

          {/* Controls */}
          {isImageLoaded && (
            <>
              <div className="flex items-center justify-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setScale(Math.max(minScale, scale - initialScale * 0.2))}
                  disabled={isSaving}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                
                <div className="flex-1 px-4">
                  <input
                    type="range"
                    min={minScale}
                    max={maxScale}
                    step={initialScale * 0.05}
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full"
                    disabled={isSaving}
                  />
                </div>
                
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setScale(Math.min(maxScale, scale + initialScale * 0.2))}
                  disabled={isSaving}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setRotation((rotation + 90) % 360)}
                  disabled={isSaving}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                <Move className="h-4 w-4 inline mr-1" />
                Drag to reposition • Zoom to scale • Rotate to adjust
              </p>
            </>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving || !isImageLoaded}
            className="w-full sm:w-auto"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ImageCropDialog;