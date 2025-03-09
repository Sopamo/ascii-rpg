import * as THREE from 'three'

/**
 * Creates a material for a dice face with the specified number of dots
 * @param number The number to display on the dice face (1-6)
 * @returns A material with the appropriate texture
 */
export function createDiceFaceMaterial(number: number): THREE.MeshStandardMaterial {
  // Create a canvas to draw the face
  const canvas = document.createElement('canvas')
  canvas.width = 512 // Higher resolution for better quality
  canvas.height = 512
  const context = canvas.getContext('2d')
  
  if (!context) return new THREE.MeshStandardMaterial({ color: 0xffffff })
  
  // Create darker gradient background
  const gradient = context.createRadialGradient(256, 256, 0, 256, 256, 362)
  gradient.addColorStop(0, '#2c3e50') // Darker blue-gray center
  gradient.addColorStop(0.7, '#1a2530') // Even darker mid-tone
  gradient.addColorStop(1, '#2c3e50') // Back to edge color
  
  // Fill background
  context.fillStyle = gradient
  context.fillRect(0, 0, 512, 512)
  
  // Add a subtle pattern for texture
  context.strokeStyle = 'rgba(255, 255, 255, 0.1)'
  context.lineWidth = 1
  for (let i = 0; i < 512; i += 16) {
    context.beginPath()
    context.moveTo(0, i)
    context.lineTo(512, i)
    context.stroke()
    context.beginPath()
    context.moveTo(i, 0)
    context.lineTo(i, 512)
    context.stroke()
  }
  
  // Define number positions
  const dotPositions = {
    1: [[256, 256]],
    2: [[128, 128], [384, 384]],
    3: [[128, 128], [256, 256], [384, 384]],
    4: [[128, 128], [128, 384], [384, 128], [384, 384]],
    5: [[128, 128], [128, 384], [256, 256], [384, 128], [384, 384]],
    6: [[128, 128], [128, 256], [128, 384], [384, 128], [384, 256], [384, 384]]
  }[number] || []
  
  // Draw numbers with metallic effect
  dotPositions.forEach(([x, y]) => {
    // Outer glow
    const glowGradient = context.createRadialGradient(x, y, 0, x, y, 40)
    glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)') // White glow
    glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    context.fillStyle = glowGradient
    context.beginPath()
    context.arc(x, y, 40, 0, Math.PI * 2)
    context.fill()
    
    // Main dot with gradient
    const dotGradient = context.createRadialGradient(x - 8, y - 8, 0, x, y, 24)
    dotGradient.addColorStop(0, '#f0f0f0') // Almost white
    dotGradient.addColorStop(0.7, '#e0e0e0') // Light gray
    dotGradient.addColorStop(1, '#d0d0d0') // Mid gray
    context.fillStyle = dotGradient
    context.beginPath()
    context.arc(x, y, 24, 0, Math.PI * 2)
    context.fill()
    
    // Highlight
    context.fillStyle = 'rgba(255, 255, 255, 0.4)'
    context.beginPath()
    context.arc(x - 8, y - 8, 8, 0, Math.PI * 2)
    context.fill()
  })
  
  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas)
  texture.anisotropy = 16 // Improve texture quality at angles
  
  // Return material with premium properties but less reflective
  return new THREE.MeshStandardMaterial({
    map: texture,
    metalness: 0.3,     // Reduced from 0.7 for less metallic look
    roughness: 0.6,     // Increased from 0.2 for less reflective surface
    envMapIntensity: 0.5, // Reduced from 1.0 for less environment reflection
    transparent: true
  })
}

/**
 * Disposes of materials and their textures to prevent memory leaks
 * @param materials Array of materials to dispose
 */
export function disposeDiceMaterials(materials: THREE.MeshStandardMaterial[]): void {
  materials.forEach(material => {
    if (material.map) {
      material.map.dispose()
    }
    material.dispose()
  })
}
