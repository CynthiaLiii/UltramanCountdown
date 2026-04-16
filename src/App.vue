<template>
    <div class="relative w-full h-screen overflow-hidden bg-stone-900 flex items-center justify-center">

        <transition name="fade">
            <EntryPage v-if="view === 'entry'" @start="view = 'menu'" />
        </transition>

        <transition name="fade">
            <div v-if="view === 'menu'" class="z-50 flex flex-col gap-6 w-full max-w-xs">
                <button @click="view = 'game'" class="mission-btn bg-blue-600">
                    <span class="text-xs opacity-70">Daily Mission</span>
                    <span class="text-lg font-bold">💥擊退巴爾坦星人💥</span>
                </button>

                <button @click="view = 'aprilnotebook'" class="mission-btn bg-red-600">
                    <span class="text-xs opacity-70">April Mission</span>
                    <span class="text-lg font-bold">4月丨累積等離子能量</span>
                </button>

                <button
                        @click="handleMayClick"
                        class="mission-btn transition-all duration-500"
                        :class="isMayOpen ? 'bg-red-600' : 'bg-stone-700 grayscale cursor-not-allowed'"
                >
                    <div class="flex flex-col items-center">
                        <span class="text-xs opacity-70">May Mission</span>
                        <div class="flex items-center gap-2">
                            <span v-if="!isMayOpen" class="text-sm">🔒</span>
                            <span class="text-lg font-bold">5月丨成為超人吧</span>
                        </div>
                    </div>
                </button>
            </div>
        </transition>

        <transition name="fade">
            <WhackAMole v-if="view === 'game'" @back="view = 'menu'" />
        </transition>

        <transition name="fade">
            <AprilMission v-if="view === 'aprilnotebook'" @back="view = 'menu'" />
        </transition>

        <transition name="fade">
            <MissionNotebook v-if="view === 'notebook'" @back="view = 'menu'" />
        </transition>

        <transition name="pop">
            <div v-if="showLockAlert" class="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/60 backdrop-blur-sm" @click="showLockAlert = false">
                <div class="bg-stone-100 p-8 rounded-[2rem] border-t-8 border-red-600 max-w-[280px] w-full text-center shadow-2xl" @click.stop>
                    <p class="text-slate-800 font-bold leading-relaxed mb-6">等等等！<br>4月在光之國收集完等離子能量，5月才可以來地球變身喔</p>
                    <button @click="showLockAlert = false" class="text-red-600 font-black text-xs uppercase tracking-widest">知道了</button>
                </div>
            </div>
        </transition>

    </div>
</template>

<script setup>
    import { ref, onMounted, computed } from 'vue';
    import { missionData } from './missions.js';
    import EntryPage from './components/EntryPage.vue';
    import AprilMission from './components/AprilMission.vue';
    import MissionNotebook from './components/MissionNotebook.vue';
    import WhackAMole from './components/WhackAMole.vue';

    const view = ref('entry');
    const showLockAlert = ref(false);

    // --- 關鍵邏輯：判斷 5 月是否開放 ---
    const isMayOpen = computed(() => {
        const today = new Date();
        const month = today.getMonth() + 1;
        return month >= 5; // 如果月份大於等於 5 則開放
    });

    const handleMayClick = () => {
        if (isMayOpen.value) {
            view.value = 'notebook';
        } else {
            showLockAlert.value = true;
        }
    };
    // ----------------------------

    onMounted(() => {
        Object.values(missionData).forEach(mission => {
            if (mission.imageName) {
                const img = new Image();
                img.src = new URL(`./assets/ultramans/${mission.imageName}`, import.meta.url).href;
            }
        });
    });
</script>

<style scoped>
    /* 之前的 style 保持不變 */
    .relative { perspective: 1000px; }

    .fade-enter-active, .fade-leave-active {
        transition: all 0.5s ease;
        position: absolute;
        will-change: opacity, transform;
    }

    .fade-enter-from {
        opacity: 0;
        transform: scale(0.9) translateY(10px);
    }

    .fade-leave-to {
        opacity: 0;
        transform: scale(1.05);
    }

    .mission-btn {
        @apply flex flex-col items-center py-6 rounded-2xl text-white shadow-xl transition-all active:scale-95 hover:brightness-110;
    }

    /* 增加彈窗動畫 */
    .pop-enter-active { animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    @keyframes pop-in {
        0% { transform: scale(0.8); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
    }
</style>