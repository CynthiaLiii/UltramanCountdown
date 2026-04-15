<template>
    <div class="z-50 w-full max-w-sm bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#020617] rounded-[3.5rem] p-8 shadow-[0_20px_50px_rgba(30,58,138,0.5)] flex flex-col relative overflow-hidden border border-white/10">

        <div class="absolute top-[-10%] left-[-10%] w-[120%] h-[40%] bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-blue-500/20 blur-[80px] rotate-12"></div>
        <div class="absolute bottom-0 left-0 w-full h-full opacity-30 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

        <div class="relative z-10 text-center mb-10">
            <h2 class="text-white font-medium tracking-[0.6em] uppercase text-xs mb-1 opacity-60">Galaxy Path</h2>
            <div class="h-[1px] w-12 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto"></div>
        </div>

        <div class="grid grid-cols-6 gap-3 mb-10 relative z-10">
            <div v-for="day in 30" :key="day"
                 @click="handleDayClick(day)"
                 class="relative aspect-square rounded-2xl border flex items-center justify-center transition-all duration-500 backdrop-blur-md"
                 :class="getGridClass(day)">

                <span class="text-xs font-light tracking-widest">{{ day }}</span>

                <div v-if="isCollected(day)" class="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-purple-500/20 animate-pulse"></div>
                <div v-if="isToday(day) && !isCollected(day)" class="absolute inset-[-2px] border border-white/50 rounded-2xl animate-pulse"></div>
            </div>
        </div>

        <button @click="$emit('back')" class="relative z-10 w-full py-4 text-white/30 text-[10px] font-light tracking-[0.5em] hover:text-white transition-colors uppercase">
            Back to Station
        </button>

        <transition name="fade">
            <div v-if="isCollecting" class="fixed inset-0 z-[70] bg-[#020617] flex items-center justify-center overflow-hidden">
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1e1b4b_0%,_#020617_100%)]"></div>
                <div v-for="s in 20" :key="'star'+s" class="absolute w-1 h-1 bg-white rounded-full opacity-20" :style="getRandomStarPos()"></div>

                <div class="text-white/40 absolute top-20 font-light tracking-[0.4em] text-[10px] uppercase">能量共鳴中 ({{ collectedOrbs.length }}/5)</div>

                <div v-for="n in 5" :key="n">
                    <div v-if="!collectedOrbs.includes(n)"
                         @click.stop="collectOrb(n)"
                         :style="orbStyles[n-1]"
                         class="absolute w-14 h-14 rounded-full bg-gradient-to-tr from-white to-cyan-100 shadow-[0_0_40px_rgba(255,255,255,0.8),0_0_80px_rgba(34,211,238,0.4)] cursor-pointer transition-all duration-[1500ms] ease-in-out">
                        <div class="absolute inset-[-10px] rounded-full bg-cyan-400/20 animate-ping"></div>
                    </div>
                </div>

                <transition name="flash">
                    <div v-if="showReward" class="absolute inset-0 bg-white z-[80] flex items-center justify-center p-12 text-center" @click="closeReward">
                        <div class="max-w-xs animate-text-focus">
                            <p class="text-cyan-800 font-medium text-[10px] tracking-[0.5em] mb-8 uppercase">Star Energy Synced</p>
                            <h3 class="text-xl font-bold text-slate-800 mb-6 leading-relaxed">{{ aprilData[selectedDay]?.title }}</h3>
                            <p class="text-slate-500 leading-loose font-light italic text-sm">"{{ aprilData[selectedDay]?.logs }}"</p>
                            <p class="mt-16 text-slate-300 text-[9px] tracking-widest">點擊任意處收攏星光</p>
                        </div>
                    </div>
                </transition>
            </div>
        </transition>

        <transition name="pop">
            <div v-if="customAlert.show" class="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/60 backdrop-blur-sm" @click="customAlert.show = false">
                <div class="bg-[#1e1b4b] border border-white/20 p-8 rounded-[2.5rem] shadow-2xl max-w-[280px] w-full text-center relative overflow-hidden" @click.stop>
                    <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
                    <p class="text-cyan-400 font-mono text-[10px] tracking-[0.3em] mb-4 uppercase">System Notice</p>
                    <p class="text-white/90 font-light text-sm leading-relaxed mb-8">{{ customAlert.message }}</p>
                    <button @click="customAlert.show = false" class="px-8 py-2 rounded-full bg-white/10 text-white text-[10px] tracking-widest hover:bg-white/20 transition-colors">OK</button>
                </div>
            </div>
        </transition>

        <transition name="fade">
            <div v-if="viewingLog" class="fixed inset-0 z-[60] flex items-center justify-center p-10 bg-[#020617]/95 backdrop-blur-2xl" @click="viewingLog = null">
                <div class="text-center max-w-xs">
                    <div class="w-10 h-10 rounded-full bg-cyan-500/20 mx-auto mb-8 flex items-center justify-center border border-cyan-500/30">
                        <div class="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    </div>
                    <h3 class="text-white font-medium text-xl mb-6 tracking-tight">{{ aprilData[selectedDay]?.title }}</h3>
                    <p class="text-white/50 leading-loose font-light italic text-sm">"{{ aprilData[selectedDay]?.logs }}"</p>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
    import { ref, computed, onUnmounted } from 'vue';
    import { aprilData } from '../missionsApril.js';

    const emit = defineEmits(['back']);

    const currentRealDay = new Date().getDate();
    const collectedDays = ref(JSON.parse(localStorage.getItem('april_collected_days') || '[]'));
    const selectedDay = ref(0);
    const isCollecting = ref(false);
    const collectedOrbs = ref([]);
    const showReward = ref(false);
    const viewingLog = ref(false);

    // 自定義彈窗狀態
    const customAlert = ref({ show: false, message: '' });

    const orbStyles = ref(Array(5).fill({}).map(() => ({ top: '50%', left: '50%' })));
    let moveInterval = null;

    const isCollected = (day) => collectedDays.value.includes(day);
    const isToday = (day) => day === currentRealDay;

    const getGridClass = (day) => {
        if (isCollected(day)) return 'border-cyan-400/50 bg-white/5 text-cyan-200';
        if (day === currentRealDay) return 'border-white/40 bg-white/10 text-white cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.2)]';
        return 'border-white/5 bg-transparent text-white/20 cursor-pointer hover:border-white/20';
    };

    const handleDayClick = (day) => {
        selectedDay.value = day;
        if (day > currentRealDay) {
            showAlert("星路尚未交會，請耐心等待星光凝聚。");
            return;
        }
        if (isCollected(day)) {
            viewingLog.value = true;
        } else if (isToday(day)) {
            startCollection();
        } else {
            showAlert("這份能量已沉入銀河深處，明天請準時赴約。");
        }
    };

    const showAlert = (msg) => {
        customAlert.value = { show: true, message: msg };
    };

    const startCollection = () => {
        isCollecting.value = true;
        collectedOrbs.value = [];
        updateOrbPositions();
        moveInterval = setInterval(updateOrbPositions, 1500);
    };

    const updateOrbPositions = () => {
        orbStyles.value = orbStyles.value.map(() => ({
            top: Math.random() * 60 + 20 + '%',
            left: Math.random() * 60 + 20 + '%',
            transform: `scale(${Math.random() * 0.3 + 0.9})`
        }));
    };

    const collectOrb = (n) => {
        if (!collectedOrbs.value.includes(n)) {
            collectedOrbs.value.push(n);
            if (collectedOrbs.value.length === 5) finishCollection();
        }
    };

    const finishCollection = () => {
        clearInterval(moveInterval);
        if (!collectedDays.value.includes(selectedDay.value)) {
            collectedDays.value.push(selectedDay.value);
            localStorage.setItem('april_collected_days', JSON.stringify(collectedDays.value));
        }
        setTimeout(() => { showReward.value = true; }, 500);
    };

    const closeReward = () => {
        showReward.value = false;
        isCollecting.value = false;
    };

    const getRandomStarPos = () => {
        return { top: Math.random()*100+'%', left: Math.random()*100+'%', opacity: Math.random()*0.5 };
    };

    onUnmounted(() => clearInterval(moveInterval));
</script>

<style scoped>
    .fade-enter-active, .fade-leave-active { transition: opacity 1s ease; }
    .fade-enter-from, .fade-leave-to { opacity: 0; }

    .flash-enter-active { animation: flash-in 1s ease-out forwards; }
    @keyframes flash-in {
        0% { opacity: 0; filter: contrast(2); }
        100% { opacity: 1; filter: contrast(1); }
    }

    .pop-enter-active { animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    @keyframes pop-in {
        0% { transform: scale(0.9); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
    }

    @keyframes text-focus {
        0% { filter: blur(10px); opacity: 0; transform: scale(1.05); }
        100% { filter: blur(0); opacity: 1; transform: scale(1); }
    }
    .animate-text-focus { animation: text-focus 1.5s cubic-bezier(0.23, 1, 0.32, 1) both; }
</style>