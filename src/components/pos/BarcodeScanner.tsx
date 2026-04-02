import { useEffect, useRef } from "react";
import Quagga from "@ericblade/quagga2";

interface Props {
  onDetected: (code: string) => void;
}

const BarcodeScanner = ({ onDetected }: Props) => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const beepRef = useRef<HTMLAudioElement | null>(null);
  const lastScanned = useRef<string | null>(null);
  const scanCooldown = useRef(false);

  useEffect(() => {
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

      // ❗ prevent duplicate spam
      if (!code || scanCooldown.current) return;
      if (lastScanned.current === code) return;

      scanCooldown.current = true;
      lastScanned.current = code;

      // 🔊 PLAY BEEP
      if (beepRef.current) {
        beepRef.current.currentTime = 0;
        beepRef.current.play().catch(() => {});
      }

      // 📳 VIBRATE (mobile)
      navigator.vibrate?.(150);

      onDetected(code);

      // cooldown
      setTimeout(() => {
        scanCooldown.current = false;
      }, 1200);
    };

    Quagga.onDetected(onDetectedHandler);

    return () => {
      Quagga.offDetected(onDetectedHandler);
      Quagga.stop();
    };
  }, [onDetected]);

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={scannerRef}
        style={{ width: "100%", height: "300px" }}
      />

      {/* Optional scan box */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "10%",
          width: "80%",
          height: "60%",
          border: "2px solid #00ff99",
          borderRadius: "12px",
        }}
      />
    </div>
  );
};

export default BarcodeScanner;