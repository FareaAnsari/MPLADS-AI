// ElevenLabs High-Fidelity Official Audio Briefing Service
// Generates official voiceover briefings for executive evaluators and citizens

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
// Voice: "Rachel" (calm, formal, authoritative news/government tone)
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; 

class ElevenLabsAudioService {
  private currentAudio: HTMLAudioElement | null = null;
  private audioCache: Map<string, string> = new Map();

  async speakText(text: string, onEnded?: () => void): Promise<HTMLAudioElement | null> {
    // Stop currently playing audio if any
    this.stop();

    const cleanText = text.trim();
    if (!cleanText) return null;

    try {
      let audioUrl = this.audioCache.get(cleanText);

      if (!audioUrl) {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${DEFAULT_VOICE_ID}`, {
          method: 'POST',
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg'
          },
          body: JSON.stringify({
            text: cleanText,
            model_id: 'eleven_turbo_v2',
            voice_settings: {
              stability: 0.75,
              similarity_boost: 0.85
            }
          })
        });

        if (!response.ok) {
          throw new Error(`ElevenLabs TTS returned HTTP ${response.status}`);
        }

        const blob = await response.blob();
        audioUrl = URL.createObjectURL(blob);
        this.audioCache.set(cleanText, audioUrl);
      }

      const audio = new Audio(audioUrl);
      this.currentAudio = audio;

      if (onEnded) {
        audio.addEventListener('ended', onEnded);
      }

      await audio.play();
      return audio;
    } catch (err) {
      console.warn('ElevenLabs API unavailable, falling back to Web Speech Synthesis:', err);
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        if (onEnded) {
          utterance.onend = onEnded;
        }
        window.speechSynthesis.speak(utterance);
      }
      return null;
    }
  }

  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  isPlaying(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }
}

export const elevenLabsService = new ElevenLabsAudioService();
