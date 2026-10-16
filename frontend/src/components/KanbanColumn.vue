<template>
  <div
    class="w-[min(20rem,85vw)] shrink-0 snap-start flex flex-col bg-surface-container-low/50 rounded-xl p-4 min-h-[60vh] md:min-h-[calc(100vh-12rem)]"
    :class="isOver ? 'ring-2 ring-primary/40' : ''"
    @dragover.prevent="isOver = true"
    @dragleave="isOver = false"
    @drop.prevent="onDrop"
  >
    <div class="flex items-center justify-between mb-4 px-2">
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full" :class="dotClass" />
        <h3 class="font-bold text-on-surface">{{ column.label }}</h3>
        <span class="bg-surface-container-highest px-2 py-0.5 rounded-full text-xs font-bold">
          {{ tasks.length }}
        </span>
      </div>
      <button
        type="button"
        class="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors"
        :aria-label="column.status === 'done' ? 'Columna terminada' : 'Crear tarea'"
        @click="$emit('create', column.status)"
      >
        {{ column.status === 'done' ? 'check_circle' : 'add_circle' }}
      </button>
    </div>

    <div class="flex-grow space-y-4 overflow-y-auto pr-1 custom-scrollbar">
      <TaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        :project-id="projectId"
        :users="users"
        @dragstart="$emit('dragstart', $event)"
        @dragend="$emit('dragend')"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
        @move="$emit('move', $event)"
        @assigned="$emit('assigned', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import TaskCard from './TaskCard.vue'

const props = defineProps({
  column: { type: Object, required: true },
  tasks: { type: Array, default: () => [] },
  projectId: { type: String, required: true },
  users: { type: Array, default: () => [] },
})

const emit = defineEmits(['create', 'drop', 'dragstart', 'dragend', 'edit', 'delete', 'move', 'assigned'])

const isOver = ref(false)

const DOT = {
  pending: 'bg-secondary',
  in_progress: 'bg-tertiary',
  done: 'bg-green-500',
}

const dotClass = computed(() => DOT[props.column.status] || 'bg-secondary')

function onDrop() {
  isOver.value = false
  emit('drop', props.column.status)
}
</script>
