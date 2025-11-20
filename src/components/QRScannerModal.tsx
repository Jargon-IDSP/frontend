import { useEffect, useRef, useState, useId } from "react";
import { Html5Qrcode } from "html5-qrcode";
import Modal from "./learning/ui/Modal";
import goBackIcon from "../assets/icons/goBackIcon.svg";
import "../styles/components/_qrScanner.scss";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

export default function QRScannerModal({
  isOpen,
  onClose,
  onScanSuccess,
}: QRScannerModalProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerElementRef = useRef<HTMLDivElement>(null);
  const isRunningRef = useRef<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerId = useId().replace(/:/g, '-'); // Generate unique ID and replace colons

  // Helper function to safely stop the scanner
  const stopScanner = async () => {
    if (scannerRef.current && isRunningRef.current) {
      try {
        await scannerRef.current.stop();
        isRunningRef.current = false;
      } catch (err: any) {
        // Ignore errors if scanner is already stopped
        if (!err.message?.includes("not running") && !err.message?.includes("not started")) {
          console.warn("Error stopping scanner:", err);
        }
        isRunningRef.current = false;
      }
    }
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
      } catch (err) {
        // Ignore clear errors
        console.warn("Error clearing scanner:", err);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    if (!isOpen) {
      // Clean up scanner when modal closes
      stopScanner();
      return;
    }

    // Initialize scanner when modal opens
    const initScanner = async () => {
      // Wait a bit for the DOM to be ready
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      // Ensure container exists and has dimensions
      if (!containerRef.current) {
        setError("Scanner container not found");
        return;
      }

      try {
        setError(null);
        const html5QrCode = new Html5Qrcode(scannerId);
        scannerRef.current = html5QrCode;

        // Get container dimensions for responsive qrbox
        const containerWidth = containerRef.current.offsetWidth;
        const qrboxSize = Math.min(250, containerWidth * 0.8);

        // Start scanning with camera
        await html5QrCode.start(
          { facingMode: "environment" }, // Use back camera on mobile
          {
            fps: 10,
            qrbox: { width: qrboxSize, height: qrboxSize },
            aspectRatio: 1.0,
            disableFlip: false,
          },
          (decodedText) => {
            // Success callback
            onScanSuccess(decodedText);
            // Stop scanning after successful scan
            stopScanner().then(() => {
              onClose();
            });
          },
          (errorMessage) => {
            // Error callback - ignore most errors as they're just "no QR code found" messages
            // Only show actual errors
            if (errorMessage.includes("NotFoundException")) {
              // This is expected when no QR code is in view
              return;
            }
          }
        );
        isRunningRef.current = true;
        setIsScanning(true);
        
        // Force video element to be visible after a short delay
        // This ensures the video element created by html5-qrcode is properly displayed
        setTimeout(() => {
          // Use the ref instead of getElementById for more reliable lookup
          const scannerElement = scannerElementRef.current || document.getElementById(scannerId);
          if (scannerElement) {
            const videoElement = scannerElement.querySelector('video') as HTMLVideoElement;
            if (videoElement) {
              console.log('Video element found, ensuring visibility');
              videoElement.style.display = 'block';
              videoElement.style.visibility = 'visible';
              videoElement.style.opacity = '1';
              videoElement.style.width = '100%';
              videoElement.style.height = '100%';
              videoElement.setAttribute('playsinline', 'true');
              videoElement.setAttribute('autoplay', 'true');
              videoElement.setAttribute('muted', 'true');
            } else {
              console.warn('Video element not found in scanner container');
            }
          } else {
            console.warn('Scanner element not found');
          }
        }, 300);
      } catch (err: any) {
        console.error("Error initializing QR scanner:", err);
        setError(
          err.message ||
            "Failed to access camera. Please ensure camera permissions are granted."
        );
        setIsScanning(false);
      }
    };

    initScanner();

    // Cleanup on unmount
    return () => {
      stopScanner();
    };
  }, [isOpen, onClose, onScanSuccess]);

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="" maxWidth="90vw">
      <div className="qr-scanner-modal">
        <div className="qr-scanner-modal__header">
          <button
            className="qr-scanner-modal__close-button"
            onClick={handleClose}
            aria-label="Close scanner"
          >
            <img src={goBackIcon} alt="Close" />
          </button>
          <h2 className="qr-scanner-modal__title">Scan QR Code</h2>
        </div>
        {error ? (
          <div className="qr-scanner-modal__error">
            <p>{error}</p>
            <button
              className="qr-scanner-modal__retry-button"
              onClick={async () => {
                setError(null);
                // Clean up existing scanner
                await stopScanner();
                // Re-initialize scanner
                try {
                  const html5QrCode = new Html5Qrcode(scannerId);
                  scannerRef.current = html5QrCode;
                  await html5QrCode.start(
                    { facingMode: "environment" },
                    {
                      fps: 10,
                      qrbox: { width: 250, height: 250 },
                      aspectRatio: 1.0,
                    },
                    (decodedText) => {
                      onScanSuccess(decodedText);
                      stopScanner().then(() => {
                        onClose();
                      });
                    },
                    (errorMessage) => {
                      if (errorMessage.includes("NotFoundException")) {
                        return;
                      }
                    }
                  );
                  isRunningRef.current = true;
                  setIsScanning(true);
                } catch (err: any) {
                  console.error("Error re-initializing QR scanner:", err);
                  setError(
                    err.message ||
                      "Failed to access camera. Please ensure camera permissions are granted."
                  );
                  setIsScanning(false);
                }
              }}
            >
              Retry
            </button>
          </div>
        ) : (
          <div 
            ref={containerRef}
            className="qr-scanner-modal__scanner-container"
          >
            <div 
              ref={scannerElementRef}
              id={scannerId} 
              className="qr-scanner-modal__scanner" 
            />
            {!isScanning && (
              <div className="qr-scanner-modal__loading">Initializing camera...</div>
            )}
          </div>
        )}
        <p className="qr-scanner-modal__instructions">
          Point your camera at a QR code to scan
        </p>
      </div>
    </Modal>
  );
}

