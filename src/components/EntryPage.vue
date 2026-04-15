<template>
    <div class="absolute inset-0 z-[200] flex flex-col items-center justify-center bg-stone-900 p-6 text-center">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent"></div>

        <div class="relative mb-8 animate-monster-bounce">
            <div class="absolute inset-0 bg-red-500 blur-3xl opacity-20"></div>
            <img src="../assets/ultramans/Ultraman.jpg" class="w-48 h-48 object-contain relative z-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
        </div>

        <h1 class="text-4xl font-black text-white mb-4 tracking-tighter italic">
            ULTRAMAN <span class="text-red-500">MISSION</span>
        </h1>
        <p class="text-stone-400 font-mono text-sm mb-12 tracking-widest uppercase">May Countdown Notebook</p>

        <button @click="$emit('start')" class="group relative px-12 py-4 bg-white text-black font-black rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95">
            <div class="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span class="relative z-10 group-hover:text-white tracking-[0.2em]">開啟任務筆記本</span>
        </button>
    </div>
</template>

<script setup>
    defineEmits(['start']);
</script>