const GAME_CHANNEL = "legendary_union_channel_v1";

const SCENES = [
    {
        id: 1,
        title: "Сбор гильдии",
        desc: "Игроки присоединяются и получают классы, бонусы и тайные роли."
    },
    {
        id: 2,
        title: "Испытание I. Хранители Летописей",
        desc: "Гости проверяют, насколько хорошо знают путь героев."
    },
    {
        id: 3,
        title: "Испытание II. Совет Мудрецов",
        desc: "Гости делятся короткими советами для новой семейной кампании."
    },
    {
        id: 4,
        title: "Испытание III. Битва с Лордом Бытовухусом",
        desc: "Молодожены решают бытовые ситуации, а гости комментируют и оценивают."
    },
    {
        id: 5,
        title: "Испытание IV. Куб Судьбы",
        desc: "Каждый гость бросает d6 и получает пророческое задание."
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
        text: "Где познакомились молодожены?",
        options: ["В университете", "На работе", "Через друзей", "В путешествии"],
        correct: 2
    },
    {
        id: "q2",
        text: "Где прошло первое свидание?",
        options: ["Кафе", "Парк", "Кино", "Набережная"],
        correct: 0
    },
    {
        id: "q3",
        text: "Какое их любимое место для отдыха?",
        options: ["Горы", "Море", "Дача", "Городские прогулки"],
        correct: 3
    },
    {
        id: "q4",
        text: "Где и как произошло предложение?",
        options: ["На закате в поездке", "Дома за ужином", "В ресторане", "На прогулке"],
        correct: 0
    },
    {
        id: "q5",
        text: "Какое их любимое общее блюдо?",
        options: ["Паста", "Пицца", "Суши", "Плов"],
        correct: 1
    },
    {
        id: "q6",
        text: "Какая была первая совместная поездка?",
        options: ["Санкт-Петербург", "Сочи", "Казань", "Калининград"],
        correct: 2
    },
    {
        id: "q7",
        text: "Какое место для прогулок они любят больше всего?",
        options: ["Парк", "Центр города", "Набережная", "Лесная тропа"],
        correct: 2
    }
];

const BOSS_SITUATIONS = [
    "Вы нашли идеальное кафе для ужина. Свободный столик только один: у окна с шумной компанией или тихий стол под кондиционером. Как решаете?",
    "В путешествии бронь жилья оказалась на неправильную дату. Как исправляете ситуацию?",
    "Один хочет активный день, другой — ленивый. Как распределить время?",
    "На кассе в магазине 17 товаров вместо одного. Как объясняете друг другу выбор?",
    "Надо собрать шкаф без инструкции. Как пройти этот квест вместе?",
    "Во время просмотра сериала один случайно посмотрел серию вперед. Как исправляете ситуацию?",
    "Утро. Планы резко поменялись. Как организовать сборы без потерь и скандалов?",
    "В отпуске один взял половину дома, а другой \"по минимуму\". Как делите багаж?"
];

const CUBE_TASKS = {
    1: "Предсказать событие из будущей жизни молодоженов.",
    2: "Назвать достижение, которое они обязательно откроют.",
    3: "Подарить новую суперспособность.",
    4: "Придумать новый семейный квест.",
    5: "Назвать легендарный артефакт, который поможет им в жизни.",
    6: "Произнести благословение от имени любого фэнтезийного персонажа."
};

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
    bossMessages: [],
    bossSituationIndex: 0,
    bossHP: 100,
    cubeRolls: [],
    finalWishes: [],
    audioOn: false
};

const roomId = getOrCreateRoomId();
const channel = createHostChannel(GAME_CHANNEL, roomId, onMessage);
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
const bossSituationText = document.getElementById("boss-situation-text");
const bossSituationProgress = document.getElementById("boss-situation-progress");
const nextBossSituationBtn = document.getElementById("next-boss-situation-btn");
let bossBubbleLayer = document.getElementById("boss-bubble-layer");
let bossMessagesList = document.getElementById("boss-messages-list");
const damageLayer = document.getElementById("damage-layer");
const luckValue = document.getElementById("luck-value");
const cubeFeed = document.getElementById("cube-feed");
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
    ensureBossEffectElements();
    setupLinkAndQR(roomId);
    createParticles();
    renderAll();
    addEvent("Система готова. Ждем новых героев.");
    nextSceneBtn.addEventListener("click", onNextScene);
    nextQuestionBtn.addEventListener("click", onNextQuestion);
    nextBossSituationBtn.addEventListener("click", onNextBossSituation);
    rollFateBtn.addEventListener("click", onRollFate);
    finishBtn.addEventListener("click", onFinishCampaign);
    audioToggle.addEventListener("click", onToggleAudio);
    copyLinkBtn.addEventListener("click", onCopyLink);

    broadcast({
        type: "state-sync",
        payload: buildSyncPayload()
    });
}

