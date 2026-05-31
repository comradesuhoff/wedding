const GAME_CHANNEL = "legendary_union_channel_v1";

const SCENES = [
    {
        id: 1,
        title: "Сбор гильдии",
        desc: "Игроки присоединяются и получают классы, бонусы и тайные роли."
    },
    {
        id: 2,
        title: "Проверка знаний партии",
        desc: "На телефоны приходит вопрос, а на экране появляется RPG-реакция."
    },
    {
        id: 3,
        title: "Совет мудрецов",
        desc: "Каждый совет превращается в магический свиток."
    },
    {
        id: 4,
        title: "Битва с Лордом Бытовухусом",
        desc: "Игроки наносят урон советами и действиями. Криты и провалы включены."
    },
    {
        id: 5,
        title: "Судьбоносный бросок",
        desc: "Игроки добавляют bonus luck, затем бросок d20 молодоженами."
    },
    {
        id: 6,
        title: "Финал",
        desc: "Пожелания, участники и итоговый уровень любви."
    }
];

const QUESTIONS = [
    {
        id: "q1",
        text: "Кто чаще выигрывает споры?",
        options: ["Жених", "Невеста", "Побеждает компромисс", "Оба делают вид, что правы"],
        correct: 2
    },
    {
        id: "q2",
        text: "Кто первым пишет после ссоры?",
        options: ["Жених", "Невеста", "Оба почти одновременно", "Сначала пишут смайлики"],
        correct: 2
    },
    {
        id: "q3",
        text: "Кто вероятнее забудет зарядку?",
        options: ["Жених", "Невеста", "Свидетель", "Кто-то точно забудет"],
        correct: 3
    },
    {
        id: "q4",
        text: "Кто дольше собирается?",
        options: ["Жених", "Невеста", "Оба", "Тот, кто ищет ключи перед выходом"],
        correct: 3
    }
];

const BOSS_PHASES = [
    "Фаза I: Гора Нестираного Белья",
    "Фаза II: Вечный Выбор Фильма",
    "Фаза III: Кто-Последний-Выносил-Мусор"
];

const RANDOM_EVENTS = [
    "Внезапное событие: Демон Икеи появляется с инструкцией без слов.",
    "Внезапное событие: Орден Грязной Кружки усиливает хаос на кухне.",
    "Внезапное событие: Прокрастинаторус обещает сделать это завтра."
];

const game = {
    scene: 1,
    players: new Map(),
    events: [],
    questionIndex: 0,
    questionAnswers: new Map(),
    adviceScrolls: [],
    bossHP: 100,
    luck: 0,
    finalWishes: [],
    audioOn: false
};

const channel = createChannel(GAME_CHANNEL, onMessage);
const eventLog = document.getElementById("event-log");
const partyList = document.getElementById("party-list");
const sceneTitle = document.getElementById("scene-title");
const sceneDesc = document.getElementById("scene-desc");
const questionTitle = document.getElementById("question-title");
const questionProgress = document.getElementById("question-progress");
const answerFeed = document.getElementById("answer-feed");
const nextQuestionBtn = document.getElementById("next-question-btn");
const scrollFeed = document.getElementById("scroll-feed");
const bossPhase = document.getElementById("boss-phase");
const bossHpText = document.getElementById("boss-hp-text");
const bossHpFill = document.getElementById("boss-hp-fill");
const damageLayer = document.getElementById("damage-layer");
const luckValue = document.getElementById("luck-value");
const d20Die = document.getElementById("d20-die");
const finalParty = document.getElementById("final-party");
const finalWishes = document.getElementById("final-wishes");
const loveLevel = document.getElementById("love-level");
const nextSceneBtn = document.getElementById("next-scene-btn");
const rollFateBtn = document.getElementById("roll-fate-btn");
const finishBtn = document.getElementById("finish-btn");
const audioToggle = document.getElementById("audio-toggle");
const controllerLink = document.getElementById("controller-link");
const copyLinkBtn = document.getElementById("copy-link-btn");
const qrImage = document.getElementById("qr-image");

init();

function init() {
    setupLinkAndQR();
    createParticles();
    renderAll();
    addEvent("Система готова. Ждем новых героев.");
    nextSceneBtn.addEventListener("click", onNextScene);
    nextQuestionBtn.addEventListener("click", onNextQuestion);
    rollFateBtn.addEventListener("click", onRollFate);
    finishBtn.addEventListener("click", onFinishCampaign);
    audioToggle.addEventListener("click", onToggleAudio);
    copyLinkBtn.addEventListener("click", onCopyLink);

    broadcast({
        type: "state-sync",
        payload: buildSyncPayload()
    });
}

