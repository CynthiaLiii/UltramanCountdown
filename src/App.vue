<template>
    <div class="relative w-full h-screen overflow-hidden bg-stone-900">

        <transition name="fade">
            <EntryPage v-if="!isStarted" @start="isStarted = true" />
        </transition>

        <div v-if="isStarted" class="w-full h-full flex items-center justify-center">
            <MissionNotebook />
        </div>

    </div>
</template>

<script setup>
    import { ref } from 'vue';
    import EntryPage from './components/EntryPage.vue';
    import MissionNotebook from './components/MissionNotebook.vue';

    const isStarted = ref(false);
</script>

<style>
    /* 全域動畫：如 fade 淡出動畫 */
    .fade-enter-active, .fade-leave-active {
        transition: all 0.8s ease;
    }
    .fade-leave-to {
        opacity: 0;
        transform: scale(1.05);
        filter: blur(10px);
    }
</style>