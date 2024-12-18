'use client';

import Vapi from '@vapi-ai/web';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useScreenRecorder } from '@/hooks/useScreenRecording';

export function Interview() {
  const { startRecording, stopRecording } = useScreenRecorder({
    onFinishedRecording: useCallback((file: string) => {
      console.log('Recording File saved', file);
    }, []),
    onError: useCallback((error: string) => {
      console.error('Recording Error:', error);
    }, []),
  });
  const [interviewStarted, setInterviewStarted] = useState<boolean>(false);
  const [messages, setMessages] = useState<Array<{ role: 'assistant' | 'user'; content: string }>>(
    []
  );

  const vapiRef = useRef<Vapi | null>(null);

  const setupVapi = useCallback(() => {
    if (!vapiRef.current) {
      vapiRef.current = new Vapi('41ad01e1-d9e7-41ab-b6c6-91fef25b9d94');

      vapiRef.current.on('call-start', () => {
        setInterviewStarted(true);
      });

      vapiRef.current.on('call-end', () => {
        setInterviewStarted(false);
        stopRecording();
      });

      vapiRef.current.on('message', (message) => {
        console.log(`[VAPI MESSAGE] ${JSON.stringify(message, null, 2)}`);
        if (message.type === 'transcript') {
          const payload = message as {
            type: 'transcript';
            role: 'assistant' | 'user';
            transcriptType: 'final' | 'partial';
            transcript: string;
          };
        //   console.log(`[VAPI MESSAGE] [${payload.role}] ${payload.transcript}`);
          if (payload.transcriptType === 'final') {
            setMessages((prev) => [...prev, { role: payload.role, content: payload.transcript }]);
          }
        }
      });

      vapiRef.current.on('error', (error) => {
        console.log(`[VAPI ERROR] ${JSON.stringify(error, null, 2)}`);
      });
    }
  }, [stopRecording]);

  useEffect(() => {
    setupVapi();
  }, [setupVapi]);

  const startInterview = async () => {
    await startRecording();
    vapiRef.current?.start('eaf405ab-4af3-4679-afd9-4da4b528159c', {
      variableValues: {
        name: 'Farrukh',
      },
    });
  };

  const stopInterview = () => {
    vapiRef.current?.stop();
  };

  return (
    <div>
      {interviewStarted ? (
        <div>
          <Button onClick={stopInterview}>End Interview</Button>
        </div>
      ) : (
        <div>
          <Button onClick={startInterview}>Start Interview</Button>
        </div>
      )}
      <div className="space-y-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 rounded ${msg.role === 'assistant' ? 'bg-blue-100' : 'bg-gray-100'}`}
          >
            <strong>{msg.role === 'assistant' ? 'AI:' : 'You:'}</strong> {msg.content}
          </div>
        ))}
      </div>
    </div>
  );
}