function onMessage(message) {
    if (!message || typeof message !== "object") return;
    const { type, payload } = message;

    if (type === "join-player") handleJoin(payload);
    if (type === "quiz-answer") handleQuizAnswer(payload);
    if (type === "advice") handleAdvice(payload);
    if (type === "boss-attack") handleBossAttack(payload);
    if (type === "luck-push") handleLuck(payload);
    if (type === "final-wish") handleFinalWish(payload);
    if (type === "request-sync") {
        broadcast({ type: "state-sync", payload: buildSyncPayload() });
    }
}

function onNextScene() {
    if (game.scene === 2) {
        const lastQuestion = game.questionIndex >= QUESTIONS.length - 1;
        if (!lastQuestion) {
            game.questionIndex += 1;
            game.questionAnswers.clear();
            renderQuiz();
            broadcast({ type: "state-sync", payload: buildSyncPayload() });
            return;
        }
    }

    game.scene = Math.min(6, game.scene + 1);
    if (game.scene === 2) {
        game.questionIndex = 0;
        game.questionAnswers.clear();
    }
    renderAll();
    addEvent(`Сцена сменена: ${SCENES[game.scene - 1].title}.`);
    broadcast({
        type: "state-sync",
        payload: buildSyncPayload()
    });
}

function onNextQuestion() {
    if (game.scene !== 2) return;
    const lastQuestion = game.questionIndex >= QUESTIONS.length - 1;
    if (lastQuestion) {
        addEvent("Испытания завершены. Можно переходить к советам мудрецов.");
        return;
    }
    game.questionIndex += 1;
    game.questionAnswers.clear();
    renderQuiz();
    broadcast({ type: "state-sync", payload: buildSyncPayload() });
}

function onRollFate() {
    if (game.scene !== 5) return;
    d20Die.classList.remove("roll");
    void d20Die.offsetWidth;
    d20Die.classList.add("roll");
    playTone(340, 0.12);
    setTimeout(() => playTone(460, 0.14), 210);
    setTimeout(() => playTone(620, 0.16), 520);

    setTimeout(() => {
        d20Die.textContent = "20";
        addEvent("Натуральный 20! Судьба подтверждает союз.");
        triggerCelebration();
        game.scene = 6;
        renderAll();
        broadcast({ type: "state-sync", payload: buildSyncPayload() });
    }, 1150);
}

function onFinishCampaign() {
    addEvent("Кампания завершена. Спасибо гильдии друзей.");
    game.scene = 1;
    game.questionIndex = 0;
    game.questionAnswers.clear();
    game.adviceScrolls = [];
    game.finalWishes = [];
    game.bossHP = 100;
    game.luck = 0;
    d20Die.textContent = "d20";
    renderAll();
    broadcast({ type: "state-sync", payload: buildSyncPayload() });
}

function onToggleAudio() {
    game.audioOn = !game.audioOn;
    audioToggle.textContent = game.audioOn ? "Амбиент: вкл" : "Амбиент: выкл";
    if (game.audioOn) {
        playTone(220, 0.15);
    }
}

async function onCopyLink() {
    try {
        await navigator.clipboard.writeText(controllerLink.href);
        addEvent("Ссылка на контроллер скопирована.");
    } catch {
        addEvent("Не удалось скопировать ссылку автоматически.");
    }
}

