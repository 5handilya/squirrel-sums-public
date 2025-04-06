<!-- the SPA root that the router-view resides in -->

<template>
    <div id="app">
      <router-view />
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  
  export default defineComponent({
    name: 'App',
    methods: {
    },
  });
  </script>