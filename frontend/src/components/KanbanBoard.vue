<template>
  <section class="overflow-x-auto overflow-y-hidden -mx-4 px-4 md:-mx-2 md:px-0 snap-x snap-mandatory overscroll-x-contain pb-24">
    <div class="flex gap-4 md:gap-6 min-w-max">
      <KanbanColumn
        v-for="column in columns"
        :key="column.status"
        :column="column"
        :tasks="tasksByStatus[column.status] || []"
        :project-id="projectId"
        :users="users"
        @create="$emit('create', $event)"
        @drop="$emit('drop', $event)"
        @dragstart="$emit('dragstart', $event)"
        @dragend="$emit('dragend')"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
        @move="$emit('move', $event)"
        @assigned="$emit('assigned', $event)"
      />
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import KanbanColumn from './KanbanColumn.vue'

const props = defineProps({
  tasks: { type: Array, default: () => [] },
  projectId: { type: String, required: true },
  users: { type: Array, default: () => [] },
})

defineEmits(['create', 'drop', 'dragstart', 'dragend', 'edit', 'delete', 'move', 'assigned'])

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
