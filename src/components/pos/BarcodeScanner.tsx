import { useEffect, useRef } from "react";
import Quagga from "@ericblade/quagga2";

interface Props {
  onDetected: (code: string) => void;
}

const BarcodeScanner = ({ onDetected }: Props) => {
  const scannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scannerRef.current) return;

    Quagga.init(
      {
        inputStream: {
          type: "LiveStream",
          target: scannerRef.current,
          constraints: {
            width: { min: 640 },
            height: { min: 480 },
            facingMode: { ideal: "environment" }, // prefer back camera
          },
          area: {
            top: "0%",
            right: "0%",
            left: "0%",
            bottom: "0%",
          },
        },
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
      if (code) {
        onDetected(code);
      }
    };

    Quagga.onDetected(onDetectedHandler);

    return () => {
      Quagga.offDetected(onDetectedHandler);
      Quagga.stop();
    };
  }, [onDetected]);

  return (
    <div>
      <div
        ref={scannerRef}
        style={{ width: "100%", height: "300px" }}
      />
    </div>
  );
};

export default BarcodeScanner;