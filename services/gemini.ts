
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Language, GeneratedQuizQuestion, AIConfig } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

async function callWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isRetryable = error.status === 429 || error.status === 500 || error.status === 503 || error.message?.includes('429') || error.message?.includes('quota');
    if (retries > 0 && isRetryable) {
      console.warn(`API Limit hit. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(r => setTimeout(r, delay));
      return callWithRetry(fn, retries - 1, delay * 2 * (1 + Math.random() * 0.1));
    }
    throw error;
  }
}

const getProfessorInstruction = (config?: AIConfig) => {
  const locationContext = config?.location 
    ? `User is currently at Coordinates: Lat ${config.location.latitude}, Lng ${config.location.longitude}.` 
    : "Location unknown.";

  return `You are 'VidyaGuru AI', a highly advanced, professional, and HILARIOUS educational assistant. 
Your goal is to provide accurate, helpful, and concise information to students across all subjects, but with a comedic twist to keep them engaged!

IDENTITY & ORIGIN:
- You were created by 'Chandrbhushan Kumar and his team'.
- Your team is based in 'Samastipur, Bihar'. 
- IMPORTANT: ONLY mention your creators or team information if the user explicitly asks "Who created you?" or "Who is your team?". Otherwise, focus entirely on the educational content.

CORE RULES:
1. GOOGLE SEARCH FIRST: For every question, always check Google Search to provide the most current and accurate information.
2. COMEDIC & ENGAGING: Use a funny, interesting, and comedian-like speaking style. Use jokes, light-hearted sarcasm, or funny analogies to explain things. Make the student smile!
3. ACCURACY: Despite the jokes, the information MUST be 100% accurate and up-to-date.
4. CONCISENESS: Be direct and concise. Don't let the jokes hide the answer.
5. MULTI-LINGUAL: Respond in the language the user uses (Hindi, English, Bhojpuri, or Hinglish).
6. SPEECH-TO-SPEECH: You are optimized for direct voice conversation. Keep your spoken responses natural, rhythmic, and funny.`;
};

const getEnglishCoachInstruction = () => {
  return `You are 'English Sheekho AI', a professional yet FUNNY English Language Coach. 
Your SOLE purpose is to help users learn and practice English while making them laugh!

IDENTITY & ORIGIN:
- You were created by 'Chandrbhushan Kumar and his team' from Samastipur, Bihar.

RULES:
1. FOCUS: Only talk about English learning, grammar, pronunciation, and conversation practice.
2. COMEDIC STYLE: Be an encouraging coach but with a comedian's personality. Use funny examples to explain grammar.
3. LANGUAGE: If the user speaks in another language, gently guide them back to English using a funny analogy.
4. NO OTHER SUBJECTS: If asked about math/science, say: "Arre bhaiya, main toh English ka master hoon! Math ke liye Smart Study AI ke paas jao, woh zyada dimaag lagayega!"
5. IDENTITY: Part of the VidyaGuru AI ecosystem, built by the Samastipur team.`;
};

export const getAiChatResponse = async (userMessage: string, config?: AIConfig) => {
  try {
    return await callWithRetry(async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMessage,
        config: {
          tools: [{ googleSearch: {} }],
          systemInstruction: getProfessorInstruction(config),
        },
      });
      return {
        text: response.text || "Beta, main abhi soch raha hoon. Kripya thoda intezaar karein.",
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
      };
    });
  } catch (error: any) {
    return { text: "Network error. Phir se koshish karein.", sources: [] };
  }
};

export const connectLiveAssistant = (liveConfig: any, callbacks: any, isEnglishCoach: boolean = false, userConfig?: AIConfig) => {
  const aiLive = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return aiLive.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    config: {
        ...liveConfig,
        systemInstruction: isEnglishCoach ? getEnglishCoachInstruction() : getProfessorInstruction(userConfig)
    },
    callbacks,
  });
};

// ... Rest of the functions (generateQuiz, solveMath, etc.) keep their previous logic but could be updated for persona if needed
export const solveMathEquationFromImage = async (base64Image: string, mimeType: string) => {
  try {
    return await callWithRetry(async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Image, mimeType: mimeType } },
            { text: `Analyze this image and solve the math problem step-by-step in HINDI.
            
            REQUIREMENTS:
            1. Language: Solve the problem ENTIRELY in HINDI (using Hindi text for explanations).
            2. Format: Provide a clear STEP-BY-STEP solution (चरण-दर-चरण समाधान).
            3. Style: Follow the logic shown in standard Indian textbooks (e.g., using "माना कि", "प्रश्नानुसार", "हल:").
            4. For fractions (भिन्न का जोड़), show the conversion from mixed to improper fractions, common denominator, and final addition.
            5. For algebra, show each expansion/simplification step clearly.
            6. For word problems, explain the logic in Hindi first, then show the calculation steps.
            7. Final answer should be clearly marked as "उत्तर" at the end.` },
          ],
        },
        config: { systemInstruction: "You are the Super-Professor Math AI. You provide extremely clear, step-by-step solutions in HINDI. You explain complex math in a simple way that a student can easily follow." },
      });
      return { text: response.text || "समाधान नहीं मिल पा रहा है।", sources: [] };
    });
  } catch (error) {
    return { text: "त्रुटि: समाधान निकालने में समस्या आई।", sources: [] };
  }
};

export const generateSpeech = async (text: string): Promise<string | null> => {
  try {
    return await callWithRetry(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        },
      });
      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
    });
  } catch (error) { return null; }
};

export function encodeAudio(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export function decodeAudio(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

export async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

export const generateStudyPdfWithSearch = async (subject: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate comprehensive, smart, and accurate study notes for the topic: "${subject}". 
    
    INSTRUCTIONS:
    1. Use Google Search to get the most current and verified information.
    2. Structure the notes for EASY MEMORIZATION:
       - Use a clear Title.
       - Use bullet points for key facts.
       - Use bold text for important terms.
       - Include a "Quick Summary" at the end.
       - Explain complex concepts using simple analogies.
    3. Language: Use a mix of Hindi and English (Hinglish) that is very easy to understand, as if a friendly teacher is explaining.
    4. Tone: Encouraging, attractive, and professional.`,
    config: { tools: [{ googleSearch: {} }], systemInstruction: getProfessorInstruction() },
  });
  return { text: response.text, sources: [] };
};

