'use client';

import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useScreenRecorder } from '@/hooks/useScreenRecording';

const ScreenRecorder: React.FC = () => {
  const { isRecording, isProcessingRecording, startRecording, stopRecording } = useScreenRecorder({
    onFinishedRecording: useCallback((file: string) => {
      console.log('Recording File saved', file);
    }, []),
    onError: useCallback((error: string) => {
      console.error('Recording Error:', error);
    }, []),
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">WebSocket Screen Recorder</h1>
      {isRecording ? (
        <Button
          onClick={stopRecording}
          className="bg-red-500 hover:bg-red-600 text-white"
          disabled={isProcessingRecording}
        >
          Stop Recording
        </Button>
      ) : (
        <Button
          onClick={startRecording}
          className="bg-green-500 hover:bg-green-600 text-white"
          disabled={isProcessingRecording}
        >
          Start Recording
        </Button>
      )}
      {isProcessingRecording && <p className="mt-4">Processing Recording...</p>}
    </div>
  );
};

export default ScreenRecorder;
