<template>
    <div class="z-50 w-full max-w-md bg-stone-100 rounded-3xl p-6 shadow-2xl text-center">
        <div class="flex justify-between items-center mb-4">
            <button @click="$emit('back')" class="text-stone-500 font-bold hover:text-red-600 transition-colors">← 返回</button>
            <div class="flex gap-2">
                <div class="bg-stone-200 px-3 py-1 rounded-full text-[10px] font-bold">最高: {{ highScore }}</div>
                <div class="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-bold">剩餘: {{ timeLeft }}s</div>
            </div>
        </div>

        <h2 class="text-xl font-black mb-1 italic">怪獸擊退戰</h2>
        <div
                class="text-5xl font-mono mb-6 transition-all duration-100"
                :class="{ 'text-red-600 scale-110 animate-shake': isHittingWrong, 'text-blue-600': !isHittingWrong }"
        >
            {{ score }}
        </div>

        <div class="grid grid-cols-3 gap-3 bg-stone-300 p-3 rounded-2xl shadow-inner relative">
            <div v-for="(hole, index) in 9" :key="index"
                 class="aspect-square bg-stone-800/20 rounded-xl relative overflow-hidden">

                <div class="absolute inset-0 shadow-[inset_0_4px_12px_rgba(0,0,0,0.4)] pointer-events-none"></div>

                <transition name="mole">
                    <div v-if="activeHole === index"
                         @click="hit(index)"
                         class="absolute inset-0 flex items-center justify-center cursor-pointer select-none p-2">

                        <div v-if="currentRole === 'monster'" class="text-5xl drop-shadow-md">👾</div>
                        <img v-else :src="getImageUrl(currentRole)" class="w-full h-full object-contain drop-shadow-lg" />

                        <div v-if="hitFeedback" class="absolute -top-2 font-black animate-bounce" :class="hitFeedback.color">
                            {{ hitFeedback.text }}
                        </div>
                    </div>
                </transition>
            </div>
        </div>

        <div class="mt-8">
            <button v-if="!isPlaying && canPlayToday" @click="startGame"
                    class="w-full bg-stone-900 text-white py-4 rounded-2xl font-black text-xl shadow-lg active:scale-95 transition-all">
                START MISSION
            </button>
            <div v-else-if="!isPlaying" class="py-4 bg-stone-200 text-stone-400 rounded-2xl font-bold">
                今日能量已耗盡 ⚡
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue';
    import { missionData } from '../missions.js';

    const emit = defineEmits(['back']);

    // 遊戲邏輯
    const score = ref(0);
    const timeLeft = ref(20);
    const activeHole = ref(null);
    const currentRole = ref(''); // 'monster' 或 隨機超人圖片名
    const isPlaying = ref(false);
    const isHittingWrong = ref(false);
    const hitFeedback = ref(null);

    const highScore = ref(parseInt(localStorage.getItem('mole_high_score')) || 0);
    const canPlayToday = ref(localStorage.getItem('mole_last_date') !== new Date().toDateString());

    // 隨機獲取一個超人圖片
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

        activeHole.value = Math.floor(Math.random() * 9);
        // 70% 怪獸, 30% 超人
        currentRole.value = Math.random() > 0.3 ? 'monster' : getRandomUltraman();

        // 速度優化：隨著時間越來越快 (從 800ms 降到 450ms)
        const speed = Math.max(450, 800 - (20 - timeLeft.value) * 20);

        setTimeout(() => {
            activeHole.value = null;
            if (isPlaying.value) setTimeout(runGameLoop, Math.random() * 200 + 100);
        }, speed);
    };

    const hit = (index) => {
        if (activeHole.value !== index) return;

        if (currentRole.value === 'monster') {
            score.value += 10;
            showFeedback("+10", "text-blue-500");
        } else {
            score.value = Math.max(0, score.value - 20);
            isHittingWrong.value = true;
            showFeedback("-20!!", "text-red-600");
            setTimeout(() => isHittingWrong.value = false, 300);
        }
        activeHole.value = null;
    };

    const showFeedback = (text, color) => {
        hitFeedback.value = { text, color };
        setTimeout(() => hitFeedback.value = null, 500);
    };

    const endGame = () => {
        isPlaying.value = false;
        if (score.value > highScore.value) {
            highScore.value = score.value;
            localStorage.setItem('mole_high_score', highScore.value);
        }
        localStorage.setItem('mole_last_date', new Date().toDateString());
        canPlayToday.value = false;
        alert(`任務結束！你的得分：${score.value}`);
    };
</script>

<style scoped>
    /* 怪獸/超人 跳出來的動畫 */
    .mole-enter-active {
        transition: all 0.1s ease-out;
    }
    .mole-leave-active {
        transition: all 0.1s ease-in;
    }
    .mole-enter-from, .mole-leave-to {
        transform: translateY(100%);
    }

    /* 扣分時的震動效果 */
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    .animate-shake {
        animation: shake 0.1s infinite;
    }
</style>