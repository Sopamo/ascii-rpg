export interface Character {
  name: string;
  race: string;
  gender: string;
  class: string;
  defaultAbilityScores: Record<string, number>;
  traits: string[];
  goals: string[];
  personality: string;
  appearance: string;
}

export const characters: Record<string, Character> = {
  lumberjack: {
    name: "Kori Nurembur",
    race: "Human",
    gender: "Male",
    class: "Ranger (with a focus on Survival and Nature skills)",
    defaultAbilityScores: {
      Strength: 16,
      Dexterity: 14,
      Constitution: 14,
      Intelligence: 8,
      Wisdom: 12,
      Charisma: 3
    },
    traits: [
      "Wilderness Survival: You are more likely to find food in the wilderness",
      "Endurance: You can go without rest or nourishment for longer periods of time."
    ],
    goals: [
      "Find a source of Mystwood, a rare and magical type of wood said to always remain cool to the touch. You dream about using this wood to craft a box that will keep food fresh for longer periods of time."
    ],
    personality: "Kori is a gruff but kind-hearted hermit who has spent years living off the land. He is driven by a desire to find the perfect material to craft a box that will help his fellow travelers and villagers. He is fiercely independent but has a soft spot for those in need.",
    appearance: "Kori stands at 1.87m with a rugged, weathered complexion and a thick beard. He wears a pair of worn leather gloves and a fur-lined cloak. His eyes are a hazelnut brown, and his figure is topped with a ranger's hat."
  },
  herbalist: {
    name: "Elara Ramos",
    race: "Half-Elf",
    gender: "Female",
    class: "Ranger (with a focus on Survival and Nature skills)",
    defaultAbilityScores: {
      Strength: 10,
      Dexterity: 14,
      Constitution: 12,
      Intelligence: 14,
      Wisdom: 16,
      Charisma: 12
    },
    traits: [
      "Darkvision: As a half-elf, Elara has superior vision in dim light or darkness.",
      "Endurance: Elara can ignore the first hit point of damage she takes each turn in combat."
    ],
    goals: [
      "Complete the herbadex, documenting every known medicinal herb in the land.",
      "Find a way to redeem herself and make amends for her past mistake.",
      "Use her knowledge to help those in need, and perhaps find a sense of belonging and purpose."
    ],
    personality: "Elara is quiet and reserved, preferring the company of plants and animals to people. She is fiercely dedicated to her work and will stop at nothing to document every known medicinal herb in her herbadex. Despite her introverted nature, Elara has a deep empathy for all living creatures and will go out of her way to help those in need.",
    appearance: "Elara Moonwhisper is a lonely and introverted herbalist who has fled her past in search of a fresh start. She was once part of a prestigious herbalism guild, but a tragic accident involving a misidentified herb led to the death of a patient."
  },
  undead: {
    name: "Echo",
    race: "Undead",
    gender: "Nonbinary",
    class: "Wanderer (a custom class for a weak, aimless undead)",
    defaultAbilityScores: {
      Strength: 3,
      Dexterity: 4,
      Constitution: 4,
      Intelligence: 10,
      Wisdom: 8,
      Charisma: 4
    },
    traits: [
      "Undead: Echo is immune to poison damage and the poisoned condition. They are also immune to disease.",
      "Weakness: Echo has disadvantage on all ability checks. They are clumsy, weak and generally not very adept at anything.",
      "Lost Memories: Echo has no memory of their life before becoming undead. They have a vague sense of unease and disquiet, but no specific memories."
    ],
    goals: [
      "Echo's primary goal is to uncover the reason behind their continued existence. They are driven by a sense of curiosity and unease, and hope to find answers about their past and their current state."
    ],
    personality: "Echo is a quiet, brooding figure who is often lost in thought. They are drawn to places of old, seeking answers in dusty tomes and crumbling ruins. Despite their undead state, Echo has a deep sense of longing for connection and understanding.",
    appearance: "Echo stands at about 1.65m with a gaunt, pale complexion. Their eyes are sunken, and they have no hair left. They wear a tattered cloak that seems to be held together by threads of darkness."
  }
}
