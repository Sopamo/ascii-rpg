import { ref } from 'vue'
import { defineStore } from 'pinia'
import Groq from 'groq-sdk'
import { usePlayerStore } from '@/stores/playerStore'
import { useMapStore } from '@/stores/mapStore'

async function getGroqChatCompletion(message: string, memory: string[], messageHistory: MessageHistoryEntry[]) {
  const groq = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true,
  });
  const inventory = usePlayerStore().inventoryString
  const currentMapData = useMapStore().getCurrentMapData()
  let successProbability = Math.round(Math.random() * 7) / 10
  if (Math.random() >= 0.95) {
    successProbability = 1
  }
  console.log({successProbability})
  let lastSystemResponse = ''
  const lastSystemHistoryEntry = [...messageHistory].reverse().find(entry => entry.role==='system')
  if(lastSystemHistoryEntry) {
    lastSystemResponse = "Last game master response: \n" + lastSystemHistoryEntry.content
  }
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are an rpg game master, that gets presented a map as ascii art and an action that the character wants to take.
You respond with a short funny narrator like sentence that describes what happens. If you want, you can address the player with "you ...".
You can use xml tags (described below) to do special things.
Try to create an interesting story, don't just let everything the player tries to do succeed. The more plausible it is what they are trying to do, the more likely it is they should succeed. Generally, their success probability is: ${successProbability}
Assume the player has no items apart from the ones in their inventory.
Never assume / say that the player has moved somewhere, they have to move themselves.
If they really, really earned it, you can also give the player an item. Do so like this: <give-item>itemname</give-item>. If they didn't get an item, don't comment on it.
If they used an item in a way that would remove it from their inventory / destroy it, add <remove-item>itemname</remove-item> to the response.
If something noteworthy happened, provide an extremely short summary (few words) after the response that we should commit to memory for the long term game, like this: <memory>summary of user&system message</memory>
Never respond with any of the map's ascii characters, the current inventory and never refer directly to the ascii map.
The ascii map is made out of these things:
. is the default, empty floor
: is impassable terrain
# is a wall
~ is water
| is a column, pole or tree trunk
^ is a tree
" is a bush or foliage of some sort
+ is a closed door
= is a table
x is the player
${currentMapData.specialThings.join("\n")}
Memory:
${memory.length ? memory.join("\n") : '-'}
Current inventory:
${inventory}
${lastSystemResponse}
Current map:
${currentMapData.mapString}`
      },
      {
        role: "user",
        content: message
      }
    ],
    model: "llama3-70b-8192",
  });
  return completion.choices[0]?.message?.content
}

type MessageHistoryEntry = {
  role: "user"|"system"
  content: string
}

export const usePromptStore = defineStore('prompt', () => {
  const prompt = ref('')
  const isLoading = ref(false)
  const messageHistory = ref<MessageHistoryEntry[]>([])
  const isFocused = ref(false)

  const memory = ref<string[]>([])

  function updateMemoryFromResponse(str: string) {
    const regex = /<memory>(.*?)<\/memory>/gi;
    const matches = str.match(regex);

    if (matches) {
      for (const match of matches) {
        const memoryEntry = match.toLowerCase().replace(/<memory>(.*?)<\/memory>/, '$1');
        memory.value.push(memoryEntry);
      }
    }
    return str.replace(regex, '')
  }

  async function submitPrompt() {
    isLoading.value = true
    messageHistory.value.push({role: "user",content: prompt.value})
    let response = await getGroqChatCompletion(prompt.value, memory.value, messageHistory.value)
    response = updateMemoryFromResponse(response)
    messageHistory.value.push({role: "system",content: response})
    prompt.value = ""
    isLoading.value = false
    return response
  }

  return { prompt, isLoading, messageHistory, isFocused, memory, submitPrompt }
})
