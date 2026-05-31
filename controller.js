const GAME_CHANNEL = "legendary_union_channel_v1";

const CLASS_POOL = [
    { className: "Бард", bonusRoll: 2 },
    { className: "Паладин Любви", bonusRoll: 3 },
    { className: "Маг Шампанского", bonusRoll: 1 },
    { className: "Следопыт Свидетеля", bonusRoll: 2 },
    { className: "Варвар Танцпола", bonusRoll: 2 }
];

const BONUS_POOL = [
    "+2 к тостам",
    "Иммунитет к неловким паузам",
    "+5 к харизме после шампанского",
    "+3 к шуткам в нужный момент",
    "Крит на каждом втором «горько»"
];

const SECRET_POOL = [
    "Тайная миссия: заставить кого-то засмеяться.",
    "Тайная миссия: добиться слова «горько».",
    "Тайная миссия: сделать фото с тремя гостями.",
    "Тайная миссия: произнести тост голосом Гэндальфа.",
    "Тайная миссия: подарить комплимент соседу по столу."
];

const state = {
    playerId: getOrCreatePlayerId(),
    joined: false,
    name: "",
    className: "",
    bonusRoll: 0,
    bonusText: "",
    secretRole: "",
    scene: 1,
    currentQuestionId: "",
    answeredQuestionIds: new Set(),
    luckPressCount: 0
};

const roomId = getRoomIdFromURL();
const channel = createControllerChannel(GAME_CHANNEL, roomId, onMessage);

const joinPanel = document.getElementById("join-panel");
const profilePanel = document.getElementById("profile-panel");
const actionPanel = document.getElementById("action-panel");
const playerNameInput = document.getElementById("player-name");
const joinBtn = document.getElementById("join-btn");
const playerTitle = document.getElementById("player-title");
const playerClassLine = document.getElementById("player-class-line");
const playerBonusLine = document.getElementById("player-bonus-line");
const playerSecretLine = document.getElementById("player-secret-line");
const sceneTitle = document.getElementById("controller-scene-title");
const sceneDesc = document.getElementById("controller-scene-desc");
const quizAction = document.getElementById("scene-action-quiz");
const controllerQuestion = document.getElementById("controller-question");
const controllerAnswers = document.getElementById("controller-answers");
const quizResult = document.getElementById("quiz-result");
const adviceAction = document.getElementById("scene-action-advice");
const adviceInput = document.getElementById("advice-input");
const sendAdviceBtn = document.getElementById("send-advice-btn");
const adviceStatus = document.getElementById("advice-status");
const bossAction = document.getElementById("scene-action-boss");
const attackInput = document.getElementById("attack-input");
const attackBtn = document.getElementById("attack-btn");
const quickAttackBtn = document.getElementById("quick-attack-btn");
const attackStatus = document.getElementById("attack-status");
const luckAction = document.getElementById("scene-action-luck");
const luckBtn = document.getElementById("luck-btn");
const luckStatus = document.getElementById("luck-status");
const finalAction = document.getElementById("scene-action-final");
const wishInput = document.getElementById("wish-input");
const wishBtn = document.getElementById("wish-btn");
const wishStatus = document.getElementById("wish-status");

hydratePlayer();
renderJoinState();

joinBtn.addEventListener("click", onJoin);
sendAdviceBtn.addEventListener("click", onSendAdvice);
attackBtn.addEventListener("click", onAttack);
quickAttackBtn.addEventListener("click", () => {
    attackInput.value = "Обсуждать все спокойно и без финального босса в голове.";
    onAttack();
});
luckBtn.addEventListener("click", onLuckPush);
wishBtn.addEventListener("click", onSendWish);

channel.post({ type: "request-sync", payload: { playerId: state.playerId } });

function onJoin() {
    const name = playerNameInput.value.trim().slice(0, 30);
    if (!name) {
        playerNameInput.focus();
        return;
    }

    const pickedClass = pickRandom(CLASS_POOL);
    state.joined = true;
    state.name = name;
    state.className = pickedClass.className;
    state.bonusRoll = pickedClass.bonusRoll;
    state.bonusText = pickRandom(BONUS_POOL);
    state.secretRole = pickRandom(SECRET_POOL);
    persistPlayer();

    channel.post({
        type: "join-player",
        payload: {
            playerId: state.playerId,
            name: state.name,
            className: state.className,
            bonusRoll: state.bonusRoll,
            bonusText: state.bonusText,
            secretRole: state.secretRole
        }
    });

    renderJoinState();
}

function onSendAdvice() {
    if (!state.joined) return;
    const text = adviceInput.value.trim().slice(0, 180);
    if (!text) return;

    channel.post({
        type: "advice",
        payload: {
            playerId: state.playerId,
            text
        }
    });
    adviceInput.value = "";
    adviceStatus.textContent = "Свиток отправлен в Совет мудрецов.";
}

function onAttack() {
    if (!state.joined) return;
    const text = attackInput.value.trim().slice(0, 180);
    if (!text) return;

    channel.post({
        type: "boss-attack",
        payload: {
            playerId: state.playerId,
            text
        }
    });
    attackInput.value = "";
    attackStatus.textContent = "Атака отправлена.";
}

function onLuckPush() {
    if (!state.joined) return;
    state.luckPressCount += 1;
    channel.post({
        type: "luck-push",
        payload: {
            playerId: state.playerId,
            amount: 1
        }
    });
    luckStatus.textContent = `Вы поддержали удачу ${state.luckPressCount} раз.`;
}

function onSendWish() {
    if (!state.joined) return;
    const text = wishInput.value.trim().slice(0, 180);
    if (!text) return;
    channel.post({
        type: "final-wish",
        payload: {
            playerId: state.playerId,
            text
        }
    });
    wishInput.value = "";
    wishStatus.textContent = "Пожелание отправлено.";
}

