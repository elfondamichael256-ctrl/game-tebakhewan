(function(){
    "use strict";

    // ---------- DATA HEWAN ----------
    const DAFTAR_HEWAN = {
        "kucing": "KUCING", "anjing": "ANJING", "gajah": "GAJAH", "harimau": "HARIMAU",
        "singa": "SINGA", "ular": "ULAR", "jerapah": "JERAPAH", "kambing": "KAMBING",
        "beruang": "BERUANG", "buaya": "BUAYA", "kuda": "KUDA", "ayam": "AYAM",
        "komodo": "KOMODO", "hiu": "HIU", "paus": "PAUS", "merpati": "MERPATI",
        "jangkrik": "JANGKRIK", "beluga": "BELUGA", "macan": "MACAN", "elang": "ELANG",
        "serigala": "SERIGALA", "penguin": "PENGUIN", "kelinci": "KELINCI", "zebra": "ZEBRA",
        "lumba-lumba": "LUMBA-LUMBA", "MONYET": "MONYET", "kera": "KERA", "GORILA": "GORILA",
        "orangutan": "ORANGUTAN", "cendrawaish": "CENDRAWASIH", "panda": "PANDA",
        "kangguru": "KANGGURU", "Koala": "KOALA", "rubah": "RUBAH", "unta": "UNTA",
        "wallet": "WALLET", "lobster": "LOBSTER", "penyu": "PENYU", "biawak": "BIAWAK",
        "katak": "KATAK", "iguana": "IGUANA", "kelabang": "KELABANG", "lipan": "LIPAN",
        "kutu": "KUTU", "lebah": "LEBAH", "banteng": "BANTENG", "badak": "BADAK",
        "flamingo": "FLAMINGO", "angsa": "ANGSA", "camar": "CAMAR", "bangau": "BANGAU",
        "kepik": "KEPIK", "kalkun": "KALKUN", "kepiting": "KEPITING", "laba-laba": "LABA-LABA",
        "orong-orong": "ORONG-ORONG", "udang": "UDANG", "kasuari": "KASUARI", "gurita": "GURITA",
        "sapi": "SAPI", "belalang": "BELALANG", "capung": "CAPUNG", "lalat": "LALAT",
        "kumbang": "KUMBANG", "kecoa": "KECOA", "tupai": "TUPAI", "landak": "LANDAK",
        "kelelawar": "KELELAWAR", "kura-kura": "KURA-KURA", "semut": "SEMUT",
        "cheetah": "CHEETAH", "rajawali": "RAJAWALI", "bebek": "BEBEK", "rayap": "RAYAP",
        "kalajengkin": "KALAJENGKIN", "cendet": "CENDET", "emprit": "EMPRIT"
    };

    // ---------- PRNG (Pseudo-Random Number Generator) ----------
    function mulberry32(seed) {
        return function() {
            seed |= 0;
            seed = (seed + 0x6d2b79f5) | 0;
            let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function shuffleAndChoice(arr, n, seed) {
        const rng = mulberry32(seed);
        let arrayCopy = [...arr];
        
        // Fisher-Yates shuffle
        for (let i = arrayCopy.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [arrayCopy[i], arrayCopy[j]] = [arrayCopy[j], arrayCopy[i]];
        }
        
        const selected = arrayCopy.slice(0, n);
        const newSeed = Math.floor(rng() * 2**32) ^ (seed + 0x9e3779b9);
        return { newSeed, selected };
    }

    function generateSoal(namaHewanUpper, rasioSembunyi, seed) {
        const panjang = namaHewanUpper.length;
        let jumlahSembunyi = Math.floor(panjang * rasioSembunyi);
        jumlahSembunyi = Math.max(1, Math.min(panjang - 1, jumlahSembunyi));
        
        const indeksSemua = Array.from({length: panjang}, (_, i) => i);
        const rng = mulberry32(seed);
        
        // Shuffle indeks
        for (let i = indeksSemua.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [indeksSemua[i], indeksSemua[j]] = [indeksSemua[j], indeksSemua[i]];
        }
        
        const indeksSembunyi = indeksSemua.slice(0, jumlahSembunyi);
        const soalArray = namaHewanUpper.split('');
        indeksSembunyi.forEach(idx => { soalArray[idx] = '_'; });
        
        const newSeed = Math.floor(rng() * 2**32) ^ (seed + 0x5a5a5a5a);
        return { newSeed, soalString: soalArray.join('') };
    }

    function berikanHint(jawabanKunci, tebakanSaatIni, seed) {
        const tebakanList = tebakanSaatIni.split('');
        const indeksKosong = tebakanList.reduce((arr, char, idx) => 
            char === '_' ? arr.concat(idx) : arr, []);
        
        if (indeksKosong.length === 0) {
            return { newSeed: seed, hintResult: tebakanSaatIni };
        }
        
        const rng = mulberry32(seed);
        const randVal = rng();
        const indeksPilih = Math.floor(randVal * indeksKosong.length);
        const indeksBuka = indeksKosong[indeksPilih];
        tebakanList[indeksBuka] = jawabanKunci[indeksBuka].toUpperCase();
        
        const newSeed = Math.floor(rng() * 2**32) ^ (seed + 0x12345678);
        return { newSeed, hintResult: tebakanList.join('') };
    }

    function hitungSkor(benar, hintsUsed, consecutiveWrong, poinDasar) {
        let skorDidapat = 0;
        let pesan = "";
        let resetConsecutive = false;
        let bonusBeruntun = 0;

        let pengurangHint = 0;
        if (hintsUsed === 1) pengurangHint = 6;
        else if (hintsUsed >= 2) pengurangHint = 3;

        if (benar) {
            resetConsecutive = true;
            skorDidapat = Math.max(1, poinDasar - pengurangHint);
            
            if (hintsUsed === 0) pesan = `✅ BENAR! Poin Dasar: +${skorDidapat}`;
            else if (hintsUsed === 1) pesan = `✅ BENAR! Poin (-1 Hint): +${skorDidapat}`;
            else pesan = `✅ BENAR! Poin (-2 Hint): +${skorDidapat}`;
        } else {
            resetConsecutive = false;
            
            if (consecutiveWrong >= 1) {
                bonusBeruntun = 8;
                pesan += `⭐ BONUS INSENTIF BERUNTUN! +8 Poin. `;
            }
            
            if (hintsUsed === 0 || hintsUsed === 1) {
                skorDidapat = 3;
                pesan += `❌ SALAH. Poin Kompensasi: +3`;
            } else {
                skorDidapat = 1;
                pesan += `❌ SALAH. Poin Kompensasi: +1`;
            }
            
            skorDidapat += bonusBeruntun;
        }
        
        return { skorDidapat, pesan, resetConsecutive };
    }

    // ---------- STATE MANAGEMENT ----------
    let currentLevel = 1;
    let levelConfig = { nama: "MUDAH", jumlahSoal: 15, poinDasar: 20, rasio: 0.25 };
    
    let gameActive = false;
    let soalGame = [];
    let currentIndex = 0;
    let skor = 0;
    let consecutiveWrong = 0;
    
    let currentJawabanKunci = "";
    let currentNamaAsli = "";
    let tebakanSaatIni = "";
    let hintsUsed = 0;
    let gameSeed = 0;
    
    // DOM Elements
    const setupArea = document.getElementById('setupArea');
    const playArea = document.getElementById('playArea');
    const levelDisplay = document.getElementById('levelDisplay');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const progressIndicator = document.getElementById('progressIndicator');
    const wordDisplay = document.getElementById('wordDisplay');
    const hintUsedDisplay = document.getElementById('hintUsedDisplay');
    const strekDisplay = document.getElementById('streakDisplay');
    const feedbackMessage = document.getElementById('feedbackMessage');
    const answerInput = document.getElementById('answerInput');
    const hintButton = document.getElementById('hintButton');
    const submitButton = document.getElementById('submitButton');
    const quitButton = document.getElementById('quitButton');
    const restartButton = document.getElementById('restartButton');
    const startGameBtn = document.getElementById('startGameBtn');
    const levelBtns = document.querySelectorAll('.level-btn');

    // ---------- UI UPDATE FUNCTIONS ----------
    function updateUI() {
        scoreDisplay.textContent = skor;
        wordDisplay.textContent = tebakanSaatIni.split('').join(' ') || '_____';
        hintUsedDisplay.textContent = `💡 Hint ${hintsUsed}/2`;
        strekDisplay.textContent = `⚠️ Salah beruntun: ${consecutiveWrong}`;
        
        if (gameActive) {
            progressIndicator.textContent = `Soal ${currentIndex + 1}/${soalGame.length}`;
        }
    }

    function setLevelConfig(level) {
        if (level === 1) {
            levelConfig = { nama: "MUDAH", jumlahSoal: 15, poinDasar: 20, rasio: 0.25 };
        } else if (level === 2) {
            levelConfig = { nama: "SEDANG", jumlahSoal: 25, poinDasar: 15, rasio: 0.50 };
        } else {
            levelConfig = { nama: "SULIT", jumlahSoal: 75, poinDasar: 12, rasio: 0.75 };
        }
        currentLevel = level;
        levelDisplay.textContent = levelConfig.nama;
    }

    function loadSoalKeCurrent() {
        if (currentIndex >= soalGame.length) {
            // Game selesai
            gameActive = false;
            feedbackMessage.innerHTML = `🎉 SELESAI! Skor akhir: ${skor}. Terima kasih telah bermain.`;
            wordDisplay.textContent = "🏁 SELESAI 🏁";
            answerInput.disabled = true;
            hintButton.disabled = true;
            submitButton.disabled = true;
            return;
        }
        
        const kunci = soalGame[currentIndex];
        currentJawabanKunci = kunci;
        currentNamaAsli = DAFTAR_HEWAN[kunci].toUpperCase();
        
        const { newSeed, soalString } = generateSoal(currentNamaAsli, levelConfig.rasio, gameSeed);
        gameSeed = newSeed;
        tebakanSaatIni = soalString;
        hintsUsed = 0;
        
        answerInput.disabled = false;
        hintButton.disabled = false;
        submitButton.disabled = false;
        answerInput.value = '';
        answerInput.focus();
        
        updateUI();
        feedbackMessage.innerHTML = `📌 Level ${levelConfig.nama} · Poin dasar ${levelConfig.poinDasar}`;
    }

    function startNewGame() {
        setLevelConfig(currentLevel);
        
        // Generate seed awal
        gameSeed = (Date.now() & 0x7fffffff) ^ 0x5EED;
        const kunciHewan = Object.keys(DAFTAR_HEWAN);
        const { newSeed, selected } = shuffleAndChoice(kunciHewan, levelConfig.jumlahSoal, gameSeed);
        gameSeed = newSeed;
        soalGame = selected;
        
        currentIndex = 0;
        skor = 0;
        consecutiveWrong = 0;
        
        gameActive = true;
        setupArea.classList.add('hidden');
        playArea.classList.remove('hidden');
        
        loadSoalKeCurrent();
    }

    function gunakanHint() {
        if (!gameActive) return;
        
        if (hintsUsed >= 2) {
            feedbackMessage.innerHTML = "⛔ Hint sudah digunakan 2 kali! Silakan jawab.";
            return;
        }
        
        const { newSeed, hintResult } = berikanHint(currentNamaAsli, tebakanSaatIni, gameSeed);
        gameSeed = newSeed;
        tebakanSaatIni = hintResult;
        hintsUsed++;
        
        updateUI();
        feedbackMessage.innerHTML = `🔎 Hint digunakan (${hintsUsed}/2)`;
        
        if (!tebakanSaatIni.includes('_')) {
            feedbackMessage.innerHTML += " · Semua huruf terbuka!";
        }
    }

    function prosesJawaban(jawabanRaw) {
        if (!gameActive) return;
        
        const jawaban = jawabanRaw.trim().toLowerCase();
        
        if (jawaban === 'quit') {
            quitGame();
            return;
        }
        
        if (jawaban === 'hint') {
            gunakanHint();
            return;
        }
        
        const benar = (jawaban === currentJawabanKunci);
        const { skorDidapat, pesan, resetConsecutive } = hitungSkor(
            benar, hintsUsed, consecutiveWrong, levelConfig.poinDasar
        );
        
        skor += skorDidapat;
        
        if (resetConsecutive) {
            consecutiveWrong = 0;
        } else {
            consecutiveWrong += 1;
        }
        
        let extraInfo = "";
        if (!benar) {
            extraInfo = ` (Jawaban benar: ${currentNamaAsli})`;
        }
        
        feedbackMessage.innerHTML = pesan + extraInfo;
        
        if (benar) {
            currentIndex++;
            if (currentIndex < soalGame.length) {
                loadSoalKeCurrent();
            } else {
                // Game selesai
                gameActive = false;
                updateUI();
                feedbackMessage.innerHTML = `🏆 GAME BERAKHIR! Skor Akhir: ${skor}. Hebat!`;
                wordDisplay.textContent = "🎯 SELESAI";
                answerInput.disabled = true;
                hintButton.disabled = true;
                submitButton.disabled = true;
            }
        } else {
            updateUI();
        }
    }

    function quitGame() {
        if (!gameActive) return;
        
        gameActive = false;
        feedbackMessage.innerHTML = `🛑 Anda keluar. Skor akhir: ${skor}.`;
        wordDisplay.textContent = "⏸️ QUIT";
        answerInput.disabled = true;
        hintButton.disabled = true;
        submitButton.disabled = true;
    }

    function resetToSetup() {
        gameActive = false;
        setupArea.classList.remove('hidden');
        playArea.classList.add('hidden');
        answerInput.disabled = false;
        hintButton.disabled = false;
        submitButton.disabled = false;
    }

    // ---------- EVENT LISTENERS ----------
    levelBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const lvl = parseInt(btn.dataset.level);
            currentLevel = lvl;
            levelBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            setLevelConfig(lvl);
        });
    });
    
    startGameBtn.addEventListener('click', startNewGame);
    
    submitButton.addEventListener('click', () => {
        prosesJawaban(answerInput.value);
    });
    
    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            prosesJawaban(answerInput.value);
        }
    });
    
    hintButton.addEventListener('click', gunakanHint);
    
    quitButton.addEventListener('click', quitGame);
    
    restartButton.addEventListener('click', resetToSetup);

    // Set default active level
    document.querySelector('[data-level="1"]').classList.add('active');
    setLevelConfig(1);
})();