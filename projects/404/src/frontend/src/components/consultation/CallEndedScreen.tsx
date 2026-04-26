import { CheckCircle2, Clock, Star, ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CallEndedScreenProps {
  callDuration: number;
  formatDuration: (s: number) => string;
  providerName?: string;
  onGoBack?: () => void;
}

export function CallEndedScreen({
  callDuration,
  formatDuration,
  providerName = "Dr. Sarah Mitchell",
  onGoBack,
}: CallEndedScreenProps) {
  return (
    <div className="consultation-bg min-h-screen flex items-center justify-center p-6">
      <div className="consultation-card max-w-md w-full text-center space-y-8">
        {/* Success icon */}
        <div className="flex justify-center">
          <div className="consultation-icon-ring consultation-icon-ring--success">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-white">Consultation Complete</h1>
          <p className="text-slate-400 text-sm">
            Your session with {providerName} has ended.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="consultation-info-card text-center">
            <Clock className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-lg font-mono font-bold text-white">{formatDuration(callDuration)}</p>
            <p className="text-xs text-slate-500 mt-0.5">Duration</p>
          </div>
          <div className="consultation-info-card text-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">Secure</p>
            <p className="text-xs text-slate-500 mt-0.5">E2E Encrypted</p>
          </div>
        </div>

        {/* Rating */}
        <div className="space-y-3">
          <p className="text-sm text-slate-400">How was your experience?</p>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                id={`rating-star-${star}`}
                className="text-slate-700 hover:text-amber-400 transition-colors focus:outline-none"
              >
                <Star className="w-7 h-7 fill-current" />
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            className="consultation-btn-primary w-full"
            id="download-summary-btn"
            onClick={() => {}}
          >
            <Download className="w-4 h-4 mr-2" />
            Download Summary
          </Button>
          <button
            onClick={onGoBack}
            id="go-back-btn"
            className="consultation-btn-ghost w-full inline-flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
