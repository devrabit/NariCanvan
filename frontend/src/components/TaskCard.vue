<template>
  <article
    draggable="true"
    class="bg-surface rounded-lg p-4 shadow-sm border border-outline-variant/30 card-drag bouncy hover:shadow-md hover:border-primary/20 transition-all cursor-grab"
    :class="task.status === 'done' ? 'bg-surface/60 grayscale-[0.5] opacity-70' : ''"
    @dragstart="$emit('dragstart', task)"
    @dragend="$emit('dragend')"
  >
    <div class="flex justify-between items-start mb-2">
      <span :class="priorityClass">{{ task.status === 'done' ? 'Finalizado' : task.priorityLabel }}</span>
      <span
        class="material-symbols-outlined text-sm"
        :class="task.status === 'done' ? 'text-green-500' : 'text-on-surface-variant'"
        :style="task.status === 'done' ? { fontVariationSettings: `'FILL' 1` } : {}"
      >
        {{ task.status === 'done' ? 'check_circle' : 'more_horiz' }}
      </span>
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
import { computed } from 'vue'
import { formatShortDate } from '../utils/formatDate'

const props = defineProps({
  task: { type: Object, required: true },
})

defineEmits(['dragstart', 'dragend'])

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
</script>
