import * as THREE from 'three'
import { shallowRef } from 'vue'

export function useThreeScene() {
  const scene = shallowRef<THREE.Scene | null>(null)
  const camera = shallowRef<THREE.PerspectiveCamera | null>(null)
  const renderer = shallowRef<THREE.WebGLRenderer | null>(null)
  const animationFrameId = shallowRef<number | null>(null)
  
  // Initialize Three.js scene
  function initScene(container: HTMLElement) {
    // Create scene with transparent background
    const newScene = new THREE.Scene()
    newScene.background = null // Transparent background
    scene.value = newScene
    
    // Create camera with perspective view
    const newCamera = new THREE.PerspectiveCamera(
      35,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )
    newCamera.position.set(0, 5, 7) // Position camera to view dice
    newCamera.lookAt(0, 0, 0)
    camera.value = newCamera
    
    // Create renderer with transparency support
    const newRenderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    })
    newRenderer.setSize(container.clientWidth, container.clientHeight)
    newRenderer.setClearColor(0x000000, 0) // Fully transparent background
    container.appendChild(newRenderer.domElement)
    renderer.value = newRenderer
    
    return { scene: newScene, camera: newCamera, renderer: newRenderer }
  }
  
  // Add standard lighting to the scene
  function addLighting(targetScene: THREE.Scene = scene.value!) {
    if (!targetScene) return
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    targetScene.add(ambientLight)
    
    // Add main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 10, 7)
    targetScene.add(directionalLight)
    
    // Add secondary light from another angle
    const secondaryLight = new THREE.DirectionalLight(0xffffff, 0.3)
    secondaryLight.position.set(-5, 8, -3)
    targetScene.add(secondaryLight)
    
    return { ambientLight, directionalLight, secondaryLight }
  }
  
  // Clean up Three.js resources
  function cleanupScene(container: HTMLElement | null) {
    // Stop animation loop
    if (animationFrameId.value !== null) {
      cancelAnimationFrame(animationFrameId.value)
      animationFrameId.value = null
    }
    
    // Dispose of renderer
    if (renderer.value) {
      if (container && renderer.value.domElement && container.contains(renderer.value.domElement)) {
        container.removeChild(renderer.value.domElement)
      }
      renderer.value.dispose()
      renderer.value = null
    }
    
    // Clear references
    scene.value = null
    camera.value = null
  }
  
  return {
    scene,
    camera,
    renderer,
    animationFrameId,
    initScene,
    addLighting,
    cleanupScene
  }
}
