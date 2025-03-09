<template>
  <div class="dice-roller-container">
    <div ref="diceContainer" class="dice-canvas-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, shallowRef, defineExpose, defineEmits } from 'vue'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { createDiceFaceMaterial, disposeDiceMaterials } from '@/utils/diceMaterialUtils'

// Define emits
const emit = defineEmits(['diceRolled'])

// DOM References
const diceContainer = ref<HTMLElement | null>(null)

// Three.js objects
const scene = shallowRef<THREE.Scene | null>(null)
const camera = shallowRef<THREE.PerspectiveCamera | null>(null)
const renderer = shallowRef<THREE.WebGLRenderer | null>(null)
const dice = shallowRef<THREE.Mesh | null>(null)
const animationFrameId = ref<number | null>(null)

// Physics objects
const world = shallowRef<CANNON.World | null>(null)
const diceBody = shallowRef<CANNON.Body | null>(null)
const isRolling = ref(false)
const diceValue = ref(1)

// Materials for cleanup
let diceMaterials: THREE.MeshStandardMaterial[] = []

// Initialize the scene
onMounted(() => {
  // Use setTimeout to ensure DOM is fully rendered
  setTimeout(() => {
    initScene()
  }, 0)
})

// Clean up resources when component is unmounted
onBeforeUnmount(() => {
  cleanupResources()
})

// Initialize physics world
function initPhysics() {
  const newWorld = new CANNON.World()
  newWorld.gravity.set(0, -9.82, 0) // Earth gravity
  newWorld.broadphase = new CANNON.NaiveBroadphase() as unknown as CANNON.Broadphase
  (newWorld.solver as any).iterations = 10
  world.value = newWorld
  return newWorld
}

// Create floor and boundaries for physics
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
  groundBody.position.set(0, 0, 0) // Keep floor at origin for top-down view
  
  world.value.addBody(groundBody)
  
  // Create visible walls around the 800x800px area for debugging
  // Increase area size for a larger rolling space
  const areaSize = 16 // Increased from 8 to 12 for larger area
  const wallThickness = 0.5
  const wallHeight = 10
  
  // Create wall material with high restitution for bouncy walls
  const wallMaterial = new CANNON.Material({ friction: 0.1, restitution: 0.8 })
  
  // Create walls for each side of the area
  const walls = [
    // Left wall
    {
      position: new CANNON.Vec3(-areaSize/2 - wallThickness/2, wallHeight/2, 0),
      size: new CANNON.Vec3(wallThickness, wallHeight, areaSize)
    },
    // Right wall
    {
      position: new CANNON.Vec3(areaSize/2 + wallThickness/2, wallHeight/2, 0),
      size: new CANNON.Vec3(wallThickness, wallHeight, areaSize)
    },
    // Front wall
    {
      position: new CANNON.Vec3(0, wallHeight/2, areaSize/2 + wallThickness/2),
      size: new CANNON.Vec3(areaSize, wallHeight, wallThickness)
    },
    // Back wall
    {
      position: new CANNON.Vec3(0, wallHeight/2, -areaSize/2 - wallThickness/2),
      size: new CANNON.Vec3(areaSize, wallHeight, wallThickness)
    }
  ]
  
  // Add all walls to the world and create visual representations
  const wallMeshes = []
  walls.forEach(wall => {
    // Create physics body
    const wallBody = new CANNON.Body({
      mass: 0, // Static body
      shape: new CANNON.Box(wall.size),
      position: wall.position,
      material: wallMaterial
    })
    world.value?.addBody(wallBody)
    
    // Create visual representation for debugging
    if (scene.value) {
      const wallGeometry = new THREE.BoxGeometry(
        wall.size.x * 2, // CANNON uses half-extents
        wall.size.y * 2,
        wall.size.z * 2
      )
      const wallMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,     // Green color
        transparent: true,    // Enable transparency
        opacity: 0.3,         // Semi-transparent
        wireframe: true       // Show as wireframe for better visibility
      })
      const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial)
      wallMesh.position.copy(wall.position as any)
      scene.value.add(wallMesh)
      wallMeshes.push(wallMesh)
    }
  })
  
  // Create contact material between dice and ground if dice exists
  if (diceBody.value && diceBody.value.material) {
    // Ground contact material
    if (groundBody.material) {
      const groundContactMaterial = new CANNON.ContactMaterial(
        diceBody.value.material,
        groundBody.material,
        { friction: 0.3, restitution: 0.5 }
      )
      world.value.addContactMaterial(groundContactMaterial)
    }
    
    // Wall contact material - more bouncy
    const wallContactMaterial = new CANNON.ContactMaterial(
      diceBody.value.material,
      wallMaterial,
      { friction: 0.1, restitution: 0.8 }
    )
    world.value.addContactMaterial(wallContactMaterial)
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
    position: new CANNON.Vec3(3, 4, 0), // Start from right side (positive X)
    material: new CANNON.Material({ friction: 0.9, restitution: 0.2 }), // Very high friction, very low bounce
    linearDamping: 0.7, // Higher damping for quicker stop
    angularDamping: 0.7
  })
  
  world.value.addBody(body)
  diceBody.value = body
  return body
}

