<template>
  <nav class="navbar">
    <h1 class="navbar-header">WeatherWise</h1>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const navLinks = [
    { name: 'Map', path: '/' },
    { name: 'Preparation Plan', path: '/chat' }
];

const currentPath = ref(window.location.pathname);

const updatePath = () => {
  currentPath.value = window.location.pathname;
};

onMounted(() => {
  window.addEventListener('popstate', updatePath);
});

onBeforeUnmount(() => {
  window.removeEventListener('popstate', updatePath);
});
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  padding: 1rem 2rem;
  background-color: #5CC89B;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.navbar-header {
  color: white;
  font-size: 2.5rem;      /* Bigger font size */
  font-weight: bold;      /* Bold text for emphasis */
  letter-spacing: 1.5px; /* Optional: Slight spacing between letters for better readability */
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2); /* Optional: Text shadow for depth */
  margin-bottom: 1.5rem; /* More margin to give it room to breathe */
}

.nav-item {
  margin-right: 1rem;
}

.nav-link {
  display: block;
  padding: 0.5rem 1rem;
  color: white;
  text-decoration: none;
  transition: background-color 0.3s, transform 0.2s;
  border-radius: 5px;
  font-weight: 500;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: scale(1.05);
}

.nav-link.active {
  background-color: #F27921;
}
</style>
