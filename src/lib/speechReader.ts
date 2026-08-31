/**
 * Robust Multi-Browser Hindi & Indian English Text-to-Speech Engine
 * 
 * Features:
 * 1. Automatic sentence boundary chunking (prevents Chrome/Safari 15s/200-char silent speech dropouts).
 * 2. Active speech heartbeat to prevent Chromium speech garbage collection timeout.
 * 3. Dynamic Hindi / Indian voice detection with asynchronous voice-list resolution.
 * 4. Full control lifecycle: Play, Pause, Resume, Stop, and Playback Speed (0.75x, 1.0x, 1.25x, 1.5x).
 * 5. Clean text extraction: Strips markdown, HTML tags, URLs, and noisy punctuation for clear Devanagari pronunciation.
 */

export type SpeechState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export interface SpeechReaderOptions {
  rate?: number; // 0.5 to 2.0 (default: 0.95)
  pitch?: number; // 0.8 to 1.2 (default: 1.0)
  onStateChange?: (state: SpeechState) => void;
  onProgress?: (progressPercent: number, currentChunk: number, totalChunks: number, chunkText: string) => void;
  onError?: (errorMessage: string) => void;
}

export class NewsSpeechReader {
  private chunks: string[] = [];
  private currentChunkIndex: number = 0;
  private state: SpeechState = 'idle';
  private rate: number = 0.95;
  private pitch: number = 1.0;
  private heartbeatTimer: any = null;
  private voice: SpeechSynthesisVoice | null = null;
  private onStateChange?: (state: SpeechState) => void;
  private onProgress?: (progressPercent: number, currentChunk: number, totalChunks: number, chunkText: string) => void;
  private onError?: (errorMessage: string) => void;
  private audioElement: HTMLAudioElement | null = null;

  constructor(options?: SpeechReaderOptions) {
    if (options?.rate) this.rate = options.rate;
    if (options?.pitch) this.pitch = options.pitch;
    this.onStateChange = options?.onStateChange;
    this.onProgress = options?.onProgress;
    this.onError = options?.onError;

    this.initVoice();
  }

  private setState(newState: SpeechState): void {
    this.state = newState;
    if (this.onStateChange) {
      try {
        this.onStateChange(newState);
      } catch (err) {
        console.error('[SpeechReader] state change callback error:', err);
      }
    }
  }

  public getState(): SpeechState {
    return this.state;
  }

  public setRate(rate: number): void {
    this.rate = Math.max(0.5, Math.min(2.0, rate));
  }

  public getRate(): number {
    return this.rate;
  }

