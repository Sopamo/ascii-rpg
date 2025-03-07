import { useSettingsStore } from '@/stores/settingsStore'
import { usePromptStore } from '@/stores/promptStore'

let previousUrl: string|null = null

const url = "https://api.deepgram.com/v1/speak?model=";

export const speakDeepgram = async (text: string) => {
  const headers = {
    Authorization: `Token ${useSettingsStore().getDeepgramApiKey()}`,
    "Content-Type": "application/json",
  };
  const modelSpecificUrl = url + getDeepgramVoiceModel()
  const data = JSON.stringify({
    text,
  });
  fetch(modelSpecificUrl, {
    method: "POST",
    headers,
    body: data,
  })
    .then(response => response.blob())
    .then(blob => {
      const audio = document.createElement("audio");
      audio.src = URL.createObjectURL(blob);
      previousUrl = audio.src
      audio.play();
    })
    .catch(error => console.error("Error:", error));
  if(previousUrl) {
    window.URL.revokeObjectURL(previousUrl);
  }
};

function getDeepgramVoiceModel() {
  switch (usePromptStore().talkingTo) {
    case "oldLady":
      return 'aura-athena-en'
    case "mischievousCat":
      return 'aura-angus-en'
    default:
      return 'aura-arcas-en'
  }
}


const settingsStore = useSettingsStore()
class GoogleCloudTTS {
  constructor() {
    this.apiKey = settingsStore.getGoogleCloudApiKey();
    this.baseUrl = 'https://texttospeech.googleapis.com/v1/text:synthesize';
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  async synthesizeAndPlay(text) {
    try {
      // Prepare the request payload
      const payload = {
        input: {
          text: text
        },
        voice: {
          languageCode: 'en-GB',
          name: getGoogleVoiceModel(),  // Using Journey voice
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.0,
          pitch: 0.0
        }
      };

      // Make the API request
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Convert base64 audio content to ArrayBuffer
      const audioContent = data.audioContent;
      const binaryString = window.atob(audioContent);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);

      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Decode the audio data and play it
      console.log(this.audioContext)
      const audioBuffer = await this.audioContext.decodeAudioData(bytes.buffer);
      await this.playAudioBuffer(audioBuffer);
    } catch (error) {
      console.error('Error synthesizing speech:', error);
      throw error;
    }
  }


  async playAudioBuffer(audioBuffer) {
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);
    source.start(0);

    return new Promise(resolve => {
      source.onended = resolve;
    });
  }
}

export const speakGoogle = async (text: string) => {
  const tts = new GoogleCloudTTS();
  tts.synthesizeAndPlay(text);
}

function getGoogleVoiceModel() {
  switch (usePromptStore().talkingTo) {
    case "oldLady":
      return 'en-GB-Journey-F'
    case "mischievousCat":
      return 'en-GB-Journey-D'
    default:
      return 'en-GB-Wavenet-C'
  }
}
