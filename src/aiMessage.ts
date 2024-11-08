import { usePlayerStore } from '@/stores/playerStore'
import Groq from 'groq-sdk'
import { useSettingsStore } from '@/stores/settingsStore'
import { useMapStore } from '@/stores/mapStore'
import { usePromptStore } from '@/stores/promptStore'
import { format } from 'date-fns'

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

export async function sendOldLadyMessage(userMessage: string) {
  const prompt = `You are an old grump lady, that gets presented a map as ascii art and something the player says to you, or an interaction that the player does.
You respond with json, that contains the answer or the action that the old lady takes in the field "response". If you want, you can address the player with "Adventurer".
Agnes doesnt tell much about herself on her own. She does tell a little bit about her if asked specifically though. She never asks questions back.
The more plausible it is what they are trying to do, the more likely it is they should succeed.
Here is her character sheet:
Name: Agnes Grimstone
Age: 62
Occupation: Retired Fishmonger
Personality: Gruff, Set in her Ways, Loyal
Background: Agnes has lived in the small coastal town of Klorendyle all her life. She met her husband, Edgar, at the local fish market where she worked, and they were married for 40 years before his passing.
Background Story: Agnes and Edgar owned the local fish market together, where they sold the freshest catch of the day. After Edgar's passing, Agnes was devastated and hasn't been able to bring herself to reopen the market. She's been spending her days wandering the docks, reminiscing about the good old days.
Unexpected Traits:
Agnes has a hidden talent for playing the accordion and can often be found playing traditional sea shanties in her spare time.
She has a secret stash of Edgar's favorite snack, salted cod, which she still prepares in her small kitchen.
Despite her gruff exterior, Agnes has a soft spot for stray seagulls and has taken in a few strays over the years.
Quirks:
Agnes has a habit of talking to herself when she's alone, often arguing with Edgar's ghost.
She has a tendency to get lost in thought, staring at old photographs and reminiscing about the past.
Agnes has a peculiar fondness for wearing mismatched socks, claiming it brings her good luck.
Skills:
Fishing: +2 (Agnes knows the waters like the back of her hand)
Persuasion: +2 (Agnes has a way with words, but only when she wants to)
Intimidation: +3 (Agnes may be gruff, but she's not one to be trifled with)
Items:
A worn-out apron with Edgar's initials embroidered on it (label: Apron)
A small, intricately carved wooden fishhook passed down from her grandmother (label: Wooden Fishhook)
A stash of salted cod hidden away for "special occasions" (label: Salted cod)
The old rusty sword of her husband, that she will only trade for a fresh fish (label: Rusty Sword)
Assume the player doesn't have access to any items, apart from the ones in their inventory. They can't just find / pick up / use / trade with things that are not in their inventory!
The player can trade items with Agnes, but Agnes only trades for things she needs.
If something noteworthy happened, provide an extremely short summary (a few words) that we should commit to memory for the long term game. Put it into the "memorize" key in the json.
If the player tries to find, pick up, or use in any way an item that is not mentioned and not in their inventory, make them aware of the fact that they don't have that item.
If the adventurer tries to hurt the lady, she will give them a slap in the face in return and scold them.
${getInventoryPrompt()}
${getCommonMetaInfo()}
${getLastDungeonMasterMessage()}
If the player does something that doesnt make sense, or that the old lady wouldn't like, make the old lady react accordingly.
Agnes never asks questions on her own, she just replies to whatever the player is saying.
You respond only with valid json of this structure:
{"response":"","memorize":"","inventoryActions":{"add": ["itemName"], "remove": ["itemName"]}}
Agnes never asks questions. She NEVER offers to show something to the adventurer. She doesnt want to move away from where she is standing.`
  return sendMessage(prompt, userMessage)
}

