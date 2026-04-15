<template>
    <div class="z-50 w-full max-w-sm bg-slate-900 border-2 border-slate-700 rounded-[2.5rem] p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] text-center flex flex-col max-h-[95vh] relative overflow-hidden">

        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>

        <div class="mb-6">
            <div class="flex justify-between items-end mb-1 px-1">
                <span class="text-[10px] text-blue-400 font-mono tracking-widest uppercase">Global Defense Progress</span>
                <span class="text-blue-400 font-mono text-xs">{{ (totalAccumulatedScore / 100).toFixed(1) }}%</span>
            </div>
            <div class="h-3 w-full bg-slate-800 rounded-full border border-slate-700 overflow-hidden p-[2px]">
                <div class="h-full bg-gradient-to-r from-blue-600 to-cyan-400 shadow-[0_0_10px_#22d3ee] transition-all duration-1000"
                     :style="{ width: (totalAccumulatedScore / 100) + '%' }"></div>
            </div>
            <p class="text-[9px] text-slate-500 mt-1 font-mono uppercase italic">Target: 10,000 Energy Units</p>
        </div>

        <div class="flex justify-between items-center mb-4 bg-slate-800/50 rounded-xl p-3 border border-slate-700">
            <div class="text-left">
                <p class="text-[9px] text-slate-400 uppercase font-bold">Combat Score</p>
                <p class="text-3xl font-mono font-black text-white" :class="{'animate-pulse text-red-500': isHittingWrong}">{{ score }}</p>
            </div>
            <div class="text-right">
                <p class="text-[9px] text-slate-400 uppercase font-bold">Today's Cap</p>
                <p class="text-lg font-mono text-blue-400">{{ todayContribution }}/500</p>
            </div>
        </div>

        <div class="grid grid-cols-3 gap-3 bg-slate-950 p-4 rounded-3xl border border-slate-800 relative mx-auto w-full max-w-[280px] shadow-inner">
            <div v-for="(hole, index) in 9" :key="index"
                 @mousedown.prevent="hit(index)"
                 @touchstart.prevent="hit(index)"
                 class="aspect-square bg-slate-900 rounded-2xl relative overflow-hidden cursor-pointer border border-slate-800/50 active:bg-blue-900/20 transition-colors">

                <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/5 to-transparent"></div>

                <transition name="mole">
                    <div v-if="activeHole === index" class="absolute inset-0 flex items-center justify-center p-2 pointer-events-none">
                        <img :src="getMonsterUrl(currentRole)" class="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]" />
                        <div v-if="hitFeedback" class="absolute -top-1 font-black animate-bounce text-sm z-20" :class="hitFeedback.color">
                            {{ hitFeedback.text }}
                        </div>
                    </div>
                </transition>
            </div>
        </div>

        <div class="mt-6 flex flex-col gap-3">
            <button v-if="!isPlaying" @click="startGame"
                    class="w-full bg-blue-700 hover:bg-blue-600 text-white py-4 rounded-2xl font-black text-xl shadow-[0_4px_0_rgb(29,78,216)] active:translate-y-1 active:shadow-none transition-all uppercase tracking-widest border-b-4 border-blue-900">
                Execute Mission
            </button>
            <div v-else class="text-[10px] text-blue-400 animate-pulse font-mono tracking-[0.2em] uppercase">
                Time Remaining: {{ timeLeft }}s
            </div>
            <button @click="$emit('back')" class="text-slate-500 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">Abort Terminal</button>
        </div>

        <transition name="fade">
            <div v-if="showCoupon" class="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
                <div class="bg-white rounded-3xl p-1 overflow-hidden max-w-xs w-full shadow-[0_0_50px_rgba(34,211,238,0.5)] animate-coupon-pop">
                    <div class="border-2 border-dashed border-slate-200 rounded-[1.4rem] p-6 text-slate-800 relative">
                        <div class="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-950 rounded-full"></div>
                        <div class="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-950 rounded-full"></div>

                        <div class="text-center">
                            <p class="text-blue-600 font-black text-xs tracking-widest mb-1 uppercase">Mission Accomplished</p>
                            <h3 class="text-2xl font-black italic mb-4">禮物兌換券</h3>
                            <div class="bg-slate-50 border-y-2 border-slate-100 py-4 mb-4">
                                <p class="text-sm font-medium text-slate-600">恭喜擊退巴爾坦星人</p>
                                <p class="text-lg font-bold text-slate-900 mt-1">憑此券解鎖阿昕特殊服裝</p>
                            </div>
                            <p class="text-[10px] text-slate-400 font-mono mb-6 italic">SERIAL: SSSP-2026-HERO</p>
                            <button @click="showCoupon = false" class="w-full bg-slate-900 text-white py-3 rounded-xl font-bold">記得截圖再關閉喔！</button>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue';

    const emit = defineEmits(['back']);

    const score = ref(0);
    const timeLeft = ref(20);
    const activeHole = ref(null);
    const currentRole = ref('');
    const isPlaying = ref(false);
    const isHittingWrong = ref(false);
    const hitFeedback = ref(null);
    const currentSpawnId = ref(0);
    const showCoupon = ref(false);

    // 累積與今日上限數據
    const totalAccumulatedScore = ref(parseInt(localStorage.getItem('total_accumulated_score') || '0'));
    const todayContribution = ref(parseInt(localStorage.getItem('today_contribution_score') || '0'));
    const lastUpdateDate = ref(localStorage.getItem('last_contribution_date') || '');
    const highScore = ref(parseInt(localStorage.getItem('mole_high_score') || '0'));

    onMounted(() => {
        // 檢查是否換天，換天則重置今日貢獻值
        const today = new Date().toDateString();
        if (lastUpdateDate.value !== today) {
            todayContribution.value = 0;
            localStorage.setItem('today_contribution_score', '0');
            localStorage.setItem('last_contribution_date', today);
        }
    });

    const getMonsterUrl = (name) => new URL(`../assets/ultramans/${name}.png`, import.meta.url).href;

    const startGame = () => {
        score.value = 0;
        timeLeft.value = 20;
        isPlaying.value = true;
        runGameLoop();

        const countdown = setInterval(() => {
            timeLeft.value--;
            if (timeLeft.value <= 0) {
                clearInterval(countdown);
                endGame();
            }
        }, 1000);
    };

    const runGameLoop = () => {
        if (!isPlaying.value) return;
        const localSpawnId = Date.now() + Math.random();
        currentSpawnId.value = localSpawnId;
        activeHole.value = Math.floor(Math.random() * 9);
        currentRole.value = Math.random() > 0.25 ? 'Baltan' : 'Pigmon';
        const speed = Math.max(400, 750 - (20 - timeLeft.value) * 25);
        setTimeout(() => {
            if (currentSpawnId.value === localSpawnId) activeHole.value = null;
            if (isPlaying.value) setTimeout(runGameLoop, Math.max(50, 150 - (20 - timeLeft.value) * 5));
        }, speed);
    };

    const hit = (index) => {
        if (activeHole.value === null || activeHole.value !== index || !isPlaying.value) return;
        if (currentRole.value === 'Baltan') {
            score.value += 10;
            showFeedback("+10", "text-blue-400");
        } else {
            score.value = Math.max(0, score.value - 20);
            isHittingWrong.value = true;
            showFeedback("-20", "text-red-500");
            setTimeout(() => isHittingWrong.value = false, 300);
        }
        activeHole.value = null;
        currentSpawnId.value = 0;
    };

    const showFeedback = (text, color) => {
        hitFeedback.value = { text, color };
        setTimeout(() => hitFeedback.value = null, 300);
    };

    const endGame = () => {
        isPlaying.value = false;

        // 計算本次遊戲對累積進度的貢獻
        const remainingCap = 500 - todayContribution.value;
        const actualContribution = Math.min(score.value, remainingCap > 0 ? remainingCap : 0);

        if (actualContribution > 0) {
            todayContribution.value += actualContribution;
            totalAccumulatedScore.value += actualContribution;

            localStorage.setItem('today_contribution_score', todayContribution.value.toString());
            localStorage.setItem('total_accumulated_score', totalAccumulatedScore.value.toString());

            // 檢查是否達成 10000 分
            if (totalAccumulatedScore.value >= 10000 && localStorage.getItem('coupon_awarded') !== 'true') {
                showCoupon.value = true;
                localStorage.setItem('coupon_awarded', 'true');
            }
        }

        if (score.value > highScore.value) {
            highScore.value = score.value;
            localStorage.setItem('mole_high_score', highScore.value.toString());
        }

        alert(`戰鬥結束！本次積分：${score.value}\n今日貢獻值：+${actualContribution}\n${actualContribution < score.value ? '(已達今日 500 分上限)' : ''}`);
    };
</script>

<style scoped>
    .mole-enter-active { transition: transform 0.08s ease-out; }
    .mole-leave-active { transition: transform 0.08s ease-in; pointer-events: none; }
    .mole-enter-from, .mole-leave-to { transform: translateY(80%); opacity: 0; }

    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-4px); }
        75% { transform: translateX(4px); }
    }
    .animate-shake { animation: shake 0.1s infinite; }

    @keyframes coupon-pop {
        0% { transform: scale(0.5); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
    }
    .animate-coupon-pop { animation: coupon-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }

    .fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
    .fade-enter-from, .fade-leave-to { opacity: 0; }
</style>