function ensureBossEffectElements() {
    const bossView = document.getElementById("boss-view");
    if (!bossView) return;

    if (!bossBubbleLayer) {
        bossBubbleLayer = document.createElement("div");
        bossBubbleLayer.id = "boss-bubble-layer";
        bossBubbleLayer.className = "boss-bubble-layer";
        bossBubbleLayer.setAttribute("aria-hidden", "true");
        const beforeNode = damageLayer || bossView.firstChild;
        bossView.insertBefore(bossBubbleLayer, beforeNode);
    }

    if (!bossMessagesList) {
        const chatWrap = document.createElement("div");
        chatWrap.className = "boss-chat";
        chatWrap.innerHTML = "<h4>Удары партии</h4>";
        bossMessagesList = document.createElement("div");
        bossMessagesList.id = "boss-messages-list";
        bossMessagesList.className = "boss-messages-list";
        chatWrap.appendChild(bossMessagesList);
        bossView.appendChild(chatWrap);
    }
}

function onMessage(message) {
    if (!message || typeof message !== "object") return;
    const { type, payload } = message;

    if (type === "join-player") handleJoin(payload);
    if (type === "quiz-answer") handleQuizAnswer(payload);
    if (type === "advice") handleAdvice(payload);
    if (type === "boss-attack") handleBossAttack(payload);
    if (type === "cube-roll") handleCubeRoll(payload);
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
    if (game.scene === 4) {
        addEvent("Мудрость собрана. Теперь герои обладают знаниями, которых хватит не на один десяток уровней вперед.");
    }
    broadcast({
        type: "state-sync",
        payload: buildSyncPayload()
    });
}

function onNextQuestion() {
    if (game.scene !== 2) return;
    const lastQuestion = game.questionIndex >= QUESTIONS.length - 1;
    if (lastQuestion) {
        addEvent("Летописцы королевства подтверждают: история героев достойна сохраниться на многие поколения вперед.");
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
        d20Die.textContent = "∞";
        addEvent("Куб Судьбы завершил пророчество. Новые приключения ждут впереди.");
        triggerCelebration();
        game.scene = 6;
        renderAll();
        broadcast({ type: "state-sync", payload: buildSyncPayload() });
    }, 1150);
}

function onNextBossSituation() {
    if (game.scene !== 4) return;
    if (game.bossSituationIndex >= BOSS_SITUATIONS.length - 1) {
        addEvent("Лорд Бытовухус повержен. Путь к Кубу Судьбы открыт.");
        game.scene = 5;
        renderAll();
        broadcast({ type: "state-sync", payload: buildSyncPayload() });
        return;
    }
    game.bossSituationIndex += 1;
    renderBoss();
    addEvent(`Новая бытовая ситуация: ${game.bossSituationIndex + 1} из ${BOSS_SITUATIONS.length}.`);
    broadcast({ type: "state-sync", payload: buildSyncPayload() });
}

function onFinishCampaign() {
    addEvent("Кампания завершена. Спасибо гильдии друзей.");
    game.scene = 1;
    game.questionIndex = 0;
    game.questionAnswers.clear();
    game.adviceScrolls = [];
    game.bossMessages = [];
    game.bossSituationIndex = 0;
    game.finalWishes = [];
    game.bossHP = 100;
    game.cubeRolls = [];
    d20Die.textContent = "d6";
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

function setupLinkAndQR(currentRoomId) {
    const url = new URL(window.location.href);
    url.pathname = url.pathname.replace(/[^/]*$/, "controller.html");
    url.search = `?room=${encodeURIComponent(currentRoomId)}`;
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

    const actionText = payload.text.trim().slice(0, 140);
    const bubbleText = `${player.name}: ${actionText}`;
    game.bossHP = Math.max(0, game.bossHP - damage);
    renderBoss();
    animateAttackBubble(bubbleText, crit, fail);
    rememberBossMessage(bubbleText, crit, fail, damage);
    floatDamage(`-${damage}`);
    screenShake();
    const logText = crit
        ? `Критический комментарий! ${player.className} ${player.name}: "${actionText}" (${damage} урона).`
        : fail
            ? `${player.className} ${player.name} отвлекся, но все равно поддержал пару (${damage} урона).`
            : `${player.className} ${player.name}: "${actionText}" (${damage} урона).`;

    addEvent(logText);
    playTone(crit ? 620 : 330, crit ? 0.15 : 0.08);

    if (Math.random() < 0.3) {
        addEvent(RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)]);
    }

    if (game.bossHP <= 0) {
        game.bossHP = 100;
    }
    broadcast({ type: "state-sync", payload: buildSyncPayload() });
}