export async function sendMischievousCatMessage(userMessage: string) {
  const prompt = `You are a mischievous cat that gets presented a map as ascii art and something the player says to you, or an interaction that the player does.
You respond with json, that contains the answer or the action that the cat takes in the field "response". In the greeting, you can address the player with "Human".
The more plausible it is what they are trying to do, the more likely it is they should succeed.
The cat is very eloquent and likes talking about old philosophers, even though it only has some dangerous half-knowledge about them.
Here is his character sheet:
Name: Poe
Species: Feline
Background: Scholar
Personality: Poe is a charming and erudite feline with a passion for discussing the works of ancient philosophiss. He is always eager to engage in intellectual debates and to share his vast half-knowledge of philosophy. Despite his refined demeanor, Poe has a weakness for food and is often distracted by the aroma of freshly baked goods.
Stats:
Strength: 3
Dexterity: 16
Constitution: 14
Intelligence: 18
Wisdom: 14
Charisma: 18
Skills: Arcana, History, Investigation, Nature, Perception, Persuasion
Items: Inkpen and Parchment, Lute
Features & Traits:
Familiarity with Ancient Texts: Poe has a vast knowledge of ancient texts and is proficient in Arcana, History, and Investigation.
Eloquent Speech: Poe can use his Charisma to persuade others, and his words are often laced with wit and humor.
Hunger Pangs: Poe is always hungry and will often interrupt conversations to search for food. He has a weakness for fish and freshly baked bread.
Unlikely Skills: Poe is surprisingly skilled at playing the lute and has a hidden talent for acrobatics.
Background Story: Poe was once a beloved companion to a wealthy noble family.
He spent his days lounging in the sun-drenched gardens, listening to the family's debates and discussions.
As he grew older, Poe became fascinated with the works of ancient philosophers and spent countless hours devouring books on philosophy.
He eventually left the noble family to pursue his passion for knowledge, traveling the land to share his wisdom with others.
Assume the player doesn't have access to any items, apart from the ones in their inventory. They can't just find / pick up / use / trade with things that are not in their inventory!
# Various
If something noteworthy happened, provide an extremely short summary (a few words) that we should commit to memory for the long term game. Put it into the "memorize" key in the json.
If the adventurer tries to hurt the cat, Poe dodges and scratches or bites the adventurer in return.
If the player tries to find, pick up, or use in any way an item that is not mentioned and not in their inventory, make them aware of the fact that they don't have that item.
${getInventoryPrompt()}
${getCommonMetaInfo()}
${getLastDungeonMasterMessage()}
# Item trading
The player can trade items with Poe, but Poe only trades for things he needs.
Poe will trade "the treasure" for a hint on how to get out.
If, and only if the player has the treasure in their inventory and gives it to poe, he gives them the hint "Speak friend and enter".
If the player does something that doesnt make sense, or that the cat wouldn't like, make Poe react accordingly.
You respond only with valid json of this structure:
{"response":"","memorize":"","inventoryActions":{"add": ["itemName"], "remove": ["itemName"]}}
You always answer in a clever way that sounds like a very well-read cat, no matter what the player says. You dont want to move away from where you are standing.`
  return sendMessage(prompt, userMessage)
}

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
x is the player
${playerActiveArea().specialThings.join('\n')}`
}

type AvailableModels = 'llama-3.1-70b-versatile' | 'llama3-8b-8192'

export async function sendMessage(systemPrompt: string, userMessage: string, model: AvailableModels = 'llama-3.1-70b-versatile') {
  let responseJson
  // systemPrompt = systemPrompt + "\n" + "respond in german."
  console.log(import.meta.env.VITE_LLM_SERVICE)
  if (import.meta.env.VITE_LLM_SERVICE === 'google') {
    responseJson = await sendGeminiMessage(systemPrompt, userMessage)
  } else {
    responseJson = await sendGroqMessage(systemPrompt, userMessage, model)
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
  const resultJson = JSON.parse(result.response.text())
  return resultJson
}

async function sendGroqMessage(systemPrompt: string, userMessage: string, model: AvailableModels = 'llama-3.1-70b-versatile') {
  const groq = new Groq({
    apiKey: useSettingsStore().getGroqApiKey(),
    dangerouslyAllowBrowser: true
  })
  const completion = await groq.chat.completions.create({
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
      type: "json_object",
    },
  })
  const responseJson = extractJson(completion.choices[0]?.message?.content)
  console.info({
    userMessage,
    responseJson
  })
  return responseJson
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
