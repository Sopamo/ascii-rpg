import { usePlayerStore } from '@/stores/playerStore'
import Groq from 'groq-sdk'
import { useSettingsStore } from '@/stores/settingsStore'
import { useMapStore } from '@/stores/mapStore'
import { usePromptStore } from '@/stores/promptStore'
import { format } from 'date-fns'
import OpenAI from 'openai';

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold
} from '@google/generative-ai'
import { addMessage } from '@/firebase'

export async function sendDungeonMasterMessage(userMessage: string) {
  const prompt = `You are a dungeon master, that gets presented a map as ascii art and an action that the player wants to take.
You respond with json, that contains a short & funny narrator like sentence (try to limit yourself to once sentence) that describes what happens in the field "response". You should use words that would be used in a high level fantasy novel. If you want, you can address the player with "you ...".
Try to create an interesting story, don't just let everything the player tries to do succeed.
The more plausible it is what they are trying to do, the more likely it is they should succeed.
Think of how difficult the action is that they want to take on a scale from 1-10. Regular things that most people can do have difficulty 1-5. Things that few people can do are difficulty 6-8. Things that only very few people can do are difficulty 9-10. If the difficulty is higher than ${getSuccessProbability() * 10}, they fail.
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
You respond only with valid json of this structure:
{"response":"","memorize":"","inventoryActions":{"add": ["itemName"], "remove": ["itemName"]}}`
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
  let responseJson
  // systemPrompt = systemPrompt + "\n" + "respond in german."
  console.log(import.meta.env.VITE_LLM_SERVICE)
  if (import.meta.env.VITE_LLM_SERVICE === 'google') {
    responseJson = await sendGeminiMessage(systemPrompt, userMessage)
  } else {
    // responseJson = await sendOpenAIMessage(systemPrompt, userMessage, model)
    // Uncomment the line below to use Groq instead of OpenAI
    responseJson = await sendGroqMessage(systemPrompt, userMessage)
  }
  console.info({
    systemPrompt,
    userMessage,
    responseJson
  })
  addMessage({
    systemPrompt,
    userMessage,
    responseJson,
  })
  updateInventoryFromResponse(responseJson)
  return responseJson as Record<string, any>
}

async function sendGeminiMessage(systemPrompt: string, userMessage: string) {
  const apiKey = import.meta.env.VITE_GEMINI_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-latest",
    systemInstruction: systemPrompt,
  });

  const generationConfig = {
    temperature: 0,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
  ];
  const chatSession = model.startChat({
    generationConfig,
    safetySettings,
  });

  const result = await chatSession.sendMessage(userMessage);
  const fullResponse = result.response.text();
  
  // Print the full response with proper formatting
  if (fullResponse) {
    console.log('\n======== FULL MODEL RESPONSE (GEMINI) ========');
    console.log(fullResponse);
    console.log('======== END MODEL RESPONSE ========\n');
  }
  
  const resultJson = JSON.parse(fullResponse);
  return resultJson;
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

  return responseJson;
}

async function sendGroqMessage(systemPrompt: string, userMessage: string) {
  // Using OpenAI SDK with Groq's compatibility feature
  const openai = new OpenAI({
    apiKey: useSettingsStore().getGroqApiKey(),
    baseURL: "https://api.groq.com/openai/v1",
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
    model: "qwen-qwq-32b",
    temperature: 0.6,
    max_tokens: 4096,
    top_p: 0.95
  });

  // Get the full model response
  const fullResponse = completion.choices[0]?.message?.content;
  
  // Print the full response with proper formatting
  if (fullResponse) {
    console.log('\n======== FULL MODEL RESPONSE ========');
    console.log(fullResponse);
    console.log('======== END MODEL RESPONSE ========\n');
  }

  const responseJson = extractJson(fullResponse);
  console.info({
    userMessage,
    responseJson
  });

  return responseJson;
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
  let successProbability = Math.round(Math.random() * 7) / 10
  if (Math.random() >= 0.95) {
    successProbability = 1
  }
  console.log({ successProbability })
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
