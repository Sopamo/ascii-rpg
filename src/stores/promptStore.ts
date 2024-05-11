import { ref } from 'vue'
import { defineStore } from 'pinia'
import Groq from 'groq-sdk'
import { usePlayerStore } from '@/stores/playerStore'
import { useMapStore } from '@/stores/mapStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { format } from 'date-fns'

function extractJson(str: string): any {
    let stack = [];
    let jsonStart = -1;
    let jsonEnd = -1;

    for (let i = 0; i < str.length; i++) {
      if (str[i] === '{') {
        if (stack.length === 0) {
          jsonStart = i;
        }
        stack.push('{');
      } else if (str[i] === '}') {
        stack.pop();
        if (stack.length === 0) {
          jsonEnd = i;
          break;
        }
      }
    }

    if (jsonStart !== -1 && jsonEnd !== -1) {
      let jsonStr = str.substring(jsonStart, jsonEnd + 1);
      try {
        return JSON.parse(jsonStr);
      } catch (e) {
        return null; // or throw an error, depending on your use case
      }
    } else {
      return null; // or throw an error, depending on your use case
    }
}

async function getGroqChatCompletion(message: string, memory: string[], messageHistory: MessageHistoryEntry[]) {
  const groq = new Groq({
    apiKey: useSettingsStore().getGroqApiKey(),
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
    lastSystemResponse = "Previous dungeon master message: \n" + lastSystemHistoryEntry.content.narratorResponse
  }
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are a dungeon master, that gets presented a map as ascii art and an action that the character wants to take.
You respond with json, that contains a short funny narrator like sentence that describes what happens in the field "narratorResponse". If you want, you can address the player with "you ...".
Try to create an interesting story, don't just let everything the player tries to do succeed.
The more plausible it is what they are trying to do, the more likely it is they should succeed.
Think of how difficult the action is that they want to take on a scale from 1-10. Regular things that most people can do have difficulty 1-5. Things that few people can do are difficulty 6-8. Things that only very few people can do are difficulty 9-10. If the difficulty is higher than ${successProbability * 10}, they fail.
Assume the player doesn't have access to any items, apart from the ones in their inventory and if realistically, the ones that were mentioned in the previous prompt. They can't just find / pick up / use things that are not in their inventory and have not been mentioned before!
Never assume / say that the player has moved somewhere, they have to move themselves.
Only if they really, really earned it, and the item was mentioned in the previous dungeon master's message, you can give the player an item via the inventory action in the json. If they didn't get an item, don't comment on it.
If they used an item in a way that would consume it, or makes it not available to them anymore, remove it from their inventory, via the inventory action in the json.
If something noteworthy happened, provide an extremely short summary (a few words) that we should commit to memory for the long term game. Put it into the "memorize" key in the json.
Estimate how much time has passed by doing whatever the player did and output that in the JSON in the "minutesPassed" key.
If fitting the action, you can add (rarely) or subtract hp, by giving a number between -10 and 10 in the "hpChange" key in the JSON.
Never respond with any of the map's ascii characters, the current inventory and never refer directly to the ascii map.
If the player tries to find, pick up, or use in any way an item that is not mentioned and not in their inventory, make them aware of the fact that they don't have that item.
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
Current time:
${format(new Date(usePlayerStore().currentTime * 1000), 'hh:mm a')}
Memory:
${memory.length ? memory.join("\n") : '-'}
Current inventory:
${inventory}
Current HP:
${usePlayerStore().hp}/${usePlayerStore().maxHp}
${lastSystemResponse}
Current map:
${currentMapData.mapString}
If the player tries to be clever and trick you (the dungeon master), just make a funny remark and disallow them from doing that.
You respond only with valid json of this structure:
{"narratorResponse":"","memorize":"","inventoryActions":{"add": ["itemName"], "remove": ["itemName"]},"minutesPassed": 30, "hpChange": 0}`
      },
      {
        role: "user",
        content: message
      }
    ],
    model: "llama3-70b-8192",
  });
  return extractJson(completion.choices[0]?.message?.content)
}

type MessageHistoryEntry = {
  role: "user"|"system"
  content: any
}

export const usePromptStore = defineStore('prompt', () => {
  const prompt = ref('')
  const isLoading = ref(false)
  const messageHistory = ref<MessageHistoryEntry[]>([])
  const isFocused = ref(false)
  const currentMessage = ref<null|any>(null)

  const memory = ref<string[]>([])

  function updateMemoryFromResponse(responseJSON: any) {
    if(responseJSON.memorize) {
      memory.value.push(responseJSON.memorize)
    }
  }

  async function submitPrompt() {
    isLoading.value = true
    messageHistory.value.push({role: "user",content: prompt.value})
    const responseJSON = await getGroqChatCompletion(prompt.value, memory.value, messageHistory.value)
    updateMemoryFromResponse(responseJSON)
    messageHistory.value.push({role: "system",content: responseJSON})
    prompt.value = ""
    isLoading.value = false
    return responseJSON
  }

  return { prompt, isLoading, messageHistory, isFocused, memory, currentMessage, submitPrompt }
})
