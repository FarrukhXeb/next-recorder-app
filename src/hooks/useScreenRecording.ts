'use client';

import { useState, useRef, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { SocketEvents } from '@/types';

interface UseScreenRecorderProps {
  onFinishedRecording?: (file: string) => void;
  onError?: (error: string) => void;
}

export const useScreenRecorder = ({ onFinishedRecording, onError }: UseScreenRecorderProps) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isProcessingRecording, setIsProcessingRecording] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastChunkRef = useRef<Blob | null>(null); // The reason for setting the last chunk is that every time we stop the recording the last chunk is left out

  const socketRef = useSocket({
    onConnect: useCallback(() => {
      console.log('Call recorder connected to socket server');
    }, []),
    onDisconnected: useCallback(() => {
      console.log('Call recorder disconnected from socket server');
    }, []),
    onFinishedStreaming: useCallback(
      (file: string) => {
        setIsProcessingRecording(false);
        onFinishedRecording?.(file);
      },
      [onFinishedRecording]
    ),
    onError: useCallback(
      (error: string) => {
        if (mediaRecorderRef.current && streamRef.current) {
          setIsRecording(false);
          mediaRecorderRef.current?.stop();
          streamRef.current.getTracks().forEach((track) => track.stop());
          mediaRecorderRef.current = null;
          streamRef.current = null;
        }
        onError?.(error);
      },
      [onError]
    ),
  });

  const startRecording = async () => {
    try {
      socketRef.current?.emit(SocketEvents.JOIN_RECORDING_SESSION, Date.now().toString());
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const combinedStream = new MediaStream([
        ...screenStream.getVideoTracks(),
        ...audioStream.getAudioTracks(),
      ]);

      streamRef.current = combinedStream;

      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm; codecs=vp9,opus',
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = handleDataAvailable;
      mediaRecorder.onstop = handleRecorderStop;
      mediaRecorder.start(1000); // Collect data every second

      setIsRecording(true);
    } catch (error: unknown) {
      console.error('Error starting recording:', error);
      onError?.((error as string) ?? 'Error starting recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && socketRef.current && streamRef.current) {
      mediaRecorderRef.current?.stop();
      streamRef.current.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const handleDataAvailable = (event: BlobEvent) => {
    if (event.data.size > 0 && socketRef.current) {
      lastChunkRef.current = event.data;
      socketRef.current.emit(SocketEvents.STREAM_VIDEO, {
        chunk: event.data,
        isLastChunk: false,
      });
    }
  };

  const handleRecorderStop = () => {
    if (lastChunkRef.current && socketRef.current) {
      socketRef.current.emit(SocketEvents.STREAM_VIDEO, {
        chunk: lastChunkRef.current,
        isLastChunk: true,
      });
    }
    setIsProcessingRecording(true);
  };

  return {
    isRecording,
    isProcessingRecording,
    startRecording,
    stopRecording,
  };
};
