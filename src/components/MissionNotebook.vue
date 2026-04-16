<template>
    <div class="w-full flex flex-col items-center justify-center p-4">
        <div v-if="isFlashActive" class="fixed inset-0 z-[100] bg-white pointer-events-none animate-ultra-flash"></div>

        <div v-if="!showGame && !showSurprise" class="w-full max-w-md mb-6 flex justify-start relative z-20">
            <button @click="$emit('back')" class="text-white/40 hover:text-red-500 transition-colors font-mono text-[10px] tracking-[0.3em] uppercase p-2">
                << Back
            </button>
        </div>

        <div v-if="!showGame && !showSurprise"
             class="w-full max-w-md bg-gradient-to-b from-stone-200 to-stone-400 rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-t-4 border-red-600 relative overflow-hidden">

            <div class="absolute top-4 right-8 w-12 h-12 bg-red-600/10 rounded-full blur-xl pointer-events-none"></div>

            <div class="mb-10 text-center">
                <h2 class="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-1">地球｜與鹹蛋超人相遇</h2>
                <p class="text-[9px] text-slate-500 font-mono tracking-widest uppercase italic">Ultraman Cards</p>
            </div>

            <div class="grid grid-cols-5 gap-3">
                <div v-for="day in 11" :key="day"
                     @click="handleGridClick(day)"
                     class="group relative rounded-xl border-2 transition-all duration-300 flex items-center justify-center overflow-hidden cursor-pointer"
                     :class="[
                        getGridStyle(day),
                        day === 11 ? 'col-span-full h-24' : 'aspect-[3/4]'
                     ]">

                    <div v-if="day === 11 && isUnlocked(day)"
                         class="absolute inset-0 bg-hero-radiance animate-hero-pulse"></div>

                    <div v-if="day === 11 && isUnlocked(day)"
                         class="absolute inset-[-2px] rounded-xl animate-border-flow border-2 border-transparent z-0"></div>

                    <span class="absolute top-1.5 left-2 text-[10px] font-bold z-10" :class="isUnlocked(day) ? 'text-red-600' : 'text-slate-400'">5/{{ day }}</span>

                    <img v-if="isUnlocked(day)"
                         :src="getImageUrl(allMissions[day]?.imageName)"
                         class="animate-fade-in z-10 relative"
                         :class="day === 11 ? 'h-[85%] object-contain' : 'w-full h-full object-cover'" />

                    <div v-else-if="isToday(day)" class="flex flex-col items-center z-10">
                        <span class="text-xl animate-pulse">?</span>
                        <span class="text-[8px] font-bold text-red-600">ACTIVATE</span>
                    </div>

                    <div v-else class="opacity-20 text-xs z-10">🔒</div>
                </div>
            </div>
        </div>

        <transition name="fade">
            <div v-if="showGame" class="fixed inset-0 z-[110] bg-slate-950 flex flex-col items-center justify-center p-6">
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1e1b4b_0%,_#020617_100%)] opacity-60"></div>
                <h3 class="relative text-cyan-400 font-mono text-sm mb-2 tracking-[0.3em]">鹹蛋超人對對碰</h3>
                <p class="relative text-white/30 text-[9px] mb-8 uppercase">翻開兩兩相同的角色配對</p>
                <div class="grid grid-cols-3 gap-4 w-full max-w-xs relative">
                    <div v-for="(card, index) in gameCards" :key="index" @click="flipCard(index)" class="aspect-[3/4] relative perspective-1000 cursor-pointer">
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
                    <button @click="closeSurprise" class="px-12 py-3 bg-red-600 text-white font-bold rounded-full tracking-widest hover:bg-red-700 shadow-lg shadow-red-900/40 transition-all">Roger</button>
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
    const today = new Date();
    // 正式日期
    const currentMonth = today.getMonth() + 1;
    const currentRealDay = today.getDate();

    // 測試用日期(測完記得註解)
    // const currentMonth = 5;
    // const currentRealDay = 10;


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

    const isToday = (day) => currentMonth === 5 && day === currentRealDay;

    const isUnlocked = (day) => {
        if (currentMonth >5) return true;
        if (currentMonth < 5) return completedDays.value.includes(day);
        if (day < currentRealDay) return true;
        if (day === currentRealDay && completedDays.value.includes(day)) return true;
        return false;
    };

    const getGridStyle = (day) => {
        if (day === 11 && isUnlocked(day)) return 'border-transparent bg-[#1e1b4b] shadow-[0_0_25px_rgba(34,211,238,0.5)]';
        if (isUnlocked(day)) return 'border-white bg-white shadow-md';
        if (isToday(day)) return 'border-red-600 bg-red-50 shadow-[0_0_15px_rgba(220,38,38,0.2)] animate-pulse';
        return 'border-slate-300 bg-slate-200/40 opacity-50 cursor-pointer';
    };

    const handleGridClick = (day) => {
        selectedDay.value = day;
        const isFuture = (currentMonth < 5) || (currentMonth === 5 && day > currentRealDay);
        if (isUnlocked(day)) {
            showSurprise.value = true;
        } else if (isToday(day)) {
            setupGame();
        } else if (isFuture) {
            alertBox.value = { show: true, message: '這位鹹蛋超人還沒抵達喔' };
        } else {
            showSurprise.value = true;
        }
    };

    const setupGame = () => {
        // 1. 從 missionData 中取得所有超人的 imageName 清單
        const allHeroImages = Object.values(missionData)
            .map(m => m.imageName)
            .filter(img => img); // 確保圖片路徑存在

        // 2. 隨機洗牌並挑選前 3 張
        const selectedImages = allHeroImages
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        // 3. 加上原本固定的怪獸（可選，增加難度），或者只用超人
        // 這裡我們維持 3 種樣式（共 6 張牌）
        const deck = [...selectedImages, ...selectedImages].sort(() => Math.random() - 0.5);

        gameCards.value = deck.map(img => ({
            imageName: img,
            flipped: false,
            matched: false
        }));

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
    /* ⭐ 5/11 專屬：神聖放射光芒背景 */
    .bg-hero-radiance {
        background:
                conic-gradient(from 0deg at 50% 50%, #fff 0deg, #22d3ee 20deg, transparent 45deg, transparent 315deg, #22d3ee 340deg, #fff 360deg),
                conic-gradient(from 180deg at 50% 50%, #fff 0deg, #ef4444 20deg, transparent 45deg, transparent 315deg, #ef4444 340deg, #fff 360deg),
                #1e1b4b;
        background-blend-mode: screen;
        filter: blur(4px);
        z-index: 0;
    }

    /* 緩慢的呼吸縮放動畫 */
    @keyframes hero-pulse {
        0%, 100% { transform: scale(1); opacity: 0.6; }
        50% { transform: scale(1.05); opacity: 0.9; }
    }
    .animate-hero-pulse { animation: hero-pulse 4s ease-in-out infinite; }

    /* ⭐ 5/11 專屬：神聖流光邊框 */
    @keyframes border-flow {
        0%, 100% { border-color: #fff; box-shadow: 0 0 15px #fff; }
        50% { border-color: #22d3ee; box-shadow: 0 0 20px #22d3ee; }
    }
    .animate-border-flow { animation: border-flow 3s linear infinite; }

    /* 基礎動畫 */
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

    .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
    @keyframes fade-in {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
    }
</style>