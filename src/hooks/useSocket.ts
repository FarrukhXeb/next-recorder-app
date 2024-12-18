'use client';

import { SocketEvents } from '@/types';
import { useCallback, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketProps {
  onConnect?: () => void;
  onDisconnected?: () => void;
  onFinishedStreaming?: (file: string) => void;
  onError?: (error: string) => void;
}

export const useSocket = (props: UseSocketProps) => {
  const socketRef = useRef<Socket | null>(null);
  const callbacksRef = useRef(props);

  const connectSocket = useCallback(() => {
    if (!socketRef.current) {
      socketRef.current = io('http://localhost:3001');

      socketRef.current.on('connect', () => {
        callbacksRef.current.onConnect?.();
      });

      socketRef.current.on(SocketEvents.DISCONNECT, () => {
        callbacksRef.current.onDisconnected?.();
      });

      socketRef.current.on(SocketEvents.FINISHED_STREAMING, (file: string) => {
        socketRef.current?.emit(SocketEvents.LEAVE_RECORDING_SESSION);
        callbacksRef.current.onFinishedStreaming?.(file);
      });

      socketRef.current.on('error', (error: string) => {
        socketRef.current?.emit(SocketEvents.LEAVE_RECORDING_SESSION);
        callbacksRef.current.onError?.(error);
      });
    }
  }, []);

  useEffect(() => {
    connectSocket();
    return () => {
      if (socketRef?.current?.connected) {
        socketRef.current.disconnect();
      }
    };
  }, [connectSocket]);

  return socketRef;
};
