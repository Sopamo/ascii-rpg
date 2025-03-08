<template>
  <div class="s-settings">
    <div class="s-header">
      <button @click="goBack" class="s-back-button">&larr; Back</button>
      <h1>Settings</h1>
    </div>
    <div class="s-settings-content">
      <div class="s-settings-section">
        <h2>API Keys</h2>
        <div class="s-setting-item">
          <label for="groq-api-key">Groq API Key</label>
          <input 
            type="password" 
            id="groq-api-key" 
            v-model="settingsStore.groqApiKey" 
            placeholder="Enter your Groq API key"
          />
        </div>
        <div class="s-setting-item">
          <label for="openai-api-key">OpenAI API Key</label>
          <input 
            type="password" 
            id="openai-api-key" 
            v-model="settingsStore.openAIApiKey" 
            placeholder="Enter your OpenAI API key"
          />
        </div>
        <div class="s-setting-item">
          <label for="google-cloud-api-key">Google Cloud API Key</label>
          <input 
            type="password" 
            id="google-cloud-api-key" 
            v-model="settingsStore.googleCloudApiKey" 
            placeholder="Enter your Google Cloud API key"
          />
        </div>
        <div class="s-setting-item">
          <label for="deepgram-api-key">Deepgram API Key</label>
          <input 
            type="password" 
            id="deepgram-api-key" 
            v-model="settingsStore.deepgramApiKey" 
            placeholder="Enter your Deepgram API key"
          />
        </div>
      </div>
      
      <div class="s-settings-section">
        <h2>Audio Settings</h2>
        <div class="s-setting-item s-toggle-item">
          <label for="enable-audio">Enable Audio Output</label>
          <label class="s-toggle">
            <input 
              type="checkbox" 
              id="enable-audio" 
              v-model="settingsStore.enableAudioOutput"
            />
            <span class="s-toggle-slider"></span>
          </label>
        </div>
        <div class="s-setting-item" v-if="settingsStore.enableAudioOutput">
          <label for="audio-output-type">Audio Output Type</label>
          <select 
            id="audio-output-type" 
            v-model="settingsStore.audioOutputType"
          >
            <option value="local">Local</option>
            <option value="deepgram">Deepgram</option>
            <option value="google">Google</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/stores/settingsStore';
import { useRouter } from 'vue-router';

const settingsStore = useSettingsStore();
const router = useRouter();

function goBack() {
  router.back();
}
</script>

<style scoped lang="scss">
.s-settings {
  min-height: 60vh;
  width: 100%;
  gap: 24px;
  flex-direction: column;
  display: flex;
  
  .s-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    
    h1 {
      font-family: upheaval, sans-serif;
      font-size: 28px;
      margin: 0;
      flex-grow: 1;
      text-align: center;
    }
    
    .s-back-button {
      background: transparent;
      border: 1px solid #dedede;
      color: #dedede;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s ease;
      
      &:hover {
        background: rgba(222, 222, 222, 0.1);
        transform: translateX(-2px);
      }
      
      &:active {
        background: rgba(222, 222, 222, 0.2);
      }
    }
  }

  h2 {
    font-family: upheaval, sans-serif;
    font-size: 22px;
    margin-bottom: 16px;
    color: #dedede;
  }
  
  .s-settings-content {
    background: linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(17,18,27,1) 21%);
    border-radius: 2px;
    outline: 1px solid #dedede;
    padding: 20px;
    box-shadow: 0 10px 40px 2px rgba(0,0,0,0.4);
  }

  .s-settings-section {
    margin-bottom: 30px;
  }

  .s-setting-item {
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;

    &.s-toggle-item {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }

    label {
      margin-bottom: 8px;
      font-size: 14px;
      color: #dedede;
    }

    input[type="password"], 
    input[type="text"],
    select {
      background-color: rgba(0, 0, 0, 0.3);
      border: 1px solid #444;
      color: white;
      padding: 10px;
      border-radius: 4px;
      font-family: monospace;
      width: 100%;
      transition: border-color 0.3s;

      &:focus {
        outline: none;
        border-color: #dedede;
        box-shadow: 0 0 0 2px rgba(222, 222, 222, 0.25);
      }

      &::placeholder {
        color: #666;
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
    
    select {
      appearance: none;
      background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23dedede%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
      background-repeat: no-repeat;
      background-position: right 10px top 50%;
      background-size: 12px auto;
      padding-right: 30px;
    }
  }

  // Toggle switch styles
  .s-toggle {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 24px;

    input {
      opacity: 0;
      width: 0;
      height: 0;

      &:checked + .s-toggle-slider {
        background-color: #2a9d8f;
      }

      &:checked + .s-toggle-slider:before {
        transform: translateX(26px);
      }

      &:focus + .s-toggle-slider {
        box-shadow: 0 0 1px #2a9d8f;
      }
    }

    .s-toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #444;
      transition: .4s;
      border-radius: 24px;

      &:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
      }
    }
  }
}
</style>
