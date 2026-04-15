<template>
    <div class="w-full flex flex-col items-center justify-center p-4">
        <div v-if="isFlashActive" class="fixed inset-0 z-[100] bg-white pointer-events-none animate-ultra-flash"></div>

        <div v-if="!showGame && !showSurprise" class="w-full max-w-md mb-6 flex justify-start">
            <button @click="$emit('back')" class="text-white/40 hover:text-red-500 transition-colors font-mono text-[10px] tracking-[0.3em] uppercase">
                << System_Back
            </button>
        </div>

        <div v-if="!showGame && !showSurprise"
             class="w-full max-w-md bg-gradient-to-b from-stone-200 to-stone-400 rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-t-4 border-red-600 relative overflow-hidden">

            <div class="absolute top-4 right-8 w-12 h-12 bg-red-600/10 rounded-full blur-xl"></div>

            <div class="mb-10 text-center">
                <h2 class="text-2xl font-black text-slate-900 italic tracking-tighter uppercase mb-1">Hero Activation</h2>
                <p class="text-[9px] text-slate-500 font-mono tracking-widest uppercase italic">May_Mission / Security_Level_S</p>
            </div>

            <div class="grid grid-cols-5 gap-3">
                <div v-for="day in 11" :key="day"
                     @click="handleGridClick(day)"
                     class="group relative rounded-xl border-2 transition-all duration-300 flex items-center justify-center overflow-hidden cursor-pointer"
                     :class="[
                        getGridStyle(day),
                        day === 11 ? 'col-span-full h-24' : 'aspect-[3/4]'
                     ]">

                    <span class="absolute top-1.5 left-2 text-[10px] font-bold z-10" :class="isUnlocked(day) ? 'text-red-600' : 'text-slate-400'">5/{{ day }}</span>

                    <img v-if="isUnlocked(day)"
                         :src="getImageUrl(allMissions[day]?.imageName)"
                         class="w-full h-full object-cover animate-fade-in" />

                    <div v-else-if="isToday(day)" class="flex flex-col items-center">
                        <span class="text-xl animate-pulse">?</span>
                        <span class="text-[8px] font-bold text-red-600">ACTIVATE</span>
                    </div>

                    <div v-else class="opacity-20 text-xs">🔒</div>
                </div>
            </div>
        </div>

        <transition name="fade">
            <div v-if="showGame" class="fixed inset-0 z-[110] bg-slate-950 flex flex-col items-center justify-center p-6">
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1e1b4b_0%,_#020617_100%)] opacity-60"></div>
                <h3 class="relative text-cyan-400 font-mono text-sm mb-2 tracking-[0.3em]">HERO_MATCHING_TEST</h3>
                <p class="relative text-white/30 text-[9px] mb-8 uppercase">翻開兩兩相同的英雄徽章以同步能量</p>

                <div class="grid grid-cols-3 gap-4 w-full max-w-xs relative">
                    <div v-for="(card, index) in gameCards" :key="index"
                         @click="flipCard(index)"
                         class="aspect-[3/4] relative perspective-1000 cursor-pointer">
                        <div class="w-full h-full transition-all duration-500 preserve-3d" :class="{ 'rotate-y-180': card.flipped || card.matched }">
                            <div class="absolute inset-0 bg-gradient-to-br from-red-700 to-red-900 rounded-xl border-2 border-white/20 flex items-center justify-center backface-hidden shadow-xl">
                                <div class="w-8 h-8 border border-white/30 rounded-full flex items-center justify-center">
                                    <div class="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                                </div>
                            </div>
                            <div class="absolute inset-0 bg-white rounded-xl border-2 border-red-500 rotate-y-180 backface-hidden flex items-center justify-center p-2">
                                <img :src="getImageUrl(card.imageName)" class="w-full h-full object-contain" />
                            </div>
                        </div>
                    </div>
                </div>
                <button @click="showGame = false" class="mt-12 text-white/20 text-[10px] uppercase tracking-[0.4em] hover:text-white transition-colors">Abort_Mission</button>
            </div>
        </transition>

        <transition name="fade-overlay">
            <div v-if="showSurprise" class="fixed inset-0 z-[120] bg-slate-950/95 flex flex-col items-center justify-center p-8 text-center" @click="closeSurprise">
                <div class="relative max-w-sm w-full animate-card-appear" @click.stop>
                    <div class="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 bg-red-600 rounded-full blur-[80px] opacity-20"></div>
                    <img :src="getImageUrl(allMissions[selectedDay]?.imageName)" class="h-64 mx-auto mb-8 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]" />
                    <h3 class="text-white font-black text-2xl italic mb-2 tracking-tighter uppercase">{{ allMissions[selectedDay]?.name }}</h3>
                    <div class="h-1 w-12 bg-red-600 mx-auto mb-6"></div>
                    <p class="text-red-100/80 leading-loose font-medium italic mb-10 text-lg">"{{ allMissions[selectedDay]?.content }}"</p>
                    <button @click="closeSurprise" class="px-12 py-3 bg-red-600 text-white font-bold rounded-full tracking-widest hover:bg-red-700 shadow-lg shadow-red-900/40 transition-all">Roger_</button>
                </div>
            </div>
        </transition>

        <transition name="pop">
            <div v-if="alertBox.show" class="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-black/60 backdrop-blur-sm" @click="alertBox.show = false">
                <div class="bg-stone-100 p-8 rounded-[2.5rem] border-t-8 border-red-600 max-w-[280px] w-full text-center shadow-2xl relative overflow-hidden" @click.stop>
                    <p class="text-slate-800 font-bold leading-relaxed mb-8">{{ alertBox.message }}</p>
                    <button @click="alertBox.show = false" class="px-8 py-2 rounded-full bg-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">Understand</button>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
    import { ref, watch } from 'vue';
    import { missionData } from '../missions.js';

    const emit = defineEmits(['back']);

    // 日期判定邏輯
    const today = new Date();
    // 測試用
    const currentMonth = 5;
    const currentRealDay = 1;
    //正式用
    // const currentMonth = today.getMonth() + 1; // 1-12
    // const currentRealDay = today.getDate();


    const completedDays = ref(JSON.parse(localStorage.getItem('ultraman_completed_days') || '[]'));
    const allMissions = ref(missionData);
    const isFlashActive = ref(false);
    const showSurprise = ref(false);
    const showGame = ref(false);
    const selectedDay = ref(0);
    const alertBox = ref({ show: false, message: '' });

    const gameCards = ref([]);
    const flippedCards = ref([]);

    watch(completedDays, (newVal) => {
        localStorage.setItem('ultraman_completed_days', JSON.stringify(newVal));
    }, { deep: true });

    const getImageUrl = (imageName) => {
        if (!imageName) return '';
        return new URL(`../assets/ultramans/${imageName}`, import.meta.url).href;
    };

    // 核心解鎖邏輯修正
    const isToday = (day) => currentMonth === 5 && day === currentRealDay;

    const isUnlocked = (day) => {
        // 1. 如果已經過 5 月了，全部解鎖
        if (currentMonth > 5) return true;
        // 2. 如果還沒到 5 月，全部不顯示超人 (除非已完成)
        if (currentMonth < 5) return completedDays.value.includes(day);

        // 3. 現在正是 5 月：
        if (day < currentRealDay) return true; // 已經過的日期直接顯示
        if (day === currentRealDay && completedDays.value.includes(day)) return true; // 今天玩完才解鎖
        return false;
    };

    const getGridStyle = (day) => {
        if (isUnlocked(day)) return 'border-white bg-white shadow-md';
        if (isToday(day)) return 'border-red-600 bg-red-50 shadow-[0_0_15px_rgba(220,38,38,0.2)] animate-pulse';
        return 'border-slate-300 bg-slate-200/40 opacity-50 cursor-pointer';
    };

    const handleGridClick = (day) => {
        selectedDay.value = day;

        // 判定是否為未來
        const isFuture = (currentMonth < 5) || (currentMonth === 5 && day > currentRealDay);

        if (isUnlocked(day)) {
            showSurprise.value = true;
        } else if (isToday(day)) {
            setupGame();
        } else if (isFuture) {
            alertBox.value = { show: true, message: '英雄尚未抵達，請耐心等待訊號發射。' };
        } else {
            // 這邊處理「5月內但沒玩到」的邏輯，依照妳的要求，沒玩到但過了直接顯示 (由 isUnlocked 處理了)
            showSurprise.value = true;
        }
    };

    const setupGame = () => {
        // 隨機選三個超人做配對 (6張牌)
        const images = ['Baltan.png', 'Pigmon.png', 'Logo.png'];
        const deck = [...images, ...images].sort(() => Math.random() - 0.5);
        gameCards.value = deck.map(img => ({ imageName: img, flipped: false, matched: false }));
        showGame.value = true;
    };

    const flipCard = (index) => {
        if (flippedCards.value.length === 2 || gameCards.value[index].flipped || gameCards.value[index].matched) return;
        gameCards.value[index].flipped = true;
        flippedCards.value.push(index);
        if (flippedCards.value.length === 2) {
            const [i1, i2] = flippedCards.value;
            if (gameCards.value[i1].imageName === gameCards.value[i2].imageName) {
                gameCards.value[i1].matched = true;
                gameCards.value[i2].matched = true;
                flippedCards.value = [];
                if (gameCards.value.every(c => c.matched)) {
                    setTimeout(() => {
                        showGame.value = false;
                        if (!completedDays.value.includes(selectedDay.value)) completedDays.value.push(selectedDay.value);
                        isFlashActive.value = true;
                        setTimeout(() => { showSurprise.value = true; isFlashActive.value = false; }, 500);
                    }, 800);
                }
            } else {
                setTimeout(() => {
                    gameCards.value[i1].flipped = false;
                    gameCards.value[i2].flipped = false;
                    flippedCards.value = [];
                }, 800);
            }
        }
    };

    const closeSurprise = () => { showSurprise.value = false; };
</script>

<style scoped>
    .perspective-1000 { perspective: 1000px; }
    .preserve-3d { transform-style: preserve-3d; }
    .backface-hidden { backface-visibility: hidden; }
    .rotate-y-180 { transform: rotateY(180deg); }

    @keyframes ultra-flash-burst {
        0% { opacity: 0; }
        20% { opacity: 1; }
        100% { opacity: 0; }
    }
    .animate-ultra-flash { animation: ultra-flash-burst 0.7s ease-out forwards; }

    @keyframes card-appear {
        0% { opacity: 0; transform: translateY(30px) scale(0.9); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    .animate-card-appear { animation: card-appear 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards; }

    .pop-enter-active { animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    @keyframes pop-in {
        0% { transform: scale(0.8); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
    }

    .fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
    .fade-enter-from, .fade-leave-to { opacity: 0; }
</style>