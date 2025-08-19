import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, Square, Pause, Play, RotateCcw } from 'lucide-react';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { cn } from '@/lib/utils';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  className?: string;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ 
  onRecordingComplete, 
  className 
}) => {
  const {
    isRecording,
    isPaused,
    recordingTime,
    audioBlob,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    error,
  } = useAudioRecording();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStop = () => {
    stopRecording();
  };

  React.useEffect(() => {
    if (audioBlob) {
      onRecordingComplete(audioBlob);
    }
  }, [audioBlob, onRecordingComplete]);

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Recording indicator */}
          <div className="flex items-center space-x-2">
            {isRecording && (
              <div className={cn(
                "w-3 h-3 rounded-full animate-pulse",
                isPaused ? "bg-yellow-500" : "bg-red-500"
              )} />
            )}
            <span className="text-2xl font-mono">
              {formatTime(recordingTime)}
            </span>
          </div>

          {/* Control buttons */}
          <div className="flex items-center space-x-2">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                size="lg"
                className="h-16 w-16 rounded-full"
                disabled={!!error}
              >
                <Mic className="h-6 w-6" />
              </Button>
            ) : (
              <>
                <Button
                  onClick={isPaused ? resumeRecording : pauseRecording}
                  size="lg"
                  variant="outline"
                  className="h-12 w-12 rounded-full"
                >
                  {isPaused ? (
                    <Play className="h-5 w-5" />
                  ) : (
                    <Pause className="h-5 w-5" />
                  )}
                </Button>

                <Button
                  onClick={handleStop}
                  size="lg"
                  variant="destructive"
                  className="h-16 w-16 rounded-full"
                >
                  <Square className="h-6 w-6" />
                </Button>
              </>
            )}

            {(audioBlob || recordingTime > 0) && (
              <Button
                onClick={resetRecording}
                size="lg"
                variant="outline"
                className="h-12 w-12 rounded-full"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Status messages */}
          {error && (
            <p className="text-sm text-destructive text-center">
              Error: {error}
            </p>
          )}

          {!isRecording && recordingTime === 0 && !error && (
            <p className="text-sm text-muted-foreground text-center">
              Haz clic en el micrófono para comenzar a grabar
            </p>
          )}

          {!isRecording && audioBlob && (
            <p className="text-sm text-green-600 text-center">
              ✓ Grabación completada ({formatTime(recordingTime)})
            </p>
          )}

          {isRecording && !isPaused && (
            <p className="text-sm text-red-600 text-center">
              🔴 Grabando... Habla con claridad
            </p>
          )}

          {isPaused && (
            <p className="text-sm text-yellow-600 text-center">
              ⏸️ Pausado - Presiona play para continuar
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};