// Initialize scene
function initScene() {
  if (!diceContainer.value) return
  
  // Create scene
  scene.value = new THREE.Scene()
  // Make background transparent
  scene.value.background = null
  
  // Create camera
  // Fixed aspect ratio for 800x800 area
  const aspect = 1 // Square aspect ratio (800/800 = 1)
  // Reduce field of view to make dice appear smaller
  camera.value = new THREE.PerspectiveCamera(20, aspect, 0.1, 1000)
  // Position camera much further away (3x previous distance)
  camera.value.position.set(0, 45, 0)
  camera.value.lookAt(0, 0, 0)
  
  // Create renderer with alpha for transparency
  renderer.value = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  // Force size to be 800x800px
  renderer.value.setSize(800, 800)
  renderer.value.setPixelRatio(window.devicePixelRatio)
  renderer.value.shadowMap.enabled = true
  diceContainer.value.appendChild(renderer.value.domElement)
  
  // Add lights optimized for top-down view
  // Stronger ambient light for better overall visibility
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
  scene.value.add(ambientLight)
  
  // Main directional light directly above
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2)
  directionalLight.position.set(0, 10, 0)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  scene.value.add(directionalLight)
  
  // Add a secondary light for better definition
  const secondaryLight = new THREE.DirectionalLight(0xffffff, 0.5)
  secondaryLight.position.set(5, 8, 5)
  scene.value.add(secondaryLight)
  
  // Initialize physics
  initPhysics()
  createFloor()
  
  // Create dice
  createDice()
  
  // Using fixed size of 800x800px, no need for window resize handling
  
  // Start animation loop
  animate()

  rollDice()
}

// Create the 3D dice
function createDice() {
  if (!scene.value) return
  
  // Create box geometry with flat sides and rounded edges
  const baseSize = 0.95 // Base size of the die
  const segments = 5 // Segments per face for smooth edges
  let geometry = new THREE.BoxGeometry(baseSize, baseSize, baseSize, segments, segments, segments)
  
  // Parameters for edge rounding
  const cornerRadius = 0.04 // Radius for corners
  const edgeRadius = 0.03 // Radius for edges
  const positions = geometry.attributes.position.array
  
  // Process each vertex
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i]
    const y = positions[i + 1]
    const z = positions[i + 2]
    
    // Calculate distances from center for each axis
    const absX = Math.abs(x)
    const absY = Math.abs(y)
    const absZ = Math.abs(z)
    
    // Determine if vertex is on an edge or corner
    const halfSize = baseSize / 2
    const threshold = 0.01
    
    // Check if each coordinate is at the maximum distance (on a face)
    const isOnFaceX = Math.abs(absX - halfSize) < threshold
    const isOnFaceY = Math.abs(absY - halfSize) < threshold
    const isOnFaceZ = Math.abs(absZ - halfSize) < threshold
    
    // Count how many faces this vertex belongs to
    const faceCount = [isOnFaceX, isOnFaceY, isOnFaceZ].filter(Boolean).length
    
    // Only modify vertices on edges (2 faces) or corners (3 faces)
    if (faceCount >= 2) {
      // Determine if it's a corner or just an edge
      const isCorner = faceCount === 3
      const radius = isCorner ? cornerRadius : edgeRadius
      
      // For each axis that's at max distance, pull it in by the radius
      let newX = x
      let newY = y
      let newZ = z
      
      if (isOnFaceX) {
        newX = Math.sign(x) * (halfSize - radius)
      }
      
      if (isOnFaceY) {
        newY = Math.sign(y) * (halfSize - radius)
      }
      
      if (isOnFaceZ) {
        newZ = Math.sign(z) * (halfSize - radius)
      }
      
      // Apply changes to vertex
      positions[i] = newX
      positions[i + 1] = newY
      positions[i + 2] = newZ
    }
  }
  
  // Update geometry and ensure smooth shading
  geometry.attributes.position.needsUpdate = true
  geometry.computeVertexNormals()
  
  // Scale to final size while preserving proportions
  const scale = new THREE.Matrix4().makeScale(1.05, 1.05, 1.05)
  geometry.applyMatrix4(scale)
  
  // Create materials for each face of the dice
  diceMaterials = [
    createDiceFaceMaterial(1), // Right face (1)
    createDiceFaceMaterial(6), // Left face (6)
    createDiceFaceMaterial(2), // Top face (2)
    createDiceFaceMaterial(5), // Bottom face (5)
    createDiceFaceMaterial(3), // Front face (3)
    createDiceFaceMaterial(4)  // Back face (4)
  ]
  
  // Create dice mesh
  dice.value = new THREE.Mesh(geometry, diceMaterials)
  dice.value.castShadow = true
  dice.value.receiveShadow = true
  scene.value.add(dice.value)
  
  // Create physics body for dice
  createDiceBody()
}

