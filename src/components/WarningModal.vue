<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <div class="warning-icon">⚠️</div>
        <h3>{{ title }}</h3>
      </div>
      <div class="modal-content">
        <p>{{ message }}</p>
      </div>
      <div class="modal-actions">
        <button class="btn-cancel" @click="cancel">{{ cancelText }}</button>
        <button class="btn-confirm" @click="confirm">{{ confirmText }}</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  show: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
}>();

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

function confirm() {
  emit('confirm');
}

function cancel() {
  emit('cancel');
}
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background: linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(17,18,27,1) 100%);
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 24px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 40px 2px rgba(0,0,0,0.6);
}

.modal-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  
  h3 {
    margin: 0;
    color: #f0c040;
    font-size: 1.5rem;
  }
  
  .warning-icon {
    font-size: 24px;
    margin-right: 12px;
  }
}

.modal-content {
  margin-bottom: 24px;
  
  p {
    font-size: 1.1rem;
    line-height: 1.5;
    color: #dedede;
  }
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  
  button {
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &.btn-cancel {
      background: transparent;
      border: 1px solid #dedede;
      color: #dedede;
      
      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }
    
    &.btn-confirm {
      background: #f0c040;
      border: 1px solid #f0c040;
      color: #111;
      font-weight: bold;
      
      &:hover {
        background: darken(#f0c040, 10%);
      }
    }
  }
}
</style>
