<template>
  <div class="relative" @mousedown.stop @click.stop>
    <button
      type="button"
      class="flex items-center gap-1 rounded-full hover:bg-surface-container transition-colors cursor-pointer"
      aria-label="Agregar responsable"
      :aria-expanded="open"
      @click="toggle"
    >
      <span class="flex items-center -space-x-2">
        <span
          v-for="item in visibleAssignees"
          :key="item.id"
          class="w-7 h-7 rounded-full bg-secondary-container flex items-center justify-center text-[10px] font-bold text-on-secondary-container border-2 border-white"
          :title="item.label"
        >
          {{ item.initials }}
        </span>
        <span
          v-if="extraCount > 0"
          class="w-7 h-7 rounded-full bg-surface-container-highest flex items-center justify-center text-[10px] font-bold text-on-surface border-2 border-white"
        >
          +{{ extraCount }}
        </span>
      </span>
      <span class="material-symbols-outlined text-base text-primary">person_add</span>
    </button>

    <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-on-surface/40"
      @click.self="close"
    >
      <div
        class="w-full max-w-md max-h-[80dvh] overflow-hidden flex flex-col bg-surface-container-lowest rounded-3xl border border-surface-container-highest shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="assignee-panel-title"
      >
        <div class="flex items-center justify-between px-6 pt-6 pb-2">
          <h2 id="assignee-panel-title" class="text-xl font-bold text-on-surface">Responsables</h2>
          <button
            type="button"
            class="w-11 h-11 flex items-center justify-center rounded-full material-symbols-outlined text-on-surface-variant hover:text-primary"
            aria-label="Cerrar"
            @click="close(true)"
          >
            close
          </button>
        </div>

        <p v-if="atLimit" class="px-6 pb-2 text-sm font-medium text-on-surface-variant">
          Máximo 20 responsables.
        </p>

        <div class="overflow-y-auto px-3 pb-4">
          <p v-if="!users.length" class="px-3 py-6 text-center text-on-surface-variant">No hay personas activas.</p>
          <button
            v-for="user in users"
            :key="user.id"
            type="button"
            class="w-full text-left px-3 py-3 min-h-11 rounded-2xl flex items-center gap-3 hover:bg-surface-container-low transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="saving || (!isAssigned(user.id) && atLimit)"
            @click="toggleUser(user)"
          >
            <span class="w-9 h-9 shrink-0 rounded-full bg-secondary-container flex items-center justify-center text-xs font-bold text-on-secondary-container">
              {{ initialsFor(user) }}
            </span>
            <span class="min-w-0 flex-1">
              <span class="block font-bold text-on-surface truncate">{{ user.fullName || user.email }}</span>
              <span class="block text-sm text-on-surface-variant truncate">{{ user.email }}</span>
            </span>
            <span
              v-if="isAssigned(user.id)"
              class="material-symbols-outlined text-primary"
              style="font-variation-settings: 'FILL' 1;"
            >
              check_circle
            </span>
          </button>
        </div>

        <p
          v-if="error"
          class="mx-6 mb-6 text-sm font-bold text-error bg-error-container px-4 py-3 rounded-full text-center"
        >
          {{ error }}
        </p>
      </div>
    </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { patchTask } from '../services/tasksService'

const props = defineProps({
  task: { type: Object, required: true },
  projectId: { type: String, required: true },
  users: { type: Array, default: () => [] },
})

const emit = defineEmits(['assigned'])

const authStore = useAuthStore()
const open = ref(false)
const saving = ref(false)
const error = ref(null)
const openedAt = ref(0)

const assigneeIds = computed(() => {
  const ids = props.task.assigneeIds
  return Array.isArray(ids) && ids.length ? ids : []
})

const atLimit = computed(() => assigneeIds.value.length >= 20)

const visibleAssignees = computed(() =>
  assigneeIds.value.slice(0, 3).map((id) => {
    const user = props.users.find((item) => item.id === id)
    return {
      id,
      label: user?.fullName || user?.email || id,
      initials: initialsFor(user, id),
    }
  }),
)

const extraCount = computed(() => Math.max(0, assigneeIds.value.length - 3))

function initialsFor(user, fallbackId = '') {
  const name = user?.fullName?.trim()
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }
  const source = user?.email || fallbackId || '?'
  return String(source).slice(0, 2).toUpperCase()
}

function isAssigned(id) {
  return assigneeIds.value.includes(id)
}

function toggle() {
  if (open.value) return
  error.value = null
  openedAt.value = Date.now()
  open.value = true
}

function close(force = false) {
  if (saving.value) return
  if (!force && Date.now() - openedAt.value < 300) return
  open.value = false
}

async function toggleUser(user) {
  if (saving.value) return
  error.value = null
  const current = assigneeIds.value
  const assigned = isAssigned(user.id)

  if (assigned && current.length <= 1) {
    error.value = 'La tarea debe tener al menos un responsable'
    return
  }
  if (!assigned && current.length >= 20) return

  const next = assigned
    ? current.filter((id) => id !== user.id)
    : [...current, user.id]

  saving.value = true
  try {
    const result = await patchTask(
      authStore.session?.access_token,
      props.projectId,
      props.task.id,
      { assigneeIds: next },
    )
    emit('assigned', result.task)
  } catch (err) {
    error.value = err.message || 'No se pudo actualizar el responsable'
  } finally {
    saving.value = false
  }
}

function onKeydown(event) {
  if (event.key === 'Escape' && open.value) close(true)
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>
