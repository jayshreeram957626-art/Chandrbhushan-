
import React, { useState } from 'react';
import { generateSpeech, decodeAudio, decodeAudioData } from '../services/gemini';

interface ReadAloudButtonProps {
  text: string;
  className?: string;
}

const ReadAloudButton: React.FC<ReadAloudButtonProps> = ({ text, className }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(null);

  const handleReadAloud = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isSpeaking) {
      if (audioSource) {
        audioSource.stop();
        setAudioSource(null);
      }
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    try {
      const audioData = await generateSpeech(text);
      if (audioData) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const buffer = await decodeAudioData(decodeAudio(audioData), audioContext, 24000, 1);
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.onended = () => {
          setIsSpeaking(false);
          setAudioSource(null);
        };
        setAudioSource(source);
        source.start();
      } else {
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error("Speech generation failed", error);
      setIsSpeaking(false);
    }
  };

  return (
    <button
      onClick={handleReadAloud}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-90 ${
        isSpeaking 
          ? 'bg-rose-500 text-white animate-pulse' 
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      } ${className}`}
      title={isSpeaking ? "Stop Reading" : "Read Aloud"}
    >
      <span>{isSpeaking ? '⏹️ Stop' : '🔊 Read Aloud'}</span>
    </button>
  );
};

export default ReadAloudButton;
