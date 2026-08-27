<template>
  <section class="overflow-x-auto overflow-y-hidden -mx-2">
    <div class="flex gap-6 min-w-max pb-4">
      <KanbanColumn
        v-for="column in columns"
        :key="column.status"
        :column="column"
        :tasks="tasksByStatus[column.status] || []"
        @create="$emit('create', $event)"
        @drop="$emit('drop', $event)"
        @dragstart="$emit('dragstart', $event)"
        @dragend="$emit('dragend')"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import KanbanColumn from './KanbanColumn.vue'

const props = defineProps({
  tasks: { type: Array, default: () => [] },
})

defineEmits(['create', 'drop', 'dragstart', 'dragend', 'edit', 'delete'])

const columns = [
  { status: 'pending', label: 'Pendiente' },
  { status: 'in_progress', label: 'En progreso' },
  { status: 'done', label: 'Terminado' },
]

const tasksByStatus = computed(() => {
  const grouped = { pending: [], in_progress: [], done: [] }
  for (const task of props.tasks) {
    const key = grouped[task.status] ? task.status : 'pending'
    grouped[key].push(task)
  }
  return grouped
})
</script>
