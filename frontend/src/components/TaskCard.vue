<template>
  <article
    draggable="true"
    class="bg-surface rounded-lg p-4 shadow-sm border border-outline-variant/30 card-drag bouncy hover:shadow-md hover:border-primary/20 transition-all cursor-grab relative"
    :class="task.status === 'done' ? 'bg-surface/60 grayscale-[0.5] opacity-70' : ''"
    @dragstart="onDragStart"
    @dragend="$emit('dragend')"
  >
    <div class="flex justify-between items-start mb-2">
      <span :class="priorityClass">{{ task.status === 'done' ? 'Finalizado' : task.priorityLabel }}</span>
      <div class="relative">
        <button
          type="button"
          class="material-symbols-outlined text-sm text-on-surface-variant hover:text-primary transition-colors"
          aria-label="Opciones de tarea"
          aria-haspopup="menu"
          :aria-expanded="menuOpen"
          @click.stop="toggleMenu"
          @mousedown.stop
        >
          more_horiz
        </button>
        <div
          v-if="menuOpen"
          class="absolute right-0 top-7 z-20 min-w-[140px] rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-lg py-1 overflow-hidden"
          role="menu"
          @click.stop
        >
          <button
            type="button"
            class="w-full text-left px-4 py-2 text-sm font-medium text-on-surface hover:bg-surface-container-low transition-colors"
            role="menuitem"
            @click="onEdit"
          >
            Editar
          </button>
          <button
            type="button"
            class="w-full text-left px-4 py-2 text-sm font-medium text-error hover:bg-error-container transition-colors"
            role="menuitem"
            @click="onDelete"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
    <h4 class="font-bold text-on-surface mb-1" :class="task.status === 'done' ? 'line-through decoration-primary/40' : ''">
      {{ task.title }}
    </h4>
    <p
      v-if="task.description"
      class="text-sm text-on-surface-variant mb-4 leading-relaxed"
      :class="task.status === 'done' ? 'line-clamp-1' : 'line-clamp-2'"
    >
      {{ task.description }}
    </p>
    <div class="flex items-center justify-between">
      <div
        v-if="task.status === 'done'"
        class="flex items-center gap-1 text-green-600 bg-green-100 px-2 py-1 rounded-full"
      >
        <span class="material-symbols-outlined text-xs">task_alt</span>
        <span class="text-[10px] font-bold">Completado</span>
      </div>
      <div
        v-else-if="task.dueDate"
        class="flex items-center gap-1 text-on-surface-variant bg-surface-container px-2 py-1 rounded-full"
      >
        <span class="material-symbols-outlined text-xs">schedule</span>
        <span class="text-[10px] font-bold">{{ formatShortDate(task.dueDate) }}</span>
      </div>
      <div v-else class="flex items-center gap-1 text-primary bg-primary/10 px-2 py-1 rounded-full">
        <span class="material-symbols-outlined text-xs" style="font-variation-settings: 'FILL' 1;">bolt</span>
        <span class="text-[10px] font-black tracking-tighter">AHORA</span>
      </div>
      <div
        class="w-7 h-7 rounded-full bg-secondary-container flex items-center justify-center text-[10px] font-bold text-on-secondary-container border-2 border-white"
      >
        {{ assigneeInitial }}
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { formatShortDate } from '../utils/formatDate'

const props = defineProps({
  task: { type: Object, required: true },
})

const emit = defineEmits(['dragstart', 'dragend', 'edit', 'delete'])

const menuOpen = ref(false)

const PRIORITY_CLASS = {
  high: 'bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter',
  medium: 'bg-secondary-fixed text-on-secondary-fixed-variant text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter',
  low: 'bg-tertiary-fixed text-on-tertiary-fixed-variant text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter',
}

const priorityClass = computed(() => {
  if (props.task.status === 'done') {
    return 'bg-outline-variant text-on-surface-variant text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter'
  }
  return PRIORITY_CLASS[props.task.priority] || PRIORITY_CLASS.medium
})

const assigneeInitial = computed(() => {
  const id = props.task.assigneeIds?.[0] || props.task.createdBy || '?'
  return String(id).slice(0, 2).toUpperCase()
})

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
}

function onEdit() {
  closeMenu()
  emit('edit', props.task)
}

function onDelete() {
  closeMenu()
  emit('delete', props.task)
}

function onDragStart(event) {
  if (menuOpen.value) {
    event.preventDefault()
    return
  }
  emit('dragstart', props.task)
}

function onDocumentClick() {
  if (menuOpen.value) closeMenu()
}

function onKeydown(event) {
  if (event.key === 'Escape' && menuOpen.value) closeMenu()
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
  window.removeEventListener('keydown', onKeydown)
})
</script>