function handleCubeRoll(payload) {
    if (game.scene !== 5) return;
    if (!payload || !payload.playerId || !payload.roll) return;
    const player = game.players.get(payload.playerId);
    if (!player) return;

    const roll = Math.max(1, Math.min(6, Number(payload.roll) || 1));
    const task = CUBE_TASKS[roll];
    const line = `${player.name} бросил d6: ${roll}. ${task}`;
    game.cubeRolls.unshift(line);
    game.cubeRolls = game.cubeRolls.slice(0, 40);
    d20Die.textContent = String(roll);
    renderCubeFeed();
    addEvent(line);
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
    renderBossMessages();
    renderCubeFeed();
    renderFinal();
    luckValue.textContent = String(game.cubeRolls.length);
    nextQuestionBtn.hidden = game.scene !== 2;
    nextBossSituationBtn.hidden = game.scene !== 4;
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
    bossSituationText.textContent = BOSS_SITUATIONS[game.bossSituationIndex] || "Все ситуации пройдены.";
    bossSituationProgress.textContent = `Ситуация ${Math.min(game.bossSituationIndex + 1, BOSS_SITUATIONS.length)} из ${BOSS_SITUATIONS.length}`;
}

function renderBossMessages() {
    bossMessagesList.innerHTML = "";
    if (!game.bossMessages.length) {
        const empty = document.createElement("div");
        empty.className = "boss-msg";
        empty.textContent = "Пока тихо. Первое сообщение запустит атаку.";
        bossMessagesList.appendChild(empty);
        return;
    }

    game.bossMessages.forEach((msg) => {
        const item = document.createElement("div");
        item.className = `boss-msg${msg.crit ? " crit" : ""}${msg.fail ? " fail" : ""}`;
        item.textContent = `${msg.text} (-${msg.damage} HP)`;
        bossMessagesList.appendChild(item);
    });
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

    const love = Math.min(100, 30 + game.players.size * 8 + game.cubeRolls.length + game.adviceScrolls.length * 2);
    loveLevel.textContent = `Итоговый уровень любви партии: ${love}.`;
}

function renderCubeFeed() {
    cubeFeed.innerHTML = "";
    if (!game.cubeRolls.length) {
        const item = document.createElement("div");
        item.className = "feed-item";
        item.textContent = "Бросков пока нет.";
        cubeFeed.appendChild(item);
        return;
    }

    game.cubeRolls.forEach((line) => addFeedItem(cubeFeed, line));
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

function animateAttackBubble(text, crit, fail) {
    const bubble = document.createElement("div");
    bubble.className = `attack-bubble${crit ? " crit" : ""}${fail ? " fail" : ""}`;
    bubble.textContent = text;
    bossBubbleLayer.appendChild(bubble);
    requestAnimationFrame(() => bubble.classList.add("fly"));
    setTimeout(() => bubble.remove(), 980);
}

function rememberBossMessage(text, crit, fail, damage) {
    game.bossMessages.unshift({ text, crit, fail, damage });
    game.bossMessages = game.bossMessages.slice(0, 22);
    renderBossMessages();
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
        bossSituation: BOSS_SITUATIONS[game.bossSituationIndex] || "",
        cubeRollCount: game.cubeRolls.length
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

function createHostChannel(name, currentRoomId, onReceive) {
    const hostPeerId = `legendary_host_${currentRoomId}`;
    const peers = new Map();
    const fallbackChannel = createLocalChannel(name, onReceive);
    let peerReady = false;

    if (window.Peer) {
        const peer = new window.Peer(hostPeerId);
        peer.on("open", () => {
            peerReady = true;
        });
        peer.on("connection", (connection) => {
            connection.on("data", (payload) => onReceive(payload));
            connection.on("open", () => {
                peers.set(connection.peer, connection);
                connection.send({ type: "state-sync", payload: buildSyncPayload() });
            });
            connection.on("close", () => {
                peers.delete(connection.peer);
            });
            connection.on("error", () => {
                peers.delete(connection.peer);
            });
        });
        peer.on("error", () => {
            peerReady = false;
        });
    }

    return {
        post(payload) {
            // Same-device fallback when PeerJS signaling is unavailable.
            fallbackChannel.post(payload);
            if (!peerReady) return;
            peers.forEach((connection) => {
                if (connection.open) connection.send(payload);
            });
        }
    };
}

function createLocalChannel(name, onReceive) {
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

function getOrCreateRoomId() {
    return `room_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
