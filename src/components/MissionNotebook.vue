<template>
    <div class="w-full flex flex-col items-center justify-center">

        <div v-if="isFlashActive" class="fixed inset-0 z-[100] bg-white pointer-events-none animate-ultra-flash"></div>

        <div v-if="!showSurprise" class="w-full max-w-md mb-4 flex justify-start px-2">
            <button
                    @click="$emit('back')"
                    class="group flex items-center gap-2 text-stone-400 hover:text-red-500 transition-all font-bold text-sm"
            >
                <span class="text-lg group-hover:-translate-x-1 transition-transform">←</span>
                <span>返回選單</span>
            </button>
        </div>

        <div v-if="!showSurprise"
             class="relative w-full max-w-md bg-[#FFF9F0] min-h-[85vh] rounded-r-lg shadow-2xl border-l-[15px] border-red-600 p-8 overflow-hidden transition-opacity duration-300"
             :class="{ 'opacity-0': isFlashActive }">

            <div class="absolute left-[-8px] top-0 h-full flex flex-col justify-around py-4">
                <div v-for="i in 15" :key="i" class="w-3 h-1 bg-stone-400 rounded-full shadow-inner"></div>
            </div>

            <div class="mb-8 border-b border-gray-300 pb-2 pl-2">
                <h1 class="text-2xl font-black text-gray-800 italic tracking-tighter uppercase">Ultraman Mission: May</h1>
                <p class="text-[10px] text-gray-400 font-mono uppercase tracking-widest">Earth Office / Dept. Exit</p>
            </div>

            <div class="space-y-5">
                <div class="grid grid-cols-5 gap-3">
                    <div v-for="day in 10" :key="day" @click="handleGridClick(day)"
                         class="group relative aspect-square border-2 border-gray-200 rounded-xl flex items-center justify-center bg-white cursor-pointer active:scale-95 transition-all shadow-sm hover:border-red-400 hover:shadow-md"
                         :class="[ (day < currentDay || completedDays.includes(day)) ? 'bg-stone-50' : '' ]">

                        <span class="absolute top-1.5 left-1.5 text-[10px] font-bold text-stone-300 group-hover:text-red-500 z-10">5/{{ day }}</span>

                        <img v-if="allMissions[day]?.imageName" :src="getImageUrl(allMissions[day].imageName)"
                             :alt="allMissions[day].name" class="w-[75%] h-[75%] object-contain filter transition-all"
                             :class="[ (day < currentDay || completedDays.includes(day)) ? 'grayscale opacity-30' : 'group-hover:scale-110 animate-monster-bounce' ]" />
                        <div v-else class="text-xl opacity-10">🛡️</div>

                        <div v-if="day < currentDay || completedDays.includes(day)"
                             class="absolute inset-0 flex items-center justify-center rotate-[-15deg] pointer-events-none z-10">
                            <div class="border-2 border-red-500/50 text-red-500/50 font-black px-1.5 py-0.5 text-[9px] rounded uppercase tracking-wider bg-white/80 backdrop-blur-sm">Cleared</div>
                        </div>
                    </div>
                </div>

                <div @click="handleGridClick(11)"
                     class="group relative h-36 border-4 border-double border-red-600 rounded-2xl bg-white flex items-center justify-center cursor-pointer active:scale-[0.99] transition-all shadow-xl hover:shadow-red-200/50 overflow-hidden"
                     :class="[ (11 < currentDay || completedDays.includes(11)) ? 'bg-stone-50' : '' ]">

                    <div class="absolute inset-0 opacity-[0.03] flex items-center justify-center text-6xl font-black text-red-900 rotate-12 pointer-events-none">FINAL</div>

                    <div class="flex flex-col items-center relative z-10">
                        <span class="text-[10px] font-bold text-red-600 tracking-widest bg-red-100 px-2 py-0.5 rounded-full mb-1">MAY 11 - THE FINAL DAY</span>
                        <img v-if="allMissions[11]?.imageName" :src="getImageUrl(allMissions[11].imageName)"
                             class="h-16 object-contain group-hover:scale-110 transition-transform"
                             :class="[ (11 < currentDay || completedDays.includes(11)) ? 'grayscale opacity-30' : '' ]" />
                        <div v-else class="text-5xl">🦖</div>
                        <p class="mt-2 text-sm font-black text-gray-700 tracking-wider">任務圓滿達成，獲得自由！</p>
                    </div>

                    <div v-if="11 < currentDay || completedDays.includes(11)"
                         class="absolute inset-0 flex items-center justify-center rotate-[-10deg] pointer-events-none z-10">
                        <div class="border-4 border-red-500/60 text-red-500/60 font-black px-4 py-1 text-xl rounded-xl uppercase tracking-widest bg-white/90 backdrop-blur-sm">Accomplished</div>
                    </div>
                </div>
            </div>

            <div class="absolute bottom-6 right-8 text-stone-300 font-mono text-[10px]">PG_EXIT_LOG_P.01</div>
        </div>

        <transition name="fade-overlay">
            <div v-if="showSurprise" class="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-8 overflow-hidden">
                <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950 via-black to-black opacity-80 pointer-events-none"></div>
                <div class="relative bg-white rounded-3xl p-10 w-full max-w-sm shadow-[0_0_60px_rgba(255,255,255,0.15)] text-center animate-card-appear">
                    <div class="absolute -top-5 left-1/2 -translate-x-1/2 bg-red-600 text-white font-bold px-5 py-1 rounded-full shadow-lg text-sm tracking-widest">MISSION 5/{{ selectedDay }}</div>
                    <div class="h-40 flex items-center justify-center mb-6 mt-4">
                        <img v-if="currentMission?.imageName" :src="getImageUrl(currentMission.imageName)" class="max-h-full object-contain animate-monster-bounce" />
                        <div v-else class="text-7xl">👾</div>
                    </div>
                    <h2 class="text-2xl font-extrabold text-gray-900 mb-6 tracking-tight">{{ currentMission?.name || '超人' }} 已降臨！</h2>
                    <div class="bg-stone-50 rounded-xl p-6 mb-10 border border-stone-100">
                        <p class="text-gray-700 leading-relaxed italic text-sm">"{{ surpriseContent }}"</p>
                    </div>
                    <button @click="closeSurprise" class="w-full bg-red-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-red-700 active:scale-95 transition-all tracking-wider text-lg">返回地球繼續倒數</button>
                </div>
                <div class="mt-10 text-white/30 font-mono text-xs tracking-widest animate-pulse">REMAINING DAYS: {{ 11 - selectedDay }} / LOCATION: M78_SPACE</div>
            </div>
        </transition>
    </div>
