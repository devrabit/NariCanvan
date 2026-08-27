<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { createTask } from '../services/tasksService'

const props = defineProps({
  open: { type: Boolean, default: false },
  projectId: { type: String, default: '' },
  defaultStatus: { type: String, default: 'pending' },
})

const emit = defineEmits(['close', 'created'])

const authStore = useAuthStore()

const title = ref('')
const description = ref('')
const dueDate = ref('')
const priority = ref('medium')
const submitting = ref(false)
const error = ref(null)
const fieldErrors = ref({})

const isDirty = computed(() =>
  Boolean(title.value.trim() || description.value.trim() || dueDate.value || priority.value !== 'medium'),
)

function resetForm() {
  title.value = ''
  description.value = ''
  dueDate.value = ''
  priority.value = 'medium'
  submitting.value = false
  error.value = null
  fieldErrors.value = {}
}

function requestClose() {
  if (submitting.value) return
  if (isDirty.value && !window.confirm('¿Descartar cambios?')) return
  emit('close')
}

function validate() {
  const fields = {}
  if (!title.value.trim()) fields.title = 'El título es obligatorio'
  else if (title.value.trim().length > 120) fields.title = 'Máximo 120 caracteres'
  if (description.value.trim().length > 500) fields.description = 'Máximo 500 caracteres'
  fieldErrors.value = fields
  return Object.keys(fields).length === 0
}

async function handleSubmit() {
  error.value = null
  if (!validate()) return
  submitting.value = true
  try {
    const result = await createTask(authStore.session?.access_token, props.projectId, {
      title: title.value.trim(),
      description: description.value.trim(),
      dueDate: dueDate.value || null,
      priority: priority.value,
      status: props.defaultStatus,
    })
    emit('created', result.task)
    resetForm()
    emit('close')
  } catch (err) {
    error.value = err.message || 'Error al crear la tarea'
    if (err.fields) fieldErrors.value = err.fields
  } finally {
    submitting.value = false
  }
}

function onKeydown(event) {
  if (!props.open) return
  if (event.key === 'Escape') {
    event.preventDefault()
    requestClose()
  }
}

watch(
  () => props.open,
  (open) => {
    if (open) resetForm()
  },
)

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm"
    @click.self="requestClose"
  >
    <div
      class="w-full max-w-lg bg-surface-container-lowest rounded-3xl overflow-hidden tinted-shadow-primary border border-surface-container-highest"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-task-title"
    >
      <div class="flex items-center justify-between px-6 pt-6 pb-2">
        <h2 id="create-task-title" class="text-2xl font-bold text-primary tracking-tight">
          Nueva tarea
        </h2>
        <button
          type="button"
          class="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors"
          aria-label="Cerrar"
          @click="requestClose"
        >
          close
        </button>
      </div>

      <form class="p-6 space-y-4" @submit.prevent="handleSubmit">
        <div class="space-y-1">
          <label class="text-sm font-bold text-on-surface-variant px-1" for="task-title">Título</label>
          <input
            id="task-title"
            v-model="title"
            type="text"
            maxlength="120"
            placeholder="Ej. Diseñar Hero Section"
            class="w-full px-4 py-3 bg-surface-container-low border-none rounded-full text-on-surface focus:ring-2 focus:ring-primary/50 transition-all outline-none"
            :disabled="submitting"
          />
          <p v-if="fieldErrors.title" class="text-sm text-error px-1">{{ fieldErrors.title }}</p>
        </div>

        <div class="space-y-1">
          <label class="text-sm font-bold text-on-surface-variant px-1" for="task-description">Descripción</label>
          <textarea
            id="task-description"
            v-model="description"
            rows="3"
            maxlength="500"
            placeholder="Detalles opcionales..."
            class="w-full px-4 py-3 bg-surface-container-low border-none rounded-xl text-on-surface focus:ring-2 focus:ring-primary/50 transition-all outline-none resize-none"
            :disabled="submitting"
          />
          <p v-if="fieldErrors.description" class="text-sm text-error px-1">{{ fieldErrors.description }}</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1">
            <label class="text-sm font-bold text-on-surface-variant px-1" for="task-due-date">Fecha límite</label>
            <input
              id="task-due-date"
              v-model="dueDate"
              type="date"
              class="w-full px-4 py-3 bg-surface-container-low border-none rounded-full text-on-surface focus:ring-2 focus:ring-primary/50 transition-all outline-none"
              :disabled="submitting"
            />
          </div>
          <div class="space-y-1">
            <label class="text-sm font-bold text-on-surface-variant px-1" for="task-priority">Prioridad</label>
            <select
              id="task-priority"
              v-model="priority"
              class="w-full px-4 py-3 bg-surface-container-low border-none rounded-full text-on-surface focus:ring-2 focus:ring-primary/50 transition-all outline-none"
              :disabled="submitting"
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>
        </div>

        <p
          v-if="error"
          class="text-sm font-bold text-error bg-error-container px-4 py-3 rounded-full text-center"
        >
          {{ error }}
        </p>
      </form>

      <div class="p-6 bg-surface-container-low flex flex-col-reverse sm:flex-row gap-3 justify-end">
        <button
          type="button"
          class="px-6 py-3 rounded-full font-bold text-primary border-2 border-primary hover:bg-primary/5 transition-colors bouncy"
          :disabled="submitting"
          @click="requestClose"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="px-6 py-3 rounded-full font-bold bg-primary text-on-primary pink-shadow hover:brightness-110 transition-all bouncy disabled:opacity-50"
          :disabled="submitting"
          @click="handleSubmit"
        >
          {{ submitting ? 'Creando…' : 'Crear tarea' }}
        </button>
      </div>
    </div>
  </div>
</template>
