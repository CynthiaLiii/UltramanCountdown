<template>
    <div class="z-50 w-full max-w-sm bg-stone-100 rounded-[2.5rem] p-6 shadow-2xl text-center flex flex-col max-h-[90vh]">

        <div class="flex justify-between items-center mb-2">
            <button @click="$emit('back')" class="text-stone-400 font-bold hover:text-red-600 transition-colors p-2 text-xs italic">
                ← BACK
            </button>
            <div class="flex gap-2">
                <div class="bg-stone-200/50 px-2 py-1 rounded-lg text-[10px] font-mono">BEST: {{ highScore }}</div>
                <div class="bg-red-100 text-red-600 px-2 py-1 rounded-lg text-[10px] font-bold">TIME: {{ timeLeft }}s</div>
            </div>
        </div>

        <div class="mb-4">
            <h2 class="text-lg font-black text-stone-800 italic uppercase tracking-tighter">Monster Hunter</h2>
            <div
                    class="text-5xl font-mono font-bold transition-all duration-100 tracking-tighter"
                    :class="{ 'text-red-600 scale-110 animate-shake': isHittingWrong, 'text-blue-600': !isHittingWrong }"
            >
                {{ score }}
            </div>
        </div>

        <div class="grid grid-cols-3 gap-3 bg-stone-300 p-3 rounded-2xl shadow-inner relative mx-auto w-full max-w-[280px]">
            <div v-for="(hole, index) in 9" :key="index"
                 @mousedown.prevent="hit(index)"
                 @touchstart.prevent="hit(index)"
                 class="aspect-square bg-stone-800/20 rounded-xl relative overflow-hidden cursor-pointer ...">

                <div class="absolute inset-0 shadow-[inset_0_4px_12px_rgba(0,0,0,0.4)] pointer-events-none"></div>

                <transition name="mole">
                    <div v-if="activeHole === index"
                         class="absolute inset-0 flex items-center justify-center select-none p-2 pointer-events-none">

                        <div v-if="currentRole === 'monster'" class="text-4xl drop-shadow-md">👾</div>
                        <img v-else :src="getImageUrl(currentRole)" class="w-full h-full object-contain drop-shadow-lg" />

                        <div v-if="hitFeedback" class="absolute -top-2 font-black animate-bounce text-sm" :class="hitFeedback.color">
                            {{ hitFeedback.text }}
                        </div>
                    </div>
                </transition>
            </div>
        </div>

        <div class="mt-6">
            <button v-if="!isPlaying && canPlayToday" @click="startGame"
                    class="w-full bg-stone-900 text-white py-4 rounded-2xl font-black text-xl shadow-lg active:scale-95 transition-all uppercase tracking-widest">
                Start Mission
            </button>
            <div v-else-if="!isPlaying" class="py-4 bg-stone-200 text-stone-400 rounded-2xl font-bold text-sm">
                能量補充中 (明日再戰) ⚡
            </div>
            <div v-else class="text-[10px] font-mono text-stone-400 animate-pulse tracking-widest uppercase">
                Combatting Monsters...
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue';
    import { missionData } from '../missions.js';

    const emit = defineEmits(['back']);

    // 遊戲邏輯狀態
    const score = ref(0);
    const timeLeft = ref(20);
    const activeHole = ref(null);
    const currentRole = ref('');
    const isPlaying = ref(false);
    const isHittingWrong = ref(false);
    const hitFeedback = ref(null);

    // --- 關鍵優化：增加唯一 ID 追蹤 ---
    const currentSpawnId = ref(0);

    const highScore = ref(parseInt(localStorage.getItem('mole_high_score')) || 0);
    const canPlayToday = ref(localStorage.getItem('mole_last_date') !== new Date().toDateString());

    const getRandomUltraman = () => {
        const keys = Object.keys(missionData);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        return missionData[randomKey].imageName;
    };

    const getImageUrl = (name) => new URL(`../assets/ultramans/${name}`, import.meta.url).href;

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

        // 生成當下這隻怪獸的唯一 ID
        const localSpawnId = Date.now() + Math.random();
        currentSpawnId.value = localSpawnId;

        activeHole.value = Math.floor(Math.random() * 9);
        currentRole.value = Math.random() > 0.3 ? 'monster' : getRandomUltraman();

        // 隨著時間縮短怪獸停留的時間 (400ms ~ 750ms)
        const speed = Math.max(400, 750 - (20 - timeLeft.value) * 25);

        setTimeout(() => {
            // 只有當「目前的怪獸」還是「這一支」時，才執行清空
            // 防止舊的計時器清掉剛冒頭的新怪獸
            if (currentSpawnId.value === localSpawnId) {
                activeHole.value = null;
            }

            // 縮短兩隻出現之間的空窗期 (50ms ~ 150ms)
            if (isPlaying.value) {
                const nextDelay = Math.max(50, 150 - (20 - timeLeft.value) * 5);
                setTimeout(runGameLoop, nextDelay);
            }
        }, speed);
    };

    const hit = (index) => {
        // 判定修正：確保點擊時有怪獸，且位置正確
        if (activeHole.value === null || activeHole.value !== index || !isPlaying.value) return;

        if (currentRole.value === 'monster') {
            score.value += 10;
            showFeedback("+10", "text-blue-500 font-black");
        } else {
            score.value = Math.max(0, score.value - 20);
            isHittingWrong.value = true;
            showFeedback("-20!!", "text-red-600 font-black");
            setTimeout(() => isHittingWrong.value = false, 300);
        }

        // 擊中後立刻作廢 ID 並清空洞口，讓 runGameLoop 能更快觸發下一輪
        activeHole.value = null;
        currentSpawnId.value = 0;
    };

    const showFeedback = (text, color) => {
        hitFeedback.value = { text, color };
        // 縮短反饋顯示時間，避免視覺堆疊過久
        setTimeout(() => hitFeedback.value = null, 300);
    };

    const endGame = () => {
        isPlaying.value = false;
        activeHole.value = null;
        currentSpawnId.value = 0;

        if (score.value > highScore.value) {
            highScore.value = score.value;
            localStorage.setItem('mole_high_score', highScore.value.toString());
        }

        localStorage.setItem('mole_last_date', new Date().toDateString());
        canPlayToday.value = false;

        let reward = "阿昕的鼓勵獎！";
        if (score.value >= 150) reward = "一杯手搖飲！";
        if (score.value >= 250) reward = "阿昕請客吃大餐！";

        // 用 setTimeout 稍微延遲一下彈窗，讓最後一秒的分數跳完
        setTimeout(() => {
            alert(`任務結束！你的得分：${score.value}\n獲得獎品：${reward}`);
        }, 100);
    };
</script>

<style scoped>
    .mole-enter-active { transition: transform 0.05s ease-out; }
    .mole-leave-active { transition: transform 0.05s ease-in; }
    .mole-enter-from, .mole-leave-to { transform: translateY(100%); opacity: 0; }

    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-4px); }
        75% { transform: translateX(4px); }
    }
    .animate-shake { animation: shake 0.1s infinite; }
</style>