<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  /** The title text to display in the card */
  title: string
  /** Optional description text below the title */
  description?: string
  /** Optional URL for the card link */
  href?: string
  /** Additional CSS classes to apply to the card */
  classNames?: string
  /** Target attribute for the link (e.g., '_blank') */
  target?: string
  /** Rel attribute for the link (e.g., 'noopener noreferrer') */
  rel?: string
}>()

const isClickable = computed(() => !!props.href)
</script>

<template>
  <div :class="['sl-link-card', { 'cursor-pointer': isClickable }, classNames]">
    <span class="sl-flex stack">
      <a
        v-if="href"
        class="title-link"
        :href="href"
        :rel="rel"
        :target="target">
        <span class="title">{{ title }}</span>
      </a>
      <span
        v-else
        class="title">
        {{ title }}
      </span>
      <span
        v-if="description"
        class="description">
        {{ description }}
      </span>
    </span>
    <svg
      aria-hidden="true"
      class="icon"
      fill="currentColor"
      height="16"
      viewBox="0 0 24 24"
      width="16">
      <path
        d="M17.92 11.62a1.001 1.001 0 0 0-.21-.33l-5-5a1.003 1.003 0 1 0-1.42 1.42l3.3 3.29H7a1 1 0 0 0 0 2h7.59l-3.3 3.29a1.002 1.002 0 0 0 .325 1.639 1 1 0 0 0 1.095-.219l5-5a1 1 0 0 0 .21-.33 1 1 0 0 0 0-.76Z"></path>
    </svg>
  </div>
</template>

<style scoped>
.scalar-api-reference .sl-link-card {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.5rem;
  border: 1px solid var(--sl-color-gray-5);
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: var(--sl-shadow-sm);
  position: relative;
  font-family: var(--scalar-font);
  /* Each caller should set it's own margin via classNames, e.g. nb-3 */
  /* margin-bottom: 1.5rem; */
}

.scalar-api-reference .sl-link-card .sl-flex {
  display: flex;
}

.scalar-api-reference .sl-link-card .stack {
  flex-direction: column;
  gap: 0.5rem;
}

.scalar-api-reference .sl-link-card .title-link {
  text-decoration: none;
  line-height: var(--sl-line-height-headings);
  color: var(--sl-color-text-accent);
}

.scalar-api-reference .sl-link-card .title-link::before {
  content: '';
  position: absolute;
  inset: 0;
}

.scalar-api-reference .sl-link-card .title {
  color: var(--sl-color-white);
  font-weight: 600;
  font-size: var(--sl-text-lg);
}

.scalar-api-reference .sl-link-card .description {
  color: var(--sl-color-gray-3);
  line-height: 1.5;
  font-size: var(--sl-text-base);
}
.scalar-api-reference .sl-link-card:hover,
.scalar-api-reference .sl-link-card:hover {
  border-color: var(--sl-color-white);
  background: var(--sl-color-gray-7, var(--sl-color-gray-6));
}

.scalar-api-reference .sl-link-card.sl-link-card-small .title {
  font-size: var(--sl-text-sm);
  color: var(--sl-color-gray-3);
}
.scalar-api-reference .sl-link-card.sl-link-card-small .description {
  font-size: var(--sl-text-xs);
  color: var(--sl-color-gray-3);
}
.scalar-api-reference .sl-link-card.sl-link-card-small:hover .title,
.scalar-api-reference .sl-link-card.sl-link-card-small:hover .description {
  color: var(--sl-color-white);
}

.scalar-api-reference .sl-link-card .icon {
  color: var(--sl-color-gray-3);
  font-size: 1.333rem;
  width: 1em;
  height: 1em;
}
</style>
