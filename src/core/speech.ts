import { SpeechError } from '../lib/errors.js';

// STT provider is TBD pending Azerbaijani benchmark (Google Cloud Speech vs Whisper vs ElevenLabs).
// For now we use OpenAI Whisper as it has the broadest language coverage.

import OpenAI from 'openai';
import { Readable } from 'stream';

const openai = new OpenAI({ apiKey: process.env['OPENAI_API_KEY'] });

export async function transcribeAudio(audioBuffer: Buffer, mimeType = 'audio/ogg'): Promise<string> {
  try {
    const stream = Readable.from(audioBuffer) as NodeJS.ReadableStream & { name?: string };
    // Whisper needs a filename with extension for format detection
    const file = new File([audioBuffer], 'voice.ogg', { type: mimeType });

    const response = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language: 'az',
    });

    return response.text;
  } catch (err) {
    throw new SpeechError('stt', err);
  }
}

// TTS is TBD — ElevenLabs only if Azerbaijani quality is acceptable.
// Placeholder until benchmark is done.
export async function synthesizeSpeech(_text: string): Promise<Buffer> {
  throw new SpeechError('tts', 'TTS provider not yet configured — pending ElevenLabs benchmark');
}