function setupLinkAndQR() {
    const url = new URL(window.location.href);
    url.pathname = url.pathname.replace(/[^/]*$/, "controller.html");
    url.search = "";
    url.hash = "";
    controllerLink.href = url.toString();
    controllerLink.textContent = url.toString();

    const qrData = encodeURIComponent(url.toString());
    qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${qrData}`;
}

function handleJoin(payload) {
    if (!payload || !payload.playerId || !payload.name) return;
    game.players.set(payload.playerId, payload);
    addEvent(`${payload.className} ${payload.name} присоединился к партии.`);
    renderParty();
    broadcast({ type: "state-sync", payload: buildSyncPayload() });
}

function handleQuizAnswer(payload) {
    if (game.scene !== 2) return;
    if (!payload || !payload.playerId) return;

    const player = game.players.get(payload.playerId);
    const question = QUESTIONS[game.questionIndex];
    if (!player || !question) return;
    if (payload.questionId !== question.id) return;
    if (game.questionAnswers.has(payload.playerId)) return;

    const isCorrect = Number(payload.answerIndex) === question.correct;
    game.questionAnswers.set(payload.playerId, isCorrect);

    const phrase = isCorrect
        ? `${player.className} ${player.name} успешно прошел проверку мудрости.`
        : `Критический провал. ${player.className} ${player.name} случайно призвал спор о выборе фильма.`;

    addFeedItem(answerFeed, phrase);
    addEvent(phrase);
    if (isCorrect) playTone(520, 0.1);
    else playTone(190, 0.14);
}

function handleAdvice(payload) {
    if (game.scene !== 3) return;
    if (!payload || !payload.playerId || !payload.text) return;
    const player = game.players.get(payload.playerId);
    if (!player) return;

    const text = payload.text.trim().slice(0, 180);
    if (!text) return;

    game.adviceScrolls.unshift(`${player.name}: ${text}`);
    addScroll(`${player.name}: ${text}`);
    addEvent(`Свиток мудрости от ${player.name}: "${text}"`);
    playTone(410, 0.08);
}

function handleBossAttack(payload) {
    if (game.scene !== 4) return;
    if (!payload || !payload.playerId || !payload.text) return;

    const player = game.players.get(payload.playerId);
    if (!player) return;

    const roll = d20();
    const classBonus = player.bonusRoll || 0;
    const crit = roll === 20;
    const fail = roll === 1;
    const base = Math.max(3, Math.floor((roll + classBonus) / 2));
    let damage = base;

    if (crit) damage += 14;
    if (fail) damage = 1;

    game.bossHP = Math.max(0, game.bossHP - damage);
    renderBoss();
    floatDamage(`-${damage}`);
    screenShake();

    const actionText = payload.text.trim().slice(0, 140);
    const logText = crit
        ? `Критический удар! ${player.className} ${player.name}: "${actionText}" (${damage} урона).`
        : fail
            ? `Критический провал. ${player.className} ${player.name} отвлекся, но нанес ${damage} урона.`
            : `${player.className} ${player.name}: "${actionText}" (${damage} урона).`;

    addEvent(logText);
    playTone(crit ? 620 : 330, crit ? 0.15 : 0.08);

    if (Math.random() < 0.3) {
        addEvent(RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)]);
    }

    if (game.bossHP <= 0) {
        addEvent("Лорд Бытовухус повержен. Время судьбоносного броска.");
        game.scene = 5;
        renderAll();
        broadcast({ type: "state-sync", payload: buildSyncPayload() });
    } else {
        broadcast({ type: "state-sync", payload: buildSyncPayload() });
    }
}

function handleLuck(payload) {
    if (game.scene !== 5) return;
    if (!payload || !payload.playerId) return;
    const bonus = Number(payload.amount) || 1;
    game.luck += bonus;
    luckValue.textContent = String(game.luck);
    addEvent(`Партия усилила удачу на +${bonus}. Текущий Bonus Luck: ${game.luck}.`);
}

function handleFinalWish(payload) {
    if (game.scene !== 6) return;
    if (!payload || !payload.playerId || !payload.text) return;
    const player = game.players.get(payload.playerId);
    if (!player) return;
    const wish = `${player.name}: ${payload.text.trim().slice(0, 180)}`;
    game.finalWishes.unshift(wish);
    renderFinal();
}

function renderAll() {
    const current = SCENES[game.scene - 1];
    sceneTitle.textContent = current.title;
    sceneDesc.textContent = current.desc;
    setActiveView();
    renderParty();
    renderQuiz();
    renderBoss();
    renderFinal();
    luckValue.textContent = String(game.luck);
    nextQuestionBtn.hidden = game.scene !== 2;
    rollFateBtn.hidden = game.scene !== 5;
}

function setActiveView() {
    const map = {
        1: "guild-view",
        2: "quiz-view",
        3: "advice-view",
        4: "boss-view",
        5: "luck-view",
        6: "final-view"
    };
    const activeId = map[game.scene];
    document.querySelectorAll(".scene-view").forEach((node) => {
        node.classList.toggle("active", node.id === activeId);
    });
}

function renderParty() {
    const players = [...game.players.values()];
    partyList.innerHTML = "";
    if (!players.length) {
        partyList.innerHTML = `<div class="player-chip">Пока пусто. Позовите первых героев.</div>`;
        return;
    }

    players.forEach((player) => {
        const card = document.createElement("div");
        card.className = "player-chip";
        card.innerHTML = `<strong>${escapeHtml(player.name)}</strong><span>${escapeHtml(player.className)} | +${player.bonusRoll} к броскам</span>`;
        partyList.appendChild(card);
    });
}

function renderQuiz() {
    const question = QUESTIONS[game.questionIndex];
    if (!question) return;
    questionTitle.textContent = question.text;
    questionProgress.textContent = `Вопрос ${game.questionIndex + 1} из ${QUESTIONS.length}`;
}

function renderBoss() {
    const phaseIndex = game.bossHP > 66 ? 0 : game.bossHP > 33 ? 1 : 2;
    bossPhase.textContent = BOSS_PHASES[phaseIndex];
    bossHpText.textContent = String(game.bossHP);
    bossHpFill.style.width = `${game.bossHP}%`;
}

function renderFinal() {
    finalParty.innerHTML = "";
    finalWishes.innerHTML = "";

    [...game.players.values()].forEach((player) => {
        const li = document.createElement("li");
        li.textContent = `${player.name} — ${player.className}`;
        finalParty.appendChild(li);
    });

    game.finalWishes.slice(0, 24).forEach((wish) => {
        const li = document.createElement("li");
        li.textContent = wish;
        finalWishes.appendChild(li);
    });

    if (!game.finalWishes.length) {
        const li = document.createElement("li");
        li.textContent = "Пожелания пока не отправлены.";
        finalWishes.appendChild(li);
    }

    const love = Math.min(100, 30 + game.players.size * 8 + game.luck + game.adviceScrolls.length * 2);
    loveLevel.textContent = `Итоговый уровень любви партии: ${love}.`;
}

function addEvent(text) {
    game.events.unshift(text);
    game.events = game.events.slice(0, 80);
    eventLog.innerHTML = "";
    game.events.forEach((item) => addFeedItem(eventLog, item));
}

function addFeedItem(container, text) {
    const el = document.createElement("div");
    el.className = "feed-item";
    el.textContent = text;
    container.prepend(el);
}

function addScroll(text) {
    const el = document.createElement("div");
    el.className = "scroll-item";
    el.textContent = text;
    scrollFeed.prepend(el);
}

function floatDamage(text) {
    const el = document.createElement("div");
    el.className = "damage-float";
    el.textContent = text;
    damageLayer.appendChild(el);
    setTimeout(() => el.remove(), 760);
}

function screenShake() {
    document.body.classList.remove("shake");
    void document.body.offsetWidth;
    document.body.classList.add("shake");
}

function triggerCelebration() {
    for (let i = 0; i < 24; i += 1) {
        const spark = document.createElement("div");
        spark.className = "spark";
        spark.style.left = `${Math.random() * 100}%`;
        spark.style.top = `${30 + Math.random() * 50}%`;
        spark.style.animationDuration = `${2 + Math.random() * 2}s`;
        document.getElementById("bg-particles").appendChild(spark);
        setTimeout(() => spark.remove(), 2600);
    }
}

function createParticles() {
    const holder = document.getElementById("bg-particles");
    for (let i = 0; i < 26; i += 1) {
        const dot = document.createElement("span");
        dot.className = "spark";
        dot.style.left = `${Math.random() * 100}%`;
        dot.style.bottom = `${-10 - Math.random() * 50}px`;
        dot.style.animationDuration = `${8 + Math.random() * 10}s`;
        dot.style.animationDelay = `${Math.random() * -8}s`;
        holder.appendChild(dot);
    }
}

function buildSyncPayload() {
    const question = QUESTIONS[game.questionIndex];
    return {
        scene: game.scene,
        sceneTitle: SCENES[game.scene - 1].title,
        sceneDesc: SCENES[game.scene - 1].desc,
        question: question
            ? {
                id: question.id,
                text: question.text,
                options: question.options
            }
            : null,
        bossHP: game.bossHP,
        luck: game.luck
    };
}

function broadcast(message) {
    channel.post(message);
}

function d20() {
    return Math.floor(Math.random() * 20) + 1;
}

function escapeHtml(text) {
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}

function playTone(freq, duration) {
    if (!game.audioOn && freq < 500) return;
    if (!window.AudioContext && !window.webkitAudioContext) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new Ctx();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    gain.gain.value = 0.0001;
    gain.gain.exponentialRampToValueAtTime(0.035, audioCtx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration + 0.02);
    osc.onended = () => audioCtx.close();
}

function createChannel(name, onReceive) {
    const seen = new Set();
    const id = `${Math.random().toString(36).slice(2)}_${Date.now()}`;
    const storageKey = `ls_bus_${name}`;
    let bc = null;

    if ("BroadcastChannel" in window) {
        bc = new BroadcastChannel(name);
        bc.onmessage = (event) => processPacket(event.data);
    }

    window.addEventListener("storage", (event) => {
        if (event.key !== storageKey || !event.newValue) return;
        try {
            const packet = JSON.parse(event.newValue);
            processPacket(packet);
        } catch {
            return;
        }
    });

    function processPacket(packet) {
        if (!packet || packet.originId === id || seen.has(packet.msgId)) return;
        seen.add(packet.msgId);
        if (seen.size > 500) seen.clear();
        onReceive(packet.payload);
    }

    return {
        post(payload) {
            const packet = {
                msgId: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
                originId: id,
                payload
            };
            if (bc) bc.postMessage(packet);
            localStorage.setItem(storageKey, JSON.stringify(packet));
            localStorage.removeItem(storageKey);
        }
    };
}
