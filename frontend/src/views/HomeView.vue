<template>
  <AppLayout>
    <div class="text-center py-16">
      <h2 class="text-2xl font-semibold text-gray-800">Tablero Canvan</h2>
      <p class="text-gray-500 mt-2">Bienvenido, {{ authStore.profile?.fullName || authStore.user?.email }}</p>
      <p class="text-sm text-gray-400 mt-1">Rol: {{ authStore.profile?.role }}</p>
    </div>
  </AppLayout>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'
import AppLayout from '../components/AppLayout.vue'

const authStore = useAuthStore()
</script>
