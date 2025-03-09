# ascii

## Characters

### Echo

#### Background
- Echo was brought back to life by a necromancer. He does not know why, how or where.
- He wants to find out why he needs to spend more time in this miserable world

#### Story
 - Someone at the 

### Arnold
- Arnold has settled as a lumberjack, after having lead a life of violence before
- He wants to find mystwood, a rare type of wood, said to always be cool to the touch
- It would help him to fashion a box to help keep his dead prey cool for longer.

### Elara
- Elara has fled her life as a herbalist after having misidentified a herb, leading to the death of a patient.
- She keeps her Herbadex always closeby, hoping to categorize all herbs in order to prevent mistakes like hers.


## Locations

### The lake
- The area around the lake is moody, wet and dark.
- There is a grumpy old lady sitting on a bench.
- There is a cat, sitting next to some tables
- To the right, there is a stone blocking the exit of the lake area. If the player says "friend", the stone rolls away and allows the player to pass to the next location.
- There is a sea monster in the middle of the lake

#### Agnes (old lady)
- Agnes doesnt like to talk much.
- She is an old fishmonger
- She is willing to trade her late husbands rusty old sword for a fresh fish from the lake

#### Poe (cat)
- Poe is quite chatty and likes to talk about philosophers
- Poe is willing to tell the adventurer a secret, if he brings him the treasure from the monster
- The secret is "speak friend and enter"
- He mentions that the old lady might have something to help fight the monster

### The Tower
#### Gorvoth (old man)
- Mysterious necromancer
- Tells Echo he revived him in order for him to "actually live"
- Ask the player what the one thing is they want to do
- Put that topic into every npc prompt so that they talk with you


### The Wilderness
#### The sphinx
The sphinx blocks the way.
It offers the player to either walk away unscathed, solve the riddle it's giving them and be allowed to pass, or be attacked if they answer incorrectly.
The riddles are:

"Flowing from trees, sweet and sticky, a treat so fine,
What essence could this be, in a dark bottle, a hidden sign?

Found in the midst of 'bell' and 'tall', it stands upright and true,
Amidst words like 'silent' and 'pearl', it stands firm, straight as a sentinel too.

The sound of movement, continuous and flowing,
It’s the tail end of verbs where life is showing.

Now string them together and answer this thing,
What young tree is sprouting, ready for spring?
sapling"


"Amid eerie whispers and ghostly cheer,
Find the beginning of laughter you fear.

Through the raven’s gaze, where night does descend,
Look to its core, where shadows extend.

In the haunted woods, beneath the elder tree,
The final sound of the eldest sets you free.

Now string them together and speak to the night,
Which fragrant bloom calms with its sight?"


"First think of what comes before 'possible',
When nothing seems right and cannot be done.

Consider the start of the time when the sun starts to shine,
It's early, not late, and often quite fine.

Lastly, a part of 'crystal' you must find,
At the end, it's sharp and shines in your mind.

Now string them together and give what you're called,
A word that means never to perish, always enthralled."


### The Town
#### The angry person
They are angry because their close relative died because of Elara's accident.

#### Marla the Widow
Marla lost her husband to the dark curse that plagues the town. Her days are now a relentless struggle against grief and decay. Through tearful ("uhu uhu uhu uhu") recollections, she explains to Echo how the curse has drained the hope and vitality from the town, leaving its people to live in desolation.

#### Bram the Cobbler
Bram the Cobbler was once the pride of his town, known for crafting exquisite shoes that attracted customers from far and wide. His shop was a bustling hub, symbolizing his skill and the town's prosperity. However, a mysterious curse struck, causing his hands to shake, his vision to blur, and his materials to decay, effectively destroying his trade. This curse, likely magical in nature, seems to have two effects: it ruined his ability to cobble and induced a profound apathy, making him indifferent to his ruined shop, the townspeople's suffering, and even his own fate.
Current State and Interactions
Today, Bram's shop is a shadow of its former self, with dusty shelves, rusted tools, and a floor littered with failed projects. He sits slumped, barely acknowledging visitors, often responding with cynical remarks like, "Looking for shoes? Well, you've come to the right place—if you don't mind them turning to dust after a week." His apathy is evident in his dismissive shrugs and lack of interest in helping others, reflecting a man who has given up on caring about anything or anyone.
Unexpected Personal Details
An unexpected layer to Bram's character is his personal life: he was married to Eliza, who left him as his business failed, and he has a daughter, Lily, who sends letters he doesn't open. These unopened letters, piling up and gathering dust, hint at a potential emotional connection the players might exploit to motivate him, adding a poignant depth to his otherwise bleak demeanor.

#### Lorin the Beggar
Lorin wanders the desolate streets, a bitter witness to the decay around him. His voice, tinged with sorrow and resignation, tells Echo the harsh truth of how the curse has exploited the vulnerable, leaving no soul untouched by misery.

### Echo's Final Decision Options

The necromancer reveals that in order to revive Echo, he cast a dark spell over the town, leaving the townspeople truly sick and broken. Echo is then given two choices:

- **Sacrifice His Second Life:**  
  Echo can choose to sacrifice his second chance at life to lift the curse, thereby healing the townspeople at the cost of his own existence. This tragic sacrifice redeems the town but leaves Echo as a martyr, questioning what real life means.