</template>

<script setup>
    import { ref, watch } from 'vue';
    import { missionData } from '../missions.js';

    // 宣告發送事件
    defineEmits(['back']);

    const isFlashActive = ref(false);
    const showSurprise = ref(false);
    const selectedDay = ref(0);
    const surpriseContent = ref('');
    const currentMission = ref(null);
    const allMissions = ref(missionData);

    const completedDays = ref(JSON.parse(localStorage.getItem('ultraman_completed_days') || '[]'));
    const today = new Date();
    const currentDay = ref(today.getMonth() === 4 ? today.getDate() : 0);

    watch(completedDays, (newVal) => {
        localStorage.setItem('ultraman_completed_days', JSON.stringify(newVal));
    }, { deep: true });

    const getImageUrl = (imageName) => {
        if (!imageName) return '';
        return new URL(`../assets/ultramans/${imageName}`, import.meta.url).href;
    };

    const handleGridClick = (day) => {
        const mission = allMissions.value[day];
        if (mission) {
            if (!completedDays.value.includes(day)) {
                completedDays.value.push(day);
            }
            currentMission.value = mission;
            selectedDay.value = day;
            surpriseContent.value = mission.content;
            isFlashActive.value = true;
            setTimeout(() => { showSurprise.value = true; }, 400);
            setTimeout(() => { isFlashActive.value = false; }, 700);
        }
    };

    const closeSurprise = () => { showSurprise.value = false; };
</script>

<style scoped>
    /* 動畫部分保持不變 */
    @keyframes ultra-flash-burst {
        0% { opacity: 0; transform: scale(0.5); }
        20% { opacity: 1; transform: scale(1); }
        40% { opacity: 0.3; }
        60% { opacity: 1; }
        100% { opacity: 0; transform: scale(1); }
    }
    .animate-ultra-flash { animation: ultra-flash-burst 0.7s ease-out forwards; }

    @keyframes card-appear {
        0% { opacity: 0; transform: translateY(30px) scale(0.9); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    .animate-card-appear { animation: card-appear 0.5s ease-out 0.2s forwards; opacity: 0; }

    @keyframes monster-bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
    }
    .animate-monster-bounce { animation: monster-bounce 3s ease-in-out infinite; }

    .fade-overlay-enter-active, .fade-overlay-leave-active { transition: opacity 0.4s ease; }
    .fade-overlay-enter-from, .fade-overlay-leave-to { opacity: 0; }
</style>