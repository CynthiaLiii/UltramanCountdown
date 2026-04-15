<template>
    <div class="relative w-full h-screen overflow-hidden bg-stone-900 flex items-center justify-center">

        <transition name="fade">
            <EntryPage v-if="view === 'entry'" @start="view = 'menu'" />
        </transition>

        <transition name="fade">
            <div v-if="view === 'menu'" class="z-50 flex flex-col gap-6 w-full max-w-xs">
                <button @click="view = 'game'" class="mission-btn bg-blue-600">
                    <span class="text-xs opacity-70">APRIL MISSION</span>
                    <span class="text-lg font-bold">4月：打怪獸集氣任務</span>
                </button>

                <button @click="view = 'notebook'" class="mission-btn bg-red-600">
                    <span class="text-xs opacity-70">MAY MISSION</span>
                    <span class="text-lg font-bold">5月：成為超人發光發熱</span>
                </button>
            </div>
        </transition>

        <transition name="fade">
            <WhackAMole v-if="view === 'game'" @back="view = 'menu'" />
        </transition>

        <transition name="fade">
            <MissionNotebook v-if="view === 'notebook'" @back="view = 'menu'" />
        </transition>

    </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue';
    import { missionData } from './missions.js';
    import EntryPage from './components/EntryPage.vue';
    import MissionNotebook from './components/MissionNotebook.vue';
    import WhackAMole from './components/WhackAMole.vue';

    const view = ref('entry');

    onMounted(() => {
        // 預載圖片邏輯
        Object.values(missionData).forEach(mission => {
            if (mission.imageName) {
                const img = new Image();
                // 這裡的路徑要確保跟 getImageUrl 的邏輯一致
                img.src = new URL(`./assets/ultramans/${mission.imageName}`, import.meta.url).href;
            }
        });
    });
</script>

<style scoped>
    /* 讓外層容器變得很強勢，強制置中 */
    .relative {
        perspective: 1000px; /* 增加一點 3D 感，過場會更順 */
    }

    /* 修改過場動畫：確保切換時，組件不會互相推擠 */
    .fade-enter-active, .fade-leave-active {
        transition: all 0.5s ease;
        position: absolute; /* 關鍵：切換時不佔用空間，防止跳動 */
        will-change: opacity, transform;
    }

    .fade-enter-from {
        opacity: 0;
        transform: scale(0.9) translateY(10px); /* 從下方一點點淡入 */
    }

    .fade-leave-to {
        opacity: 0;
        transform: scale(1.05); /* 稍微放大淡出 */
    }

    .mission-btn {
        @apply flex flex-col items-center py-6 rounded-2xl text-white shadow-xl transition-all active:scale-95 hover:brightness-110;
    }
</style>