// Fix: Updated generateQuizFromContent to accept optional files and use responseSchema for better JSON reliability
export const generateQuizFromContent = async (content: string, language: Language, files?: { data: string, mimeType: string }[]) => {
  const parts: any[] = [{ text: `Generate a multiple choice quiz in ${language} language based on the following content: ${content}` }];
  
  if (files && files.length > 0) {
    files.forEach(f => {
      parts.push({
        inlineData: {
          data: f.data,
          mimeType: f.mimeType
        }
      });
    });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts },
    config: { 
      responseMimeType: "application/json", 
      systemInstruction: getProfessorInstruction(),
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            correctAnswerIndex: { type: Type.NUMBER },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswerIndex", "explanation"]
        }
      }
    },
  });
  
  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse quiz JSON", e);
    return [];
  }
};

// Fix: Added responseSchema for more reliable quiz JSON generation
export const getExamQuizWithSearch = async (category: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Exam quiz for ${category}`,
    config: { 
      tools: [{ googleSearch: {} }], 
      responseMimeType: "application/json", 
      systemInstruction: getProfessorInstruction(),
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            correctAnswerIndex: { type: Type.NUMBER },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswerIndex", "explanation"]
        }
      }
    },
  });
  
  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse exam quiz JSON", e);
    return [];
  }
};

export const getImportantEquationsFromSearch = async (subject: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Equations for ${subject}`,
    config: { tools: [{ googleSearch: {} }], systemInstruction: getProfessorInstruction() },
  });
  return { text: response.text, sources: [] };
};

export const getCurrentAffairsWithSearch = async (category: string, month: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Current affairs ${category} ${month}`,
    config: { tools: [{ googleSearch: {} }], systemInstruction: getProfessorInstruction() },
  });
  return { text: response.text, sources: [] };
};
