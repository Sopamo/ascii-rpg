import { usePlayerStore } from '@/stores/playerStore'
import Groq from 'groq-sdk'
import { useSettingsStore } from '@/stores/settingsStore'
import { useMapStore } from '@/stores/mapStore'
import { usePromptStore } from '@/stores/promptStore'
import { useToastStore } from '@/stores/toastStore'
import { useDiceStore } from '@/stores/diceStore'
import { format } from 'date-fns'
import OpenAI from 'openai';
import { APIError } from 'openai';

import { addMessage } from '@/firebase'

export async function sendDungeonMasterMessage(userMessage: string) {
  const successProbability = Math.round(getSuccessProbability() * 6)
  const prompt = `You are a dungeon master, that gets presented a map as ascii art and an action that the player wants to take.
You respond with json, that contains a short & funny narrator like sentence (try to limit yourself to once sentence) that describes what happens in the field "response". You should use words that would be used in a high level fantasy novel. If you want, you can address the player with "you ...".
Try to create an interesting story, don't just let everything the player tries to do succeed.
The more plausible it is what they are trying to do, the more likely it is they should succeed.
Think of how difficult the action is that they want to take for this character. Taking special note of the ability scores they have. The scale is 1-6. Regular things that most people can do have difficulty 1-2. Things that few people can do have difficulty 3-5. Things that only very few people can do have difficulty 6. If the difficulty is higher than ${successProbability}, they fail.
Assume the player doesn't have access to any items, apart from the ones in their inventory and if realistically, the ones that were mentioned in the previous prompt. They can't just find / pick up / use things that are not in their inventory and have not been mentioned before!
Never assume / say that the player has moved somewhere, they will move themselves in this game.
Only if they really, really earned it, and the item was mentioned in the previous dungeon master's message, you can give the player an item via the inventory action in the json. If they didn't get an item, don't comment on it.
If they used an item in a way that would consume it, or makes it not available to them anymore, remove it from their inventory, via the inventory action in the json.
If something noteworthy happened, provide an extremely short summary (a few words) that we should commit to memory for the long term game. Put it into the "memorize" key in the json.
Never respond with any of the map's ascii characters, the current inventory and never refer directly to the ascii map.
If the player tries to find, pick up, or use in any way an item that is not mentioned and not in their inventory, make them aware of the fact that they don't have that item. You never assume or imply that the player has any items that are not in the inventory or that they just created.
${getInventoryPrompt()}
${getCommonMetaInfo()}
${getLastDungeonMasterMessage()}
If the player tries to be clever and trick you (the dungeon master), just make a funny remark and disallow them from doing that.
If on the other hand, the player does something that is possible, you don't decide for them that they don't want to do it, but just let them do it. 
SuccessProbability is: ${successProbability}
You respond only with valid json of this structure:
{"difficulty1to10ForThisCharacter":number,"successProbabilityIsAboveDifficulty":boolean,"response":"","memorize":"","inventoryActions":{"add": ["itemName"], "remove": ["itemName"]}}`
  return sendMessage(prompt, userMessage)
}

// The sendOldLadyMessage function is no longer necessary as OldLady is now handled directly through the Actor pattern

export function getCommonMetaInfo() {
  return `Player character sheet:
${usePlayerStore().characterSheet}
Player inventory:
${getInventoryString()}
Player HP:
${usePlayerStore().hp}/${usePlayerStore().maxHp}
Player status effects:
${getCurrentStatusEffects()}
${getMapLegend()}
Current time:
${getCurrentTime()}
Memory:
${getMemoryString()}
Current map:
A moody and dark area, no fog, you can see these things around you:
${playerActiveArea().mapString}`
}

export function getInventoryPrompt() {
  return `If the player crafted or somehow else explicitly received an item, add it to the inventory with inventoryActions.add. If they used it in a way that would consume or permanently destroy the item, remove it with inventoryActions.remove.
If a trade was successful, use inventoryActions.add to add the item they received to the players inventory and inventoryActions.remove to remove the item the player gave away for trading.`
}

