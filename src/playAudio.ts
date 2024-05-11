import { useSettingsStore } from '@/stores/settingsStore'

let previousUrl: string|null = null

const url = "https://api.deepgram.com/v1/speak?model=aura-arcas-en";

export const speak = async (text: string) => {
  const headers = {
    Authorization: `Token ${useSettingsStore().getDeepgramApiKey()}`,
    "Content-Type": "application/json",
  };
  const data = JSON.stringify({
    text,
  });
  fetch(url, {
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
