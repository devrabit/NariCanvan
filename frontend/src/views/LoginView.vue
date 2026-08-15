<template>
  <div
    class="min-h-screen flex flex-col bg-background selection:bg-primary-fixed selection:text-on-primary-fixed"
    @mousemove="handleMouseMove"
  >
    <main class="flex-grow flex items-center justify-center relative px-6 py-12 overflow-hidden">
      <!-- Animated background -->
      <div class="absolute inset-0 z-0 pointer-events-none">
        <div
          class="floating-shape absolute top-20 left-10 w-32 h-32 bg-primary-fixed rounded-full opacity-40 blur-xl"
          :style="shapeStyle(0)"
        />
        <div
          class="floating-shape absolute bottom-40 right-10 w-48 h-48 bg-secondary-container rounded-full opacity-50 blur-2xl"
          :style="{ ...shapeStyle(1), animationDelay: '-2s' }"
        />
        <div
          class="floating-shape absolute top-1/2 left-1/4 w-24 h-24 bg-tertiary-fixed rounded-full opacity-30 blur-lg"
          :style="{ ...shapeStyle(2), animationDelay: '-4s' }"
        />
      </div>

      <div class="w-full max-w-md z-10">
        <!-- Brand -->
        <div class="text-center mb-8">
          <h1 class="text-4xl font-black text-on-surface tracking-tight mb-2">
            <span class="text-on-surface">Nari</span><span class="text-primary">Board</span>
          </h1>
          <p class="text-on-surface-variant font-medium">Keep it sweet.</p>
        </div>

        <!-- Card -->
        <div class="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-10 tinted-shadow-primary relative overflow-hidden">
          <div class="absolute top-0 right-0 w-24 h-24 bg-primary-fixed rounded-bl-full opacity-10" />

          <div class="relative z-10">
            <header class="mb-8">
              <h2 class="text-2xl font-bold text-on-surface mb-2 tracking-tight">¡Hola de nuevo!</h2>
              <p class="text-on-surface-variant text-sm">Entra para gestionar tus proyectos con alegría.</p>
            </header>

            <form class="space-y-5" @submit.prevent="handleSubmit">
              <div class="space-y-2">
                <label
                  for="email"
                  class="block text-sm font-bold text-on-surface-variant ml-4 transition-colors duration-300"
                  :class="{ 'text-primary': focusedField === 'email' }"
                >
                  Correo electrónico
                </label>
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  required
                  autocomplete="email"
                  placeholder="nombre@ejemplo.com"
                  class="w-full px-6 py-4 rounded-full bg-surface-container border-none focus:ring-4 focus:ring-primary-fixed text-on-surface placeholder:text-outline transition-all duration-300 outline-none"
                  @focus="focusedField = 'email'"
                  @blur="focusedField = null"
                />
              </div>

              <div class="space-y-2">
                <label
                  for="password"
                  class="block text-sm font-bold text-on-surface-variant ml-4 transition-colors duration-300"
                  :class="{ 'text-primary': focusedField === 'password' }"
                >
                  Contraseña
                </label>
                <input
                  id="password"
                  v-model="password"
                  type="password"
                  required
                  minlength="6"
                  autocomplete="current-password"
                  placeholder="••••••••"
                  class="w-full px-6 py-4 rounded-full bg-surface-container border-none focus:ring-4 focus:ring-primary-fixed text-on-surface placeholder:text-outline transition-all duration-300 outline-none"
                  @focus="focusedField = 'password'"
                  @blur="focusedField = null"
                />
              </div>

              <p
                v-if="authStore.error"
                class="text-sm font-bold text-error bg-error-container px-4 py-3 rounded-full text-center"
              >
                {{ authStore.error }}
              </p>

              <div class="flex justify-end pr-2">
                <a
                  href="#"
                  class="text-sm font-bold text-tertiary hover:text-surface-tint transition-colors underline decoration-2 underline-offset-4"
                  @click.prevent
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <button
                type="submit"
                :disabled="authStore.loading"
                class="w-full py-4 rounded-full bg-primary text-on-primary font-bold text-lg bouncy-hover bouncy-click tinted-shadow-primary transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ authStore.loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
                <span class="material-symbols-outlined filled">arrow_forward</span>
              </button>
            </form>
          </div>
        </div>

        <div class="text-center mt-8">
          <p class="text-on-surface-variant font-medium">
            ¿No tienes cuenta?
            <a
              href="#"
              class="text-primary font-bold hover:underline underline-offset-4 decoration-2"
              @click.prevent
            >
              Regístrate
            </a>
          </p>
        </div>
      </div>
    </main>

    <footer class="w-full py-8 flex flex-col items-center gap-4 bg-transparent">
      <div class="flex gap-6">
        <a href="#" class="text-on-surface-variant font-body text-sm hover:text-primary transition-colors duration-200" @click.prevent>Privacy</a>
        <a href="#" class="text-on-surface-variant font-body text-sm hover:text-primary transition-colors duration-200" @click.prevent>Terms</a>
        <a href="#" class="text-on-surface-variant font-body text-sm hover:text-primary transition-colors duration-200" @click.prevent>Support</a>
      </div>
      <div class="font-headline font-bold text-primary">NariBoard</div>
      <p class="font-body text-sm text-on-surface-variant">© 2024 NariBoard. Keep it sweet.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const focusedField = ref(null)
const parallax = ref({ x: 0, y: 0 })

function handleMouseMove(event) {
  parallax.value = {
    x: (event.clientX / window.innerWidth) - 0.5,
    y: (event.clientY / window.innerHeight) - 0.5,
  }
}

function shapeStyle(index) {
  const speed = (index + 1) * 20
  return {
    transform: `translate(${parallax.value.x * speed}px, ${parallax.value.y * speed}px)`,
  }
}

async function handleSubmit() {
  const success = await authStore.login(email.value, password.value)
  if (success) {
    router.push({ name: 'dashboard' })
  }
}
</script>
