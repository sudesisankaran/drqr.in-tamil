import { useCallback, useEffect, useRef, useState } from "react";
import { ScanLine, Camera, SwitchCamera, AlertTriangle } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import Scroll from "./page-binder/Scroll";
import { useNavigate } from "react-router-dom";

type CameraDevice = {
  id: string;
  label: string;
};

const ScanPage = () => {
  const navigate = useNavigate();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameraId, setCameraId] = useState<string | null>(null);
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [scannedText, setScannedText] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [error, setError] = useState("");
  const [loadingCameras, setLoadingCameras] = useState(true);

  const openEmergencyProfile = useCallback((text: string) => {
    const cleanText = text.trim();

    setScannedText(cleanText);
    setIsScanning(false);
    void scannerRef.current?.stop().catch(() => {});

    try {
      const url = new URL(cleanText);
      const emergencyMatch = url.pathname.match(/\/emergency\/([^/]+)/);

      if (emergencyMatch?.[1]) {
        navigate(`/emergency/${emergencyMatch[1]}`);
        return;
      }
    } catch {
      // Plain QR values are also accepted.
    }

    navigate(`/emergency/${encodeURIComponent(cleanText)}`);
  }, [navigate]);

  const startScanner = useCallback(async (selectedCameraId?: string) => {
    const nextCameraId = selectedCameraId || cameraId;
    if (!nextCameraId) {
      setError("No camera found on this device.");
      return;
    }

    try {
      setError("");

      const selectedCamera = devices.find((device) => device.id === nextCameraId);
      const isFront =
        selectedCamera?.label?.toLowerCase().includes("front") ||
        selectedCamera?.label?.toLowerCase().includes("user");

      setIsFrontCamera(!!isFront);

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("reader");
      }

      const currentState = scannerRef.current.getState();
      if (currentState === 2) {
        await scannerRef.current.stop();
      }

      setIsScanning(true);

      await scannerRef.current.start(
        nextCameraId,
        { fps: 10, qrbox: 260, aspectRatio: 1 },
        (text) => {
          openEmergencyProfile(text);
        },
        () => {},
      );
    } catch (err) {
      setIsScanning(false);
      setError(err instanceof Error ? err.message : "Unable to access camera.");
    }
  }, [cameraId, devices, openEmergencyProfile]);

  const switchCamera = async () => {
    if (devices.length < 2 || !cameraId) return;

    const currentIndex = devices.findIndex((device) => device.id === cameraId);
    const nextIndex = (currentIndex + 1) % devices.length;
    const nextCamera = devices[nextIndex];

    setCameraId(nextCamera.id);
    await startScanner(nextCamera.id);
  };

  useEffect(() => {
    const initCameras = async () => {
      try {
        setLoadingCameras(true);
        setError("");

        const cams = await Html5Qrcode.getCameras();
        if (!cams.length) {
          setError("No camera available for QR scanning.");
          return;
        }

        setDevices(cams);
        setCameraId(cams[0].id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load cameras.");
      } finally {
        setLoadingCameras(false);
      }
    };

    void initCameras();

    return () => {
      void scannerRef.current?.stop().catch(() => {});
      scannerRef.current?.clear();
    };
  }, []);

  useEffect(() => {
    if (!loadingCameras && cameraId && !isScanning) {
      void startScanner(cameraId);
    }
  }, [cameraId, isScanning, loadingCameras, startScanner]);

  return (
    <Scroll>
      <div className="py-12 bg-slate-50 flex flex-col items-center justify-center px-4">
        <div className="text-center mb-6">
          <ScanLine size={70} className="text-blue-900 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-gray-900">
            Emergency QR Scanner
          </h2>
          <p className="text-gray-600 mt-2">
            Open the camera, scan the QR, and go directly to the patient emergency profile.
          </p>
        </div>

        <div
          id="reader"
          className={`w-full max-w-sm rounded-xl overflow-hidden border bg-black min-h-[320px] ${isFrontCamera ? "scale-x-[-1]" : ""}`}
        />

        {error && (
          <div className="mt-5 w-full max-w-sm rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="flex items-start gap-2">
              <AlertTriangle size={18} className="mt-0.5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="flex gap-4 mt-5">
          {!isScanning && (
            <button
              onClick={() => void startScanner()}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg"
            >
              <Camera size={18} /> Start Camera
            </button>
          )}
          {devices.length > 1 && (
            <button
              onClick={() => void switchCamera()}
              className="flex items-center gap-2 bg-gray-800 text-white px-5 py-2 rounded-lg"
            >
              <SwitchCamera size={18} /> Switch
            </button>
          )}
        </div>

        {scannedText && (
          <div className="mt-6 p-4 bg-green-100 border border-green-300 rounded-lg w-full max-w-sm">
            <p className="text-green-800 font-semibold">
              Scanned Result:
            </p>
            <p className="break-all text-gray-800 mt-2">
              {scannedText}
            </p>
          </div>
        )}
      </div>
    </Scroll>
  );
};

export default ScanPage;
