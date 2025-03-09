import { onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'

export function useWindowResize(
  camera: THREE.PerspectiveCamera | null, 
  renderer: THREE.WebGLRenderer | null, 
  container: HTMLElement | null
) {
  const handleResize = () => {
    if (!camera || !renderer || !container) return
    
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(container.clientWidth, container.clientHeight)
  }

  onMounted(() => {
    window.addEventListener('resize', handleResize)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
  })

  return {
    handleResize
  }
}
