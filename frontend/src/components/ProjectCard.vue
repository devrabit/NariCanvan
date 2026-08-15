<template>
  <div
    class="bg-white rounded-lg purple-shadow border border-outline-variant/30 bouncy flex flex-col justify-between relative overflow-hidden group"
    :class="featured ? 'lg:col-span-2 p-8 min-h-[320px]' : 'p-6'"
  >
    <div
      v-if="featured"
      class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:scale-150 duration-500"
    />

    <div :class="featured ? 'relative z-10' : ''">
      <div class="flex justify-between items-start" :class="featured ? 'mb-6' : 'mb-4'">
        <span :class="badgeClass">{{ project.statusLabel }}</span>
        <button type="button" class="text-on-surface-variant hover:text-primary transition-colors">
          <span class="material-symbols-outlined">{{ statusIcon }}</span>
        </button>
      </div>

      <component :is="featured ? 'h3' : 'h4'" class="font-bold text-on-surface mb-2" :class="featured ? 'text-3xl' : 'text-xl'">
        {{ project.title }}
      </component>
      <p class="text-on-surface-variant" :class="featured ? 'max-w-md' : 'text-sm'">
        {{ project.description }}
      </p>
    </div>

    <div :class="featured ? 'mt-8 relative z-10' : 'mt-6'">
      <div v-if="featured" class="flex justify-between items-center mb-2">
        <span class="text-sm font-bold">Progreso</span>
        <span class="text-sm text-primary font-bold">{{ project.progress }}%</span>
      </div>

      <div
        class="w-full bg-surface-variant rounded-full overflow-hidden"
        :class="featured ? 'h-3 mb-0' : 'h-2 mb-4'"
      >
        <div class="h-full rounded-full transition-all" :class="progressBarClass" :style="{ width: `${project.progress}%` }" />
      </div>

      <div class="flex justify-between items-center" :class="featured ? 'mt-6' : ''">
        <div v-if="project.status !== 'archived'" class="flex -space-x-2" :class="featured ? '-space-x-3' : ''">
          <div
            v-for="i in Math.min(project.memberCount, featured ? 2 : 2)"
            :key="i"
            class="rounded-full border-white bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold"
            :class="featured ? 'w-10 h-10 border-4 text-xs' : 'w-8 h-8 border-2 text-[10px]'"
          >
            {{ String.fromCharCode(64 + i) }}
          </div>
          <div
            v-if="project.memberCount > 2"
            class="rounded-full border-white bg-tertiary-container text-on-tertiary-container flex items-center justify-center font-bold"
            :class="featured ? 'w-10 h-10 border-4 text-xs' : 'w-8 h-8 border-2 text-[10px]'"
          >
            +{{ project.memberCount - 2 }}
          </div>
        </div>
        <span v-else class="text-sm font-bold text-on-surface-variant">Completado</span>

        <span class="text-sm text-on-surface-variant" :class="featured ? 'italic' : ''">
          {{ featured ? 'Última act: ' : '' }}{{ lastActivity }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatRelativeDate } from '../utils/formatDate'

const props = defineProps({
  project: { type: Object, required: true },
  featured: { type: Boolean, default: false },
})

const STATUS_CONFIG = {
  in_progress: {
    badge: 'bg-secondary-fixed text-on-secondary-fixed px-4 py-1 rounded-full text-sm font-bold',
    bar: 'bg-primary',
    icon: 'more_horiz',
  },
  review: {
    badge: 'bg-tertiary-fixed text-on-tertiary-fixed-variant px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
    bar: 'bg-tertiary',
    icon: 'cloud_done',
  },
  planning: {
    badge: 'bg-primary-fixed text-on-primary-fixed-variant px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
    bar: 'bg-primary',
    icon: 'edit_square',
  },
  archived: {
    badge: 'bg-surface-variant text-on-surface-variant px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
    bar: 'bg-on-surface-variant',
    icon: 'inventory_2',
  },
}

const config = computed(() => STATUS_CONFIG[props.project.status] || STATUS_CONFIG.in_progress)
const badgeClass = computed(() => config.value.badge)
const progressBarClass = computed(() => config.value.bar)
const statusIcon = computed(() => config.value.icon)
const lastActivity = computed(() => formatRelativeDate(props.project.lastActivityAt))
</script>
