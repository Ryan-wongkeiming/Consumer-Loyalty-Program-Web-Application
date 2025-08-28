import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RotateCcw } from 'lucide-react';

interface CameraCaptureProps {
  onCodeDetected: (code: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCodeDetected, onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      
      let mediaStream: MediaStream | null = null;
      
      // Try back camera first
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Use back camera on mobile
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
      } catch (backCameraError) {
        console.warn('Back camera not available, trying front camera:', backCameraError);
        
        // Try front camera if back camera fails
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'user', // Use front camera
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          });
        } catch (frontCameraError) {
          console.warn('Front camera not available, trying any camera:', frontCameraError);
          
          // Try any available camera without specifying facingMode
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true
          });
        }
      }
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        setIsActive(true);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Quyền truy cập camera bị từ chối. Vui lòng cho phép truy cập camera trong cài đặt trình duyệt.');
        } else if (err.name === 'NotFoundError' || err.message.includes('Requested device not found')) {
          setError('Không tìm thấy camera. Vui lòng đảm bảo camera được kết nối và hoạt động, kiểm tra quyền truy cập camera trong cài đặt hệ thống, và thử khởi động lại trình duyệt hoặc thiết bị nếu vấn đề vẫn tiếp tục.');
        } else if (err.name === 'ConstraintNotSatisfiedError') {
          setError('Camera không hỗ trợ độ phân giải yêu cầu. Vui lòng thử lại.');
        } else {
          setError('Không thể truy cập camera. Vui lòng thử lại.');
        }
      } else {
        setError('Không thể truy cập camera. Vui lòng thử lại.');
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsActive(false);
  };

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setProcessing(true);
    setError(null);

    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Không thể tạo canvas context');
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Preprocess: Convert to grayscale and enhance contrast
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        // Convert to grayscale
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        // Apply binary threshold for contrast enhancement
        const threshold = gray > 128 ? 255 : 0;
        data[i] = threshold;     // Red
        data[i + 1] = threshold; // Green
        data[i + 2] = threshold; // Blue
        // Alpha channel remains unchanged
      }
      
      context.putImageData(imageData, 0, 0);
      const imageDataUrl = canvas.toDataURL('image/png');

      // Send to OCR service with retry logic (up to 2 attempts)
      let lastError: Error | null = null;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ocr-processor`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: imageDataUrl }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP ${response.status}`);
          }

          const { text } = await response.json();
          
          if (text && text.trim()) {
            // Extract potential promo code (alphanumeric, 6-20 characters)
            const codeMatch = text.match(/[A-Za-z0-9]{6,20}/);
            const extractedCode = codeMatch ? codeMatch[0] : text.trim();
            
            onCodeDetected(extractedCode);
            stopCamera();
            onClose();
            return;
          } else {
            throw new Error('Không tìm thấy mã giảm giá trong hình ảnh');
          }
        } catch (err) {
          lastError = err instanceof Error ? err : new Error('Unknown error');
          if (attempt === 2) break; // Don't retry on last attempt
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      throw lastError || new Error('Không thể xử lý hình ảnh');
      
    } catch (err) {
      console.error('OCR processing error:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi xử lý hình ảnh');
    } finally {
      setProcessing(false);
    }
  };

  const retryCamera = () => {
    stopCamera();
    startCamera();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Chụp mã giảm giá</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Đóng camera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera View */}
        <div className="relative">
          {isActive ? (
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 object-cover bg-black"
                playsInline
                muted
              />
              {/* Overlay guide */}
              <div className="absolute inset-4 border-2 border-white border-dashed rounded-lg flex items-center justify-center">
                <p className="text-white text-sm text-center bg-black bg-opacity-50 px-2 py-1 rounded">
                  Đặt mã giảm giá trong khung này
                </p>
              </div>
            </div>
          ) : (
            <div className="h-64 bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Đang khởi động camera...</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 space-y-3">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
              <button
                onClick={retryCamera}
                className="mt-2 flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Thử lại</span>
              </button>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={captureImage}
              disabled={!isActive || processing}
              className="flex-1 bg-blackmores-teal text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blackmores-teal-dark transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              {processing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Đang xử lý...</span>
                </div>
              ) : (
                'Chụp'
              )}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-300 hover:scale-105"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCapture;