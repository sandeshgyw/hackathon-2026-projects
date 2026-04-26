import { useState, useRef, useCallback, useEffect } from "react";

export type ConsultationPhase =
  | "checking-permissions"
  | "permission-denied"
  | "device-setup"
  | "waiting-room"
  | "connecting"
  | "in-call"
  | "reconnecting"
  | "call-ended";

export type PermissionState = "pending" | "granted" | "denied" | "unavailable";

export interface DeviceInfo {
  deviceId: string;
  label: string;
}

export interface ConsultationState {
  phase: ConsultationPhase;
  cameraPermission: PermissionState;
  micPermission: PermissionState;
  localStream: MediaStream | null;
  isMuted: boolean;
  isCameraOff: boolean;
  isRemoteMuted: boolean;
  isFullscreen: boolean;
  callDuration: number;
  cameras: DeviceInfo[];
  microphones: DeviceInfo[];
  speakers: DeviceInfo[];
  selectedCamera: string;
  selectedMic: string;
  selectedSpeaker: string;
  isSidePanelOpen: boolean;
  activeTab: "notes" | "info" | "chat";
  notes: string;
  connectionQuality: "excellent" | "good" | "poor" | "unknown";
}

export function useVideoConsultation() {
  const [state, setState] = useState<ConsultationState>({
    phase: "checking-permissions",
    cameraPermission: "pending",
    micPermission: "pending",
    localStream: null,
    isMuted: false,
    isCameraOff: false,
    isRemoteMuted: false,
    isFullscreen: false,
    callDuration: 0,
    cameras: [],
    microphones: [],
    speakers: [],
    selectedCamera: "",
    selectedMic: "",
    selectedSpeaker: "",
    isSidePanelOpen: true,
    activeTab: "info",
    notes: "",
    connectionQuality: "unknown",
  });

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Enumerate devices
  const enumerateDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices
        .filter((d) => d.kind === "videoinput")
        .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Camera ${i + 1}` }));
      const microphones = devices
        .filter((d) => d.kind === "audioinput")
        .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Microphone ${i + 1}` }));
      const speakers = devices
        .filter((d) => d.kind === "audiooutput")
        .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Speaker ${i + 1}` }));

      setState((prev) => ({
        ...prev,
        cameras,
        microphones,
        speakers,
        selectedCamera: cameras[0]?.deviceId ?? "",
        selectedMic: microphones[0]?.deviceId ?? "",
        selectedSpeaker: speakers[0]?.deviceId ?? "",
      }));
    } catch {
      // ignore
    }
  }, []);

  // Request permissions & start local preview
  const requestPermissions = useCallback(async () => {
    setState((prev) => ({ ...prev, phase: "checking-permissions" }));
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      await enumerateDevices();

      setState((prev) => ({
        ...prev,
        localStream: stream,
        cameraPermission: "granted",
        micPermission: "granted",
        phase: "device-setup",
      }));

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err: unknown) {
      const error = err as DOMException;
      const isDenied =
        error.name === "NotAllowedError" || error.name === "PermissionDeniedError";
      setState((prev) => ({
        ...prev,
        cameraPermission: isDenied ? "denied" : "unavailable",
        micPermission: isDenied ? "denied" : "unavailable",
        phase: "permission-denied",
      }));
    }
  }, [enumerateDevices]);

  // Switch device
  const switchDevice = useCallback(
    async (type: "camera" | "mic" | "speaker", deviceId: string) => {
      setState((prev) => ({
        ...prev,
        selectedCamera: type === "camera" ? deviceId : prev.selectedCamera,
        selectedMic: type === "mic" ? deviceId : prev.selectedMic,
        selectedSpeaker: type === "speaker" ? deviceId : prev.selectedSpeaker,
      }));

      if (type === "speaker") return; // speaker switching done via setSinkId

      try {
        const constraints = {
          video:
            type === "camera"
              ? { deviceId: { exact: deviceId } }
              : streamRef.current?.getVideoTracks().length
              ? true
              : false,
          audio:
            type === "mic"
              ? { deviceId: { exact: deviceId } }
              : streamRef.current?.getAudioTracks().length
              ? true
              : false,
        };
        const newStream = await navigator.mediaDevices.getUserMedia(constraints);

        // Stop old tracks of the changed type
        if (streamRef.current) {
          const oldTracks =
            type === "camera"
              ? streamRef.current.getVideoTracks()
              : streamRef.current.getAudioTracks();
          oldTracks.forEach((t) => t.stop());
        }

        streamRef.current = newStream;
        setState((prev) => ({ ...prev, localStream: newStream }));
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = newStream;
        }
      } catch {
        // ignore switch errors
      }
    },
    []
  );

  // Proceed from device-setup to waiting room
  const proceedToWaitingRoom = useCallback(() => {
    setState((prev) => ({ ...prev, phase: "waiting-room" }));
  }, []);

  // Join the call
  const joinCall = useCallback(() => {
    setState((prev) => ({ ...prev, phase: "connecting" }));
    // Simulate connecting delay
    setTimeout(() => {
      setState((prev) => ({ ...prev, phase: "in-call", connectionQuality: "excellent" }));
      timerRef.current = setInterval(() => {
        setState((prev) => ({ ...prev, callDuration: prev.callDuration + 1 }));
      }, 1000);
    }, 2000);
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
    }
    setState((prev) => ({ ...prev, isMuted: !prev.isMuted }));
  }, []);

  // Toggle camera
  const toggleCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
    }
    setState((prev) => ({ ...prev, isCameraOff: !prev.isCameraOff }));
  }, []);

  // End call
  const endCall = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setState((prev) => ({ ...prev, phase: "call-ended", localStream: null }));
  }, []);

  // Reconnect
  const reconnect = useCallback(() => {
    setState((prev) => ({ ...prev, phase: "reconnecting" }));
    setTimeout(() => {
      setState((prev) => ({ ...prev, phase: "in-call", connectionQuality: "good" }));
    }, 3000);
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    setState((prev) => ({ ...prev, isFullscreen: !prev.isFullscreen }));
  }, []);

  // Side panel
  const toggleSidePanel = useCallback(() => {
    setState((prev) => ({ ...prev, isSidePanelOpen: !prev.isSidePanelOpen }));
  }, []);

  const setActiveTab = useCallback((tab: "notes" | "info" | "chat") => {
    setState((prev) => ({ ...prev, activeTab: tab }));
  }, []);

  const setNotes = useCallback((notes: string) => {
    setState((prev) => ({ ...prev, notes }));
  }, []);

  // Attach local video stream whenever ref or stream changes
  useEffect(() => {
    if (localVideoRef.current && state.localStream) {
      localVideoRef.current.srcObject = state.localStream;
    }
  }, [state.localStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Auto-request on mount
  useEffect(() => {
    requestPermissions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return {
    state,
    localVideoRef,
    remoteVideoRef,
    requestPermissions,
    switchDevice,
    proceedToWaitingRoom,
    joinCall,
    toggleMute,
    toggleCamera,
    endCall,
    reconnect,
    toggleFullscreen,
    toggleSidePanel,
    setActiveTab,
    setNotes,
    formatDuration,
  };
}