  private initVoice(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const selectVoice = () => {
      try {
        const voices = window.speechSynthesis.getVoices();
        if (!voices || voices.length === 0) return;

        // 1. First priority: Exact Hindi voice (e.g., hi-IN, hi_IN, Google हिन्दी)
        const hindiVoice = voices.find(
          v => v.lang.toLowerCase().startsWith('hi') || v.name.toLowerCase().includes('hindi') || v.name.includes('हिन्दी')
        );

        if (hindiVoice) {
          this.voice = hindiVoice;
          return;
        }

        // 2. Second priority: Indian English / South Asian accent voice (en-IN)
        const indianEngVoice = voices.find(v => v.lang.toLowerCase().includes('en-in') || v.lang.toLowerCase().includes('en_in'));
        if (indianEngVoice) {
          this.voice = indianEngVoice;
          return;
        }

        // 3. Fallback: default browser voice
        const defaultVoice = voices.find(v => v.default) || voices[0];
        if (defaultVoice) {
          this.voice = defaultVoice;
        }
      } catch {}
    };

    selectVoice();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = selectVoice;
    }
  }

  /**
   * Cleans text for speech synthesis, stripping URLs, HTML, Markdown tokens
   */
  public cleanTextForSpeech(text: string): string {
    if (!text) return '';

    return text
      // Remove URLs (https://... or http://...)
      .replace(/https?:\/\/[^\s]+/g, '')
      // Remove HTML tags
      .replace(/<[^>]*>/g, '')
      // Remove markdown bold/italic/links/headings
      .replace(/[*#_`~[\]()]/g, ' ')
      // Normalize punctuation
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Splits long Hindi text into small natural sentences/chunks (<150 chars)
   */
  private splitIntoChunks(text: string): string[] {
    const cleaned = this.cleanTextForSpeech(text);
    if (!cleaned) return [];

    // Split on Devanagari full stop (।), Latin periods (.), question marks, exclamation marks, and newlines
    const rawSentences = cleaned
      .split(/([।\.!\?\n]+)/)
      .map(s => s.trim())
      .filter(Boolean);

    const chunks: string[] = [];
    let currentBuffer = '';

    for (let i = 0; i < rawSentences.length; i++) {
      const seg = rawSentences[i];
      if (/^[।\.!\?\n]+$/.test(seg)) {
        currentBuffer += seg + ' ';
        if (currentBuffer.trim().length > 40) {
          chunks.push(currentBuffer.trim());
          currentBuffer = '';
        }
      } else {
        if ((currentBuffer + ' ' + seg).length > 140) {
          if (currentBuffer.trim()) chunks.push(currentBuffer.trim());
          currentBuffer = seg;
        } else {
          currentBuffer = currentBuffer ? `${currentBuffer} ${seg}` : seg;
        }
      }
    }

    if (currentBuffer.trim()) {
      chunks.push(currentBuffer.trim());
    }

    // Secondary pass for any abnormally long single sentence without punctuation
    const refinedChunks: string[] = [];
    for (const ch of chunks) {
      if (ch.length > 180) {
        const words = ch.split(/\s+/);
        let temp = '';
        for (const w of words) {
          if ((temp + ' ' + w).length > 140) {
            refinedChunks.push(temp.trim());
            temp = w;
          } else {
            temp = temp ? `${temp} ${w}` : w;
          }
        }
        if (temp.trim()) refinedChunks.push(temp.trim());
      } else {
        refinedChunks.push(ch);
      }
    }

    return refinedChunks.filter(c => c.length > 0);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    // Keep-alive heartbeat for Chrome / Safari speech synthesis
    this.heartbeatTimer = setInterval(() => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          try {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          } catch {}
        }
      }
    }, 6000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Starts speaking an article or provided text
   */
  public async speak(params: {
    title: string;
    summary?: string;
    content: string;
    audioUrl?: string;
  }): Promise<void> {
    this.stop();

    // 1. If audio file URL is explicitly provided, play using HTMLAudioElement
    if (params.audioUrl && (params.audioUrl.startsWith('http') || params.audioUrl.startsWith('data:audio'))) {
      try {
        this.setState('loading');
        this.audioElement = new Audio(params.audioUrl);
        this.audioElement.onplaying = () => this.setState('playing');
        this.audioElement.onpause = () => {
          if (this.state === 'playing') this.setState('paused');
        };
        this.audioElement.onended = () => {
          this.setState('idle');
          this.audioElement = null;
        };
        this.audioElement.onerror = () => {
          console.warn('[SpeechReader] Audio URL playback failed, falling back to Web Speech synthesis');
          this.audioElement = null;
          this.speakText(params);
        };
        await this.audioElement.play();
        return;
      } catch (e) {
        console.warn('[SpeechReader] Audio element failed, falling back:', e);
        this.audioElement = null;
      }
    }

    // 2. Synthesize text using SpeechSynthesis
    this.speakText(params);
  }

  private speakText(params: { title: string; summary?: string; content: string }): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (this.onError) this.onError('आपके ब्राउज़र में आवाज़ (Speech Synthesis) की सुविधा उपलब्ध नहीं है।');
      this.setState('error');
      return;
    }

    const titlePrefix = `त्रिकाल दर्शन समाचार। ${params.title}।`;
    const summaryPart = params.summary && params.summary.trim() ? `${params.summary}। ` : '';
    const fullText = `${titlePrefix} ${summaryPart} ${params.content}`;

    this.chunks = this.splitIntoChunks(fullText);
    if (this.chunks.length === 0) {
      this.setState('idle');
      return;
    }

    this.currentChunkIndex = 0;
    this.initVoice();
    this.startHeartbeat();
    this.speakCurrentChunk();
  }

  private speakCurrentChunk(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (this.currentChunkIndex >= this.chunks.length) {
      this.stop();
      return;
    }

    const chunkText = this.chunks[this.currentChunkIndex];
    const total = this.chunks.length;
    const progress = Math.round(((this.currentChunkIndex + 1) / total) * 100);

    if (this.onProgress) {
      try {
        this.onProgress(progress, this.currentChunkIndex + 1, total, chunkText);
      } catch {}
    }

    try {
      window.speechSynthesis.cancel(); // Cancel any prior utterance

      const utterance = new SpeechSynthesisUtterance(chunkText);
      utterance.rate = this.rate;
      utterance.pitch = this.pitch;
      utterance.lang = 'hi-IN';

      if (this.voice) {
        utterance.voice = this.voice;
      }

      utterance.onstart = () => {
        this.setState('playing');
      };

      utterance.onend = () => {
        if (this.state === 'playing') {
          this.currentChunkIndex++;
          this.speakCurrentChunk();
        }
      };

      utterance.onerror = (e) => {
        // Some browsers trigger error 'interrupted' or 'canceled' when user stops
        if (e.error === 'interrupted' || e.error === 'canceled') {
          return;
        }
        console.warn('[SpeechReader] Chunk utterance error:', e.error);
        // Advance to next chunk gracefully
        this.currentChunkIndex++;
        if (this.currentChunkIndex < this.chunks.length && this.state === 'playing') {
          this.speakCurrentChunk();
        } else {
          this.stop();
        }
      };

      window.speechSynthesis.speak(utterance);
      this.setState('playing');
    } catch (err: any) {
      console.error('[SpeechReader] speakCurrentChunk exception:', err);
      this.stop();
    }
  }

  public pause(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.setState('paused');
      return;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        this.setState('paused');
      }
    }
  }

  public resume(): void {
    if (this.audioElement) {
      this.audioElement.play();
      this.setState('playing');
      return;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        this.setState('playing');
      } else if (this.state === 'paused') {
        // Re-speak from current chunk index
        this.speakCurrentChunk();
      }
    }
  }

  public stop(): void {
    this.stopHeartbeat();

    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      } catch {}
      this.audioElement = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }

    this.currentChunkIndex = 0;
    this.chunks = [];
    this.setState('idle');
  }
}
