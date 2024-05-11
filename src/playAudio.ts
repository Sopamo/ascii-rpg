import { useSettingsStore } from '@/stores/settingsStore'
import { usePromptStore } from '@/stores/promptStore'

let previousUrl: string|null = null

const url = "https://api.deepgram.com/v1/speak?model=";

export const speak = async (text: string) => {
  const headers = {
    Authorization: `Token ${useSettingsStore().getDeepgramApiKey()}`,
    "Content-Type": "application/json",
  };
  const modelSpecificUrl = url + getVoiceModel()
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

function getVoiceModel() {
  switch (usePromptStore().talkingTo) {
    case "oldLady":
      return 'aura-athena-en'
    case "mischievousCat":
      return 'aura-angus-en'
    default:
      return 'aura-arcas-en'
  }
}
