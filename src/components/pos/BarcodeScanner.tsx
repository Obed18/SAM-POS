import { useEffect, useRef } from "react";
import Quagga, { QuaggaJSResultObject } from "@ericblade/quagga2";
import { X } from "lucide-react";

interface Props {
  onDetected: (code: string) => void;
  onClose: () => void;
}

const BarcodeScanner = ({ onDetected, onClose }: Props) => {
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
            facingMode: { ideal: "environment" },
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

    const onDetectedHandler = (data: QuaggaJSResultObject) => {
      const code = data.codeResult?.code;
      if (code) {
        onDetected(code);
        onClose(); // auto close on success (optional)
      }
    };

    Quagga.onDetected(onDetectedHandler);

    return () => {
      Quagga.offDetected(onDetectedHandler);
      Quagga.stop();
    };
  }, [onDetected, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      {/* Blurred Background */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-xl mx-4 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-scaleIn">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 text-white">
          <h2 className="text-sm font-medium tracking-wide">
            Scan Barcode
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scanner Area */}
        <div className="relative w-full h-[320px] bg-black">

          {/* Camera Feed */}
          <div
            ref={scannerRef}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Scanner Frame */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-[80%] h-[140px] border-2 border-emerald-400 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.6)]">

              {/* Animated scan line */}
              <div className="absolute left-0 w-full h-[2px] bg-emerald-400 animate-scan" />

            </div>
          </div>

          {/* Instruction */}
          <div className="absolute bottom-3 w-full text-center text-white text-sm">
            Align barcode within the frame
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes scan {
            0% { top: 0; }
            50% { top: 100%; }
            100% { top: 0; }
          }

          .animate-scan {
            animation: scan 2s linear infinite;
          }

          @keyframes fadeIn {
            from { opacity: 0 }
            to { opacity: 1 }
          }

          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }

          @keyframes scaleIn {
            from { transform: scale(0.9); opacity: 0 }
            to { transform: scale(1); opacity: 1 }
          }

          .animate-scaleIn {
            animation: scaleIn 0.3s ease-out;
          }
        `}
      </style>
    </div>
  );
};

export default BarcodeScanner;