import { useEffect, useRef } from "react";
import Quagga from "@ericblade/quagga2";
import "../../styles/BarcodeScannerModal.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onDetected: (code: string) => void;
}

const BarcodeScannerModal = ({ isOpen, onClose, onDetected }: Props) => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const beepRef = useRef<HTMLAudioElement | null>(null);
  const lastScanned = useRef<string | null>(null);
  const scanCooldown = useRef(false);

  useEffect(() => {
    if (!isOpen) return;

    // 🔊 preload beep sound
    beepRef.current = new Audio("/sounds/Beep.mp3");

    if (!scannerRef.current) return;

    Quagga.init(
      {
        inputStream: {
          type: "LiveStream",
          target: scannerRef.current,
          constraints: {
            width: { min: 640 },
            height: { min: 480 },
            facingMode: { ideal: "environment" },
          },
        },
        locator: {
          patchSize: "medium",
          halfSample: true,
        },
        numOfWorkers: navigator.hardwareConcurrency || 4,
        frequency: 10,
        decoder: {
          readers: ["code_128_reader", "ean_reader", "ean_8_reader"],
        },
      },
      (err) => {
        if (err) {
          console.error(err);
          return;
        }
        Quagga.start();
      }
    );

    const onDetectedHandler = (data: any) => {
      const code = data.codeResult?.code;

      if (!code || scanCooldown.current) return;
      if (lastScanned.current === code) return;

      scanCooldown.current = true;
      lastScanned.current = code;

      // 🔊 beep
      if (beepRef.current) {
        beepRef.current.currentTime = 0;
        beepRef.current.play().catch(() => {});
      }

      navigator.vibrate?.(150);

      onDetected(code);

      setTimeout(() => {
        scanCooldown.current = false;
      }, 1200);
    };

    Quagga.onDetected(onDetectedHandler);

    return () => {
      Quagga.offDetected(onDetectedHandler);
      Quagga.stop();
    };
  }, [isOpen, onDetected]);

  if (!isOpen) return null;

  return (
    <div className="scanner-overlay">
      <div className="scanner-modal">
        {/* Header */}
        <div className="scanner-header">
          <h3>Scan Barcode</h3>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        {/* Scanner */}
        <div className="scanner-container">
          <div ref={scannerRef} className="scanner-view" />

          {/* Scan box */}
          <div className="scan-box" />
        </div>
      </div>
    </div>
  );
};

export default BarcodeScannerModal;