export function getCurrentStatusEffects() {
  if (!usePlayerStore().statusEffects.length) {
    return '-'
  }
  return usePlayerStore().statusEffects.map(effect => {
    return `${effect.label} (${effect.remainingTurns === -1 ? 'indefinite' : effect.remainingTurns} turn(s) remaining) (since ${effect.sinceTurns} turn(s))`
  })
}

export function getMapLegend() {
  return `The ascii map is made out of these things:
. is the default, empty floor
: is impassable terrain
# is a wall
~ is water
| is a column, pole or tree trunk
^ is a tree
" is a bush or foliage of some sort
+ is a closed door
= is a table
x is the player`
}

type AvailableModels = 'llama-3.1-70b-versatile' | 'llama3-8b-8192'

export async function sendMessage(systemPrompt: string, userMessage: string, model: AvailableModels = 'llama-3.1-70b-versatile') {
  let fullResponse = ''
  // systemPrompt = systemPrompt + "\n" + "respond in german."
  // const result = await sendOpenAIMessage(systemPrompt, userMessage, model)
  // Uncomment the line below to use Groq instead of OpenAI
  const result = await sendGroqMessage(systemPrompt, userMessage)
  const responseJson = result.json
  fullResponse = result.fullResponse
  console.info('model response', {
    systemPrompt,
    userMessage,
    fullResponse,
    responseJson
  })
  addMessage({
    systemPrompt,
    userMessage,
    fullResponse,
    responseJson,
  })
  updateInventoryFromResponse(responseJson)
  return responseJson as Record<string, any>
}


async function sendOpenAIMessage(systemPrompt: string, userMessage: string, model: string = 'gpt-3.5-turbo') {
  model = "gpt-4o"
  const openai = new OpenAI({
    apiKey: useSettingsStore().getOpenAIApiKey(), // Assuming similar store structure
    dangerouslyAllowBrowser: true
  });

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userMessage
      }
    ],
    model,
    response_format: {
      type: "json_object"
    }
  });

  // Get the full model response
  const fullResponse = completion.choices[0]?.message?.content;
  
  // Print the full response with proper formatting
  if (fullResponse) {
    console.log('\n======== FULL MODEL RESPONSE (OPENAI) ========');
    console.log(fullResponse);
    console.log('======== END MODEL RESPONSE ========\n');
  }

  const responseJson = extractJson(fullResponse);
  console.info({
    userMessage,
    responseJson
  });

  return {
    json: responseJson,
    fullResponse: fullResponse || ''
  };
}

