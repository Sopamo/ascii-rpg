<template>
  <div class="dice-container">
    <button @click="rollDice" class="roll-button">Roll Dice</button>
    <div ref="diceContainer" class="dice-canvas-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, shallowRef } from 'vue'
import * as THREE from 'three'
import { useWindowResize } from '@/composables/useWindowResize'
import { createDiceFaceMaterial, disposeDiceMaterials } from '@/utils/diceMaterialUtils'
import { useDicePhysics } from '@/composables/useDicePhysics'

// DOM References
const diceContainer = ref<HTMLElement | null>(null)


// Three.js objects
const scene = shallowRef<THREE.Scene | null>(null)
const camera = shallowRef<THREE.PerspectiveCamera | null>(null)
const renderer = shallowRef<THREE.WebGLRenderer | null>(null)
const dice = shallowRef<THREE.Mesh | null>(null)
const animationFrameId = ref<number | null>(null)

// Materials for cleanup
let diceMaterials: THREE.MeshStandardMaterial[] = []

// Initialize physics composable
const {
  world,
  diceBody,
  isRolling,
  initPhysics,
  createFloor,
  createDiceBody,
  rollDice: rollDicePhysics,
  cleanupPhysics
} = useDicePhysics()

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

// Initialize Three.js scene and CANNON.js physics
function initScene() {
  if (!diceContainer.value) return

  try {
    // Clean up any existing resources first
    cleanupResources()

    // Create scene with transparent background
    const newScene = new THREE.Scene()
    newScene.background = null // Transparent background
    scene.value = newScene

    // Create camera with perspective view
    const newCamera = new THREE.PerspectiveCamera(
      35,
      diceContainer.value.clientWidth / diceContainer.value.clientHeight,
      0.1,
      1000
    )
    newCamera.position.set(0, 5, 7) // Position camera to view dice
    newCamera.lookAt(0, 0, 0)
    camera.value = newCamera

    // Create renderer with advanced features
    const newRenderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      precision: 'highp'
    })
    newRenderer.setSize(diceContainer.value.clientWidth, diceContainer.value.clientHeight)
    newRenderer.setClearColor(0x000000, 0) // Fully transparent background
    // Disable shadows to remove black artifacts
    newRenderer.shadowMap.enabled = false
    // Enable physically correct lighting (removed due to type error)
    newRenderer.toneMapping = THREE.ACESFilmicToneMapping
    newRenderer.toneMappingExposure = 0.9
    diceContainer.value.appendChild(newRenderer.domElement)
    renderer.value = newRenderer

    // Add sophisticated lighting setup
    // Moderate ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    newScene.add(ambientLight)

    // Main key light (neutral)
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.8)
    keyLight.position.set(5, 8, 4)
    newScene.add(keyLight)

    // Fill light (soft)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3)
    fillLight.position.set(-5, 3, -4)
    newScene.add(fillLight)

    // Top light for even illumination
    const topLight = new THREE.DirectionalLight(0xffffff, 0.2)
    topLight.position.set(0, 10, 0)
    newScene.add(topLight)

    // Initialize physics world
    initPhysics()

    // Create dice
    createDice()

    // Add invisible floor for physics
    createFloor()

    // Initialize window resize handler
    useWindowResize(camera.value, renderer.value, diceContainer.value)

    // Start animation loop
    animate()
  } catch (error) {
    console.error('Error initializing scene:', error)
    cleanupResources()
  }
}

// Create the 3D dice with physics body
function createDice() {
  if (!scene.value || !world.value) return

  try {
    // Create box geometry with flat sides and rounded edges
    const baseSize = 0.95 // Base size of the die
    const segments = 5 // Segments per face for smooth edges
    let geometry = new THREE.BoxGeometry(baseSize, baseSize, baseSize, segments, segments, segments)
    
    // Parameters for edge rounding
    const cornerRadius = 0.04 // Radius for corners (1/5th of previous value)
    const edgeRadius = 0.03 // Radius for edges (1/5th of previous value)
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
    
    // Create the dice mesh
    const diceMesh = new THREE.Mesh(geometry, diceMaterials)
    
    // Add to scene and store reference
    scene.value.add(diceMesh)
    dice.value = diceMesh

    // Create physics body
    createDiceBody()
  } catch (error) {
    console.error('Error creating dice:', error)
  }
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



// Roll the dice
function rollDice() {
  if (!diceBody.value || !world.value || isRolling.value) return
  rollDicePhysics()
}

// Clean up resources
function cleanupResources() {
  // Stop animation loop
  if (animationFrameId.value !== null) {
    cancelAnimationFrame(animationFrameId.value)
    animationFrameId.value = null
  }
  
  // Clean up materials
  disposeDiceMaterials(diceMaterials)
  diceMaterials = []
  
  // Clean up dice mesh
  if (dice.value) {
    if (dice.value.geometry) {
      dice.value.geometry.dispose()
    }
    scene.value?.remove(dice.value)
    dice.value = null
  }
  
  // Clean up physics
  cleanupPhysics()
  
  // Dispose of renderer
  if (renderer.value) {
    if (diceContainer.value && renderer.value.domElement && diceContainer.value.contains(renderer.value.domElement)) {
      diceContainer.value.removeChild(renderer.value.domElement)
    }
    renderer.value.dispose()
    renderer.value = null
  }
  
  // Clear references
  scene.value = null
  camera.value = null
}
</script>

<style lang="scss" scoped>
.dice-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
}

.roll-button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #45a049;
  }
  
  &:active {
    background-color: #3e8e41;
  }
}

.dice-canvas-container {
  width: 300px;
  height: 300px;
  border-radius: 8px;
  overflow: hidden;
}


</style>