// Determine which face of the dice is up
function determineDiceValue(): number {
  if (!diceBody.value) return 1
  
  // Define normal vectors for each face of the dice
  const faceNormals = [
    new CANNON.Vec3(1, 0, 0),  // Right face (1)
    new CANNON.Vec3(-1, 0, 0), // Left face (6)
    new CANNON.Vec3(0, 1, 0),  // Top face (2)
    new CANNON.Vec3(0, -1, 0), // Bottom face (5)
    new CANNON.Vec3(0, 0, 1),  // Front face (3)
    new CANNON.Vec3(0, 0, -1)  // Back face (4)
  ]
  
  // Define corresponding dice values for each face
  const faceValues = [1, 6, 2, 5, 3, 4]
  
  // Get the world up vector
  const worldUp = new CANNON.Vec3(0, 1, 0)
  
  // Transform face normals to world space using dice body's quaternion
  let maxDot = -1
  let faceIndex = 0
  
  for (let i = 0; i < faceNormals.length; i++) {
    // Clone the normal so we don't modify the original
    const normal = faceNormals[i].clone()
    
    // Transform normal to world space
    diceBody.value.quaternion.vmult(normal, normal)
    
    // Calculate dot product with world up vector
    const dot = normal.dot(worldUp)
    
    // If this face is more "up" than the previous best, update
    if (dot > maxDot) {
      maxDot = dot
      faceIndex = i
    }
  }
  
  // Return the dice value for the face that's most "up"
  return faceValues[faceIndex]
}

// Animation loop
function animate() {
  try {
    // Check if component is still mounted
    if (!scene.value || !camera.value || !renderer.value || !dice.value || !world.value || !diceBody.value) {
      if (animationFrameId.value !== null) {
        cancelAnimationFrame(animationFrameId.value)
        animationFrameId.value = null
      }
      return
    }
    
    // Schedule next frame
    animationFrameId.value = requestAnimationFrame(animate)
    
    // Step physics world
    world.value.step(1/60)
    
    // Update dice mesh position and rotation from physics body
    dice.value.position.copy(diceBody.value.position as unknown as THREE.Vector3)
    dice.value.quaternion.copy(diceBody.value.quaternion as unknown as THREE.Quaternion)
    
    // Check if dice has stopped moving
    if (isRolling.value && 
        diceBody.value.velocity.lengthSquared() < 0.01 && 
        diceBody.value.angularVelocity.lengthSquared() < 0.01) {
      isRolling.value = false
      
      // Determine and emit the dice value
      const value = determineDiceValue()
      diceValue.value = value
      emit('diceRolled', value)
    }
    
    // Render the scene
    renderer.value.render(scene.value, camera.value)
  } catch (error) {
    console.error('Error during animation:', error)
    if (animationFrameId.value !== null) {
      cancelAnimationFrame(animationFrameId.value)
      animationFrameId.value = null
    }
  }
}

// Roll the dice with physics
function rollDice() {
  if (!diceBody.value || !world.value || isRolling.value) return
  
  isRolling.value = true
  
  // Reset position - start from the right side
  diceBody.value.position.set(4, 4, 0) // Start from right side (positive X)
  
  // Apply random rotation and velocity
  diceBody.value.quaternion.setFromEuler(
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2
  )
  
  diceBody.value.velocity.set(
    -16 - Math.random() * 16, // Stronger negative X velocity for right-to-left movement
    Math.random(), // Upward velocity
    Math.random() * 4 - 2 // Small random Z movement
  )
  
  diceBody.value.angularVelocity.set(
    Math.random() * 15 - 7.5, // Reduced spin
    Math.random() * 15 - 7.5,
    Math.random() * 15 - 7.5
  )
}

// Clean up resources
function cleanupResources() {
  // Stop animation loop
  if (animationFrameId.value !== null) {
    cancelAnimationFrame(animationFrameId.value)
    animationFrameId.value = null
  }
  
  // Dispose of Three.js resources
  if (dice.value) {
    scene.value?.remove(dice.value)
    dice.value.geometry.dispose()
  }
  
  // Dispose of materials
  disposeDiceMaterials(diceMaterials)
  diceMaterials = []
  
  // Dispose of renderer
  if (renderer.value) {
    if (diceContainer.value && diceContainer.value.contains(renderer.value.domElement)) {
      diceContainer.value.removeChild(renderer.value.domElement)
    }
    renderer.value.dispose()
  }
  
  // Clean up physics
  if (world.value) {
    // Remove all bodies
    while (world.value.bodies.length > 0) {
      world.value.removeBody(world.value.bodies[0])
    }
    diceBody.value = null
    world.value = null
  }
  
  // Clear references
  scene.value = null
  camera.value = null
  renderer.value = null
  dice.value = null
}

// Expose methods
defineExpose({
  rollDice,
  getDiceValue: () => diceValue.value
})
</script>

<style lang="scss" scoped>
.dice-roller-container {
  width: 800px;
  height: 800px;
  position: relative;
  
  .dice-canvas-container {
    width: 800px;
    height: 800px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    
    canvas {
      width: 800px !important;
      height: 800px !important;
    }
  }
}
</style>