function onMessage(message) {
    if (!message || typeof message !== "object") return;
    if (message.type !== "state-sync") return;
    applySync(message.payload);
}

function applySync(payload) {
    if (!payload) return;
    state.scene = Number(payload.scene) || 1;
    sceneTitle.textContent = payload.sceneTitle || "Ожидание";
    sceneDesc.textContent = payload.sceneDesc || "";
    renderSceneActions(payload);
}

function renderSceneActions(payload) {
    [quizAction, adviceAction, bossAction, luckAction, finalAction].forEach((node) => node.classList.add("hidden"));

    if (!state.joined) return;
    if (state.scene === 1) return;
    if (state.scene === 2) {
        quizAction.classList.remove("hidden");
        renderQuestion(payload.question);
        return;
    }
    if (state.scene === 3) {
        adviceAction.classList.remove("hidden");
        return;
    }
    if (state.scene === 4) {
        bossAction.classList.remove("hidden");
        return;
    }
    if (state.scene === 5) {
        luckAction.classList.remove("hidden");
        luckStatus.textContent = `Текущая удача партии: ${payload.luck || 0}`;
        return;
    }
    if (state.scene === 6) {
        finalAction.classList.remove("hidden");
    }
}

function renderQuestion(question) {
    if (!question) return;
    controllerQuestion.textContent = question.text;
    controllerAnswers.innerHTML = "";
    quizResult.textContent = "";

    state.currentQuestionId = question.id;
    const alreadyAnswered = state.answeredQuestionIds.has(question.id);

    question.options.forEach((optionText, idx) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn btn-ghost";
        btn.textContent = optionText;
        btn.disabled = alreadyAnswered;
        btn.addEventListener("click", () => {
            if (state.answeredQuestionIds.has(question.id)) return;
            state.answeredQuestionIds.add(question.id);
            channel.post({
                type: "quiz-answer",
                payload: {
                    playerId: state.playerId,
                    questionId: question.id,
                    answerIndex: idx
                }
            });
            quizResult.textContent = "Ответ отправлен. Ждем остальных.";
            renderQuestion(question);
        });
        controllerAnswers.appendChild(btn);
    });
}

function renderJoinState() {
    if (!state.joined) {
        joinPanel.classList.remove("hidden");
        profilePanel.classList.add("hidden");
        actionPanel.classList.add("hidden");
        return;
    }

    joinPanel.classList.add("hidden");
    profilePanel.classList.remove("hidden");
    actionPanel.classList.remove("hidden");

    playerTitle.textContent = `Герой: ${state.name}`;
    playerClassLine.textContent = `${state.className}`;
    playerBonusLine.textContent = `Бонус: ${state.bonusText} (броски +${state.bonusRoll})`;
    playerSecretLine.textContent = state.secretRole;
}

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getOrCreatePlayerId() {
    const key = "legendary_union_player_id";
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const created = `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(key, created);
    return created;
}

function persistPlayer() {
    localStorage.setItem(getPlayerStorageKey(), JSON.stringify({
        joined: state.joined,
        name: state.name,
        className: state.className,
        bonusRoll: state.bonusRoll,
        bonusText: state.bonusText,
        secretRole: state.secretRole
    }));
}

function hydratePlayer() {
    try {
        const raw = localStorage.getItem(getPlayerStorageKey());
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (!parsed.joined) return;
        state.joined = true;
        state.name = parsed.name || "";
        state.className = parsed.className || "";
        state.bonusRoll = Number(parsed.bonusRoll) || 0;
        state.bonusText = parsed.bonusText || "";
        state.secretRole = parsed.secretRole || "";
    } catch {
        return;
    }
}

function getPlayerStorageKey() {
    return roomId
        ? `legendary_union_player_${roomId}`
        : "legendary_union_player_fallback";
}

function createControllerChannel(name, currentRoomId, onReceive) {
    const fallbackChannel = createLocalChannel(name, onReceive);
    const pending = [];
    const hostPeerId = currentRoomId ? `legendary_host_${currentRoomId}` : "";
    let conn = null;

    if (currentRoomId && window.Peer) {
        const peer = new window.Peer();
        peer.on("open", () => connectToHost(peer));
        peer.on("error", () => {
            setTimeout(() => connectToHost(peer), 1200);
        });

        function connectToHost(peerRef) {
            if (conn && conn.open) return;
            conn = peerRef.connect(hostPeerId, { reliable: true });
            conn.on("open", () => {
                flushQueue();
                conn.send({ type: "request-sync", payload: { playerId: state.playerId } });
                if (state.joined) {
                    conn.send({
                        type: "join-player",
                        payload: {
                            playerId: state.playerId,
                            name: state.name,
                            className: state.className,
                            bonusRoll: state.bonusRoll,
                            bonusText: state.bonusText,
                            secretRole: state.secretRole
                        }
                    });
                }
            });
            conn.on("data", (payload) => onReceive(payload));
            conn.on("close", () => {
                setTimeout(() => connectToHost(peerRef), 1200);
            });
            conn.on("error", () => {
                setTimeout(() => connectToHost(peerRef), 1200);
            });
        }
    }

    function flushQueue() {
        while (pending.length && conn && conn.open) {
            conn.send(pending.shift());
        }
    }

    return {
        post(payload) {
            const usePeer = Boolean(currentRoomId && window.Peer);
            if (!usePeer) {
                fallbackChannel.post(payload);
                return;
            }

            if (conn && conn.open) conn.send(payload);
            else pending.push(payload);
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

function getRoomIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    const room = (params.get("room") || "").trim();
    if (/^[a-z0-9_-]{6,32}$/i.test(room)) return room;
    return "";
}