- **Continue His Second Life:**  
  Alternatively, Echo may decide to keep his second life, accepting the persistent suffering of the townspeople. This choice allows him to continue living, albeit burdened with guilt and moral ambiguity, opening the door for further quests and redemption efforts.


https://notimetoplay.org/engines/ascii-mapper/editor/index.html

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```


mysterious necromancer pixelsprite pixel art sprite sheet with 4 frames in a grid 8bit, pokemon style, big pixels, no details, grid white background
https://console.cloud.google.com/vertex-ai/studio/vision?inv=1&invt=Abrdxg&project=brotheld-b8a8a

https://photo2pixel.co/


### Dice implementation
1. Set Up Physics Environment
World: Create CANNON.World, set gravity y = -9.82.
Ground: Add static CANNON.Body with CANNON.Plane.
Dice: Add dynamic CANNON.Body with CANNON.Box (size 1), mass 1, initial position y = 5.
Materials: Set friction 0.3, restitution 0.5 for dice and ground, add contact material.
Code:

javascript

Collapse

Wrap

Copy
import * as CANNON from 'cannon-es';

const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

const groundBody = new CANNON.Body({ mass: 0, shape: new CANNON.Plane() });
world.addBody(groundBody);

const diceBody = new CANNON.Body({ mass: 1, shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)) });
diceBody.position.set(0, 5, 0);
world.addBody(diceBody);

const material = new CANNON.Material({ friction: 0.3, restitution: 0.5 });
diceBody.material = groundBody.material = material;
world.addContactMaterial(new CANNON.ContactMaterial(material, material, { friction: 0.3, restitution: 0.5 }));
2. Define Target Orientations
Quaternions: Map each face (1–6) to a quaternion where that face is up (e.g., face 1 up: identity, face 6 up: 180° around X).
Code:

javascript

Collapse

Wrap

Copy
const targetQuaternions = {
  1: new CANNON.Quaternion().setFromEuler(0, 0, 0),
  2: new CANNON.Quaternion().setFromEuler(Math.PI / 2, 0, 0),
  3: new CANNON.Quaternion().setFromEuler(0, Math.PI / 2, 0),
  4: new CANNON.Quaternion().setFromEuler(0, -Math.PI / 2, 0),
  5: new CANNON.Quaternion().setFromEuler(-Math.PI / 2, 0, 0),
  6: new CANNON.Quaternion().setFromEuler(Math.PI, 0, 0),
};
3. Simulate Dice Roll
Reset: Set dice position y = 5, clear velocities.
Throw: Apply initial force (e.g., z = -5) and torque (e.g., x = 1, y = 2, z = 3).
Step: Run world.step(fixedTimeStep) in animation loop.
Code:

javascript

Collapse

Wrap

Copy
function startRoll() {
  diceBody.position.set(0, 5, 0);
  diceBody.velocity.set(0, 0, 0);
  diceBody.angularVelocity.set(0, 0, 0);
  diceBody.applyForce(new CANNON.Vec3(0, 0, -5), diceBody.position);
  diceBody.applyTorque(new CANNON.Vec3(1, 2, 3));
}
4. Apply Corrective Torque
Detect Settling: Check if velocity.length() and angularVelocity.length() < 0.1.
PD Control:
Compute quaternion difference: Q_diff = Q_target * Q_current.inverse().
Extract axis and angle from Q_diff.
Apply torque: torque = k_p * angle * axis - k_d * angular_velocity (k_p = 0.5, k_d = 0.1).
Code:

javascript

Collapse

Wrap

Copy
function applyCorrection(desiredFace) {
  if (diceBody.velocity.length() < 0.1 && diceBody.angularVelocity.length() < 0.1) {
    const Q_target = targetQuaternions[desiredFace];
    const Q_current = diceBody.quaternion;
    const Q_diff = Q_target.mult(Q_current.inverse());
    const [axis, angle] = Q_diff.toAxisAngle();
    if (angle > 0.01) {
      const torque = axis.scale(0.5 * angle).vsub(diceBody.angularVelocity.scale(0.1));
      diceBody.applyTorque(torque);
    }
  }
}
5. Run Simulation
Loop: Use requestAnimationFrame, step world, apply correction, stop when velocities < 0.01.
Code:

javascript

Collapse

Wrap

Copy
function rollDice(desiredFace) {
  startRoll();
  const fixedTimeStep = 1 / 60;
  let lastTime;
  function simulate(time) {
    const dt = lastTime ? (time - lastTime) / 1000 : 0;
    world.step(fixedTimeStep, dt);
    applyCorrection(desiredFace);
    if (diceBody.velocity.length() < 0.01 && diceBody.angularVelocity.length() < 0.01) {
      console.log(`Dice stopped with face ${desiredFace} up`);
    } else {
      requestAnimationFrame(simulate);
    }
    lastTime = time;
  }
  requestAnimationFrame(simulate);
}

rollDice(5); // Roll with face 5 up
Fine-Tuning
Adjust k_p, k_d, and thresholds for smoothness.
Apply torque only near rest for realism.
Pair with Three.js for visualization.