async function sendGroqMessage(systemPrompt: string, userMessage: string) {
  // Using OpenAI SDK with Groq's compatibility feature
  const openai = new OpenAI({
    apiKey: useSettingsStore().getGroqApiKey(),
    baseURL: "https://api.groq.com/openai/v1",
    dangerouslyAllowBrowser: true
  });

  // Maximum number of retries
  const MAX_RETRIES = 5;
  // Initial delay in milliseconds (1 second)
  const INITIAL_RETRY_DELAY = 1000;
  
  let retryCount = 0;
  let responseJson;
  let fullResponse = '';
  let toastShown = false; // Track if we've shown a toast for this retry loop
  
  while (retryCount <= MAX_RETRIES) {
    try {
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        model: "qwen-qwq-32b",
        temperature: 0.6,
        max_tokens: 4096,
        top_p: 0.95
      });

      // Get the full model response
      fullResponse = completion.choices[0]?.message?.content || '';
      
      // Print the full response with proper formatting
      if (fullResponse) {
        console.log('\n======== FULL MODEL RESPONSE ========');
        console.log(fullResponse);
        console.log('======== END MODEL RESPONSE ========\n');
      }

      responseJson = extractJson(fullResponse);
      console.info({
        userMessage,
        responseJson
      });
      
      // Success! Break out of the retry loop
      break;
      
    } catch (error) {
      // Check if it's a rate limit error (429)
      if (error instanceof APIError && error.status === 429) {
        // Show toast notification for rate limit error only once per retry loop
        if (!toastShown) {
          const toastStore = useToastStore();
          
          // Extract wait time from error message if available
          let waitTime = '';
          const waitTimeMatch = error.message.match(/try again in ([\d\.]+)s/i);
          if (waitTimeMatch && waitTimeMatch[1]) {
            waitTime = waitTimeMatch[1];
          }
          
          const message = waitTime 
            ? `Rate limit exceeded. Please wait ${waitTime} seconds before trying again.` 
            : 'Rate limit exceeded. Please wait a moment before trying again.';
          
          toastStore.addToast(message, 'error', 8000);
          toastShown = true; // Mark that we've shown the toast for this retry loop
        }
        
        // If we've reached the maximum number of retries, throw the error
        if (retryCount >= MAX_RETRIES) {
          console.error(`Maximum retries (${MAX_RETRIES}) reached for rate limit error:`, error);
          throw error;
        }
        
        // Calculate exponential backoff with jitter
        // 2^retryCount * INITIAL_RETRY_DELAY + random jitter
        const delay = Math.pow(2, retryCount) * INITIAL_RETRY_DELAY + Math.random() * 1000;
        console.log(`Rate limit hit. Retrying in ${delay / 1000} seconds... (Attempt ${retryCount + 1} of ${MAX_RETRIES})`);
        
        // Wait for the calculated delay
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Increment retry counter and try again
        retryCount++;
      } else {
        // For other errors, just throw them to be handled by the caller
        throw error;
      }
    }
  }
  
  return {
    json: responseJson,
    fullResponse
  };
}

export function getCurrentTime() {
  return format(new Date(usePlayerStore().currentTime * 1000), 'hh:mm a')
}

export function getMemoryString() {
  return usePromptStore().memory.length ? usePromptStore().memory.join('\n') : '-'
}

export function getInventoryString() {
  return usePlayerStore().inventoryString
}

export function playerActiveArea() {
  return useMapStore().playerActiveArea
}

function getSuccessProbability() {
  let successProbability = Math.round(Math.random() * 100) / 100
  if (Math.random() >= 0.95) {
    successProbability = 1
  }
  console.log({ successProbability })
  
  // Store the success probability in the dice store
  const diceStore = useDiceStore()
  diceStore.setSuccessProbability(successProbability)
  
  return successProbability
}

export function getLastDungeonMasterMessage() {
  let lastSystemResponse = ''
  const lastSystemHistoryEntry = [...usePromptStore().messageHistory].reverse().find(entry => entry.role === 'system' && entry.content.response)
  if (lastSystemHistoryEntry) {
    lastSystemResponse = 'Previous dungeon master message: \n' + lastSystemHistoryEntry.content.response
  }
  return lastSystemResponse
}

function extractJson(str: string): any {
  const stack = []
  let jsonStart = -1
  let jsonEnd = -1

  for (let i = 0; i < str.length; i++) {
    if (str[i] === '{') {
      if (stack.length === 0) {
        jsonStart = i
      }
      stack.push('{')
    } else if (str[i] === '}') {
      stack.pop()
      if (stack.length === 0) {
        jsonEnd = i
        break
      }
    }
  }

  if (jsonStart !== -1 && jsonEnd !== -1) {
    const jsonStr = str.substring(jsonStart, jsonEnd + 1)
    try {
      return JSON.parse(jsonStr)
    } catch (e) {
      return null // or throw an error, depending on your use case
    }
  } else {
    return null // or throw an error, depending on your use case
  }
}

export function updateInventoryFromResponse(responseJSON: any) {
  console.log('inventory', responseJSON)
    if (responseJSON?.inventoryActions?.add) {
      responseJSON.inventoryActions.add.forEach((item: string) => usePlayerStore().inventory.push(item))
    }

    if (responseJSON?.inventoryActions?.remove) {
      usePlayerStore().inventory = usePlayerStore().inventory.filter(inventoryItem => !responseJSON.inventoryActions.remove.includes(inventoryItem))
    }
}
