<template>
  <div class="toast-container">
    <transition-group name="toast">
      <div 
        v-for="toast in toastStore.toasts" 
        :key="toast.id" 
        class="toast" 
        :class="[`toast-${toast.type}`]"
        @click="toastStore.removeToast(toast.id)"
      >
        <div class="toast-content">
          <div class="toast-icon">
            <span v-if="toast.type === 'error'">⚠️</span>
            <span v-else-if="toast.type === 'warning'">⚠️</span>
            <span v-else-if="toast.type === 'success'">✅</span>
            <span v-else>ℹ️</span>
          </div>
          <div class="toast-message">{{ toast.message }}</div>
        </div>
        <div class="toast-progress" :style="{ animationDuration: `${toast.duration}ms` }"></div>
      </div>
    </transition-group>
  </div>
</template>

<script lang="ts" setup>
import { useToastStore } from '@/stores/toastStore';

const toastStore = useToastStore();
</script>

<style scoped lang="scss">
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 350px;
}

.toast {
  background: linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(17,18,27,0.9) 100%);
  color: white;
  padding: 12px 16px;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  &-error {
    border-left: 4px solid #f44336;
  }
  
  &-warning {
    border-left: 4px solid #ff9800;
  }
  
  &-success {
    border-left: 4px solid #4caf50;
  }
  
  &-info {
    border-left: 4px solid #2196f3;
  }
}

.toast-content {
  display: flex;
  align-items: flex-start;
}

.toast-icon {
  margin-right: 12px;
  font-size: 20px;
}

.toast-message {
  flex: 1;
  font-size: 14px;
  line-height: 1.4;
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background-color: rgba(255, 255, 255, 0.3);
  width: 100%;
  transform-origin: left;
  animation: progress-bar linear forwards;
}

@keyframes progress-bar {
  0% {
    transform: scaleX(1);
  }
  100% {
    transform: scaleX(0);
  }
}

// Transition animations
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style>
