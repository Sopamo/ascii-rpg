import * as CANNON from 'cannon-es'
import { ref, shallowRef } from 'vue'

export function useDicePhysics() {
  // Physics objects
  const world = shallowRef<CANNON.World | null>(null)
  const diceBody = shallowRef<CANNON.Body | null>(null)
  const isRolling = ref(false)
  const diceValue = ref(1)
  
  
  // Initialize physics world
  function initPhysics() {
    const newWorld = new CANNON.World()
    newWorld.gravity.set(0, -9.82, 0) // Earth gravity
    newWorld.broadphase = new CANNON.NaiveBroadphase() as unknown as CANNON.Broadphase
    (newWorld.solver as any).iterations = 10
    world.value = newWorld
    return newWorld
  }
  
  // Create floor for physics
  function createFloor() {
    if (!world.value) return null
    
    // Create ground body as a plane
    const groundShape = new CANNON.Plane()
    const groundBody = new CANNON.Body({
      mass: 0, // Static body
      shape: groundShape,
      material: new CANNON.Material({ friction: 0.9, restitution: 0.2 }) // Very high friction to prevent sliding
    })
    
    // Rotate the ground plane to be horizontal
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
    groundBody.position.set(0, -0.5, 0) // Move floor down slightly
    
    world.value.addBody(groundBody)
    
    // Create contact material between dice and ground if dice exists
    if (diceBody.value && diceBody.value.material && groundBody.material) {
      const contactMaterial = new CANNON.ContactMaterial(
        diceBody.value.material,
        groundBody.material,
        { friction: 0.3, restitution: 0.5 }
      )
      world.value.addContactMaterial(contactMaterial)
    }
    
    return groundBody
  }
  
  // Create dice physics body
  function createDiceBody() {
    if (!world.value) return null
    
    const shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5))
    const body = new CANNON.Body({
      mass: 1,
      shape: shape,
      position: new CANNON.Vec3(0, 3, 0), // Start lower
      material: new CANNON.Material({ friction: 0.9, restitution: 0.2 }), // Very high friction, very low bounce
      linearDamping: 0.6, // Higher damping for quicker stop
      angularDamping: 0.6
    })
    
    world.value.addBody(body)
    diceBody.value = body
    return body
  }
  
  // Roll the dice with physics
  function rollDice() {
    if (!diceBody.value || !world.value || isRolling.value) return
    
    isRolling.value = true
    
    // Reset position (lower starting point)
    diceBody.value.position.set(0, 3, 0)
    
    // Apply random rotation and velocity
    diceBody.value.quaternion.setFromEuler(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    )
    
    diceBody.value.velocity.set(
      Math.random() * 0.6 - 0.3, // Very minimal horizontal movement
      1.5 + Math.random(), // Lower upward velocity
      Math.random() * 0.6 - 0.3
    )
    
    diceBody.value.angularVelocity.set(
      Math.random() * 15 - 7.5, // Reduced spin
      Math.random() * 15 - 7.5,
      Math.random() * 15 - 7.5
    )
  }
  
  // Clean up physics resources
  function cleanupPhysics() {
    if (world.value) {
      // Remove all bodies
      while (world.value.bodies.length > 0) {
        world.value.removeBody(world.value.bodies[0])
      }
      diceBody.value = null
      world.value = null
    }
  }
  
  return {
    world,
    diceBody,
    isRolling,
    diceValue,

    initPhysics,
    createFloor,
    createDiceBody,
    rollDice,

    cleanupPhysics
  }
}
