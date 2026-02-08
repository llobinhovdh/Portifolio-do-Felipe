document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const loginScreen = document.getElementById('login-screen');
    const chatScreen = document.getElementById('chat-screen');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const confirmGroup = document.getElementById('confirm-group');
    const authError = document.getElementById('auth-error');
    const authTabs = document.querySelectorAll('.auth-tab');
    const btnLogin = document.getElementById('btn-login');
    const btnLogout = document.getElementById('btn-logout');
    const currentUserDisplay = document.getElementById('current-user-display');
    const userAvatarChar = document.getElementById('user-avatar-char');
    const messagesArea = document.getElementById('messages-area');
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const themeBtns = document.querySelectorAll('.seg-btn, .mini-theme');
    const canvas = document.getElementById('matrix-bg');
    const userCountDisplay = document.getElementById('user-count');
    const btnPanic = document.getElementById('btn-panic');
    const btnExport = document.getElementById('btn-export');
    const targetInput = document.getElementById('target-username');
    const btnAddTarget = document.getElementById('btn-add-target');
    const activeUsersList = document.getElementById('active-users-list');

    // --- State ---
    let currentUser = null;       // display name
    let currentUserKey = null;    // lowercase key
    let currentTheme = 'green';
    let currentTarget = 'broadcast';
    let authMode = 'login';
    let messagesUnsubscribe = null;
    const CHANNELS_KEY = 'alcateia_channels';

    // =========================================================
    //  FIREBASE - CADASTRO E LOGIN
    // =========================================================

    async function registerUser(username, password) {
        const key = username.toLowerCase().trim();

        if (key.length < 3) {
            return { ok: false, msg: 'ERRO: USUÁRIO DEVE TER NO MÍNIMO 3 CARACTERES' };
        }
        if (password.length < 6) {
            return { ok: false, msg: 'ERRO: SENHA DEVE TER NO MÍNIMO 6 CARACTERES' };
        }

        // Verifica se o nome de usuário já existe no Firestore
        const existing = await db.collection('usernames').doc(key).get();
        if (existing.exists) {
            return { ok: false, msg: 'ERRO: USUÁRIO JÁ EXISTE NO SISTEMA' };
        }

        try {
            const email = key + '@alcateia.app';
            const cred = await auth.createUserWithEmailAndPassword(email, password);

            // Salva o mapeamento de username no Firestore
            await db.collection('usernames').doc(key).set({
                uid: cred.user.uid,
                displayName: username,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Faz logout depois de cadastrar (para o usuário fazer login manualmente)
            await auth.signOut();

            return { ok: true, msg: 'CADASTRO REALIZADO COM SUCESSO' };
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                return { ok: false, msg: 'ERRO: USUÁRIO JÁ EXISTE NO SISTEMA' };
            }
            if (error.code === 'auth/weak-password') {
                return { ok: false, msg: 'ERRO: SENHA MUITO FRACA (MÍNIMO 6 CARACTERES)' };
            }
            return { ok: false, msg: 'ERRO: FALHA AO CADASTRAR' };
        }
    }

    async function authenticateUser(username, password) {
        const key = username.toLowerCase().trim();
        const email = key + '@alcateia.app';

        try {
            await auth.signInWithEmailAndPassword(email, password);

            // Busca o displayName do Firestore
            const doc = await db.collection('usernames').doc(key).get();
            const displayName = doc.exists ? doc.data().displayName : username;

            return { ok: true, username: displayName, key: key };
        } catch (error) {
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                return { ok: false, msg: 'ERRO: USUÁRIO OU SENHA INCORRETOS' };
            }
            if (error.code === 'auth/wrong-password') {
                return { ok: false, msg: 'ERRO: SENHA INCORRETA' };
            }
            if (error.code === 'auth/too-many-requests') {
                return { ok: false, msg: 'ERRO: MUITAS TENTATIVAS. AGUARDE E TENTE NOVAMENTE' };
            }
            return { ok: false, msg: 'ERRO: FALHA NA AUTENTICAÇÃO' };
        }
    }

    // =========================================================
    //  AUTH MODE TOGGLE (ENTRAR / CADASTRAR)
    // =========================================================

    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            authMode = tab.dataset.mode;
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            authError.textContent = '';
            authError.classList.remove('success');

            if (authMode === 'register') {
                confirmGroup.classList.remove('hidden');
                btnLogin.querySelector('.btn-text').textContent = 'CRIAR CONTA';
            } else {
                confirmGroup.classList.add('hidden');
                btnLogin.querySelector('.btn-text').textContent = 'INICIAR UPLINK';
            }
        });
    });

    // =========================================================
    //  AUDIO SYSTEM
    // =========================================================

    const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioCtxClass();

    const sounds = {
        click: () => playTone(800, 'square', 0.05, 0.1),
        chirp: () => playTone(1200, 'sine', 0.1, 0.05),
        alert: () => playTone(400, 'sawtooth', 0.3, 0.2),
        success: () => playTone(600, 'sine', 0.15, 0.08),
        error: () => playTone(200, 'square', 0.2, 0.1),
        hum: null
    };

    function playTone(freq, type, duration, vol = 0.1) {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(vol, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    }

    function startAmbience() {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        if (sounds.hum) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(50, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        sounds.hum = osc;
    }

    // =========================================================
    //  MATRIX RAIN EFFECT
    // =========================================================

    const ctx = canvas.getContext('2d');
    let width, height, columns;
    let drops = [];
    const fontSize = 14;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*";

    function initMatrix() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        columns = Math.floor(width / fontSize);
        drops = Array(columns).fill(1).map(() => Math.random() * -100);
    }

    function drawMatrix() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, width, height);

        const style = getComputedStyle(document.body);
        const color = style.getPropertyValue('--matrix-primary') || '#0f0';
        ctx.fillStyle = color;
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            const x = i * fontSize;
            const y = drops[i] * fontSize;

            if (Math.random() > 0.98) {
                ctx.fillStyle = '#fff';
                ctx.fillText(text, x, y);
                ctx.fillStyle = color;
            } else {
                ctx.fillText(text, x, y);
            }

            if (y > height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
        requestAnimationFrame(drawMatrix);
    }

    window.addEventListener('resize', initMatrix);
    initMatrix();
    drawMatrix();

    document.addEventListener('click', () => {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        startAmbience();
    });

    document.addEventListener('keydown', () => sounds.click());

    // =========================================================
    //  THEME LOGIC
    // =========================================================

    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => setTheme(btn.dataset.theme));
    });

    function setTheme(theme) {
        document.body.className = `theme-${theme}`;
        currentTheme = theme;
        document.querySelectorAll('.seg-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.theme === theme);
        });
    }

    // =========================================================
    //  CHANNELS / TARGETS
    // =========================================================

    function getChannelId(user1, user2) {
        return [user1.toLowerCase(), user2.toLowerCase()].sort().join('__');
    }

    window.selectChannel = function (id) {
        currentTarget = id;
        document.querySelectorAll('.user-item').forEach(item => {
            item.classList.toggle('active', item.dataset.id === id);
        });
        listenToMessages();
    };

    function loadChannels() {
        const stored = localStorage.getItem(CHANNELS_KEY + '_' + currentUserKey);
        const channels = stored ? JSON.parse(stored) : [];

        activeUsersList.innerHTML = '';

        // Canal global sempre presente
        const globalItem = document.createElement('div');
        globalItem.className = 'user-item active';
        globalItem.dataset.id = 'broadcast';
        globalItem.onclick = () => selectChannel('broadcast');
        globalItem.innerHTML = '<span class="user-avt">#</span><span class="user-name">GLOBAL</span>';
        activeUsersList.appendChild(globalItem);

        channels.forEach(ch => addChannelToList(ch));
    }

    function addChannelToList(name) {
        if (activeUsersList.querySelector(`[data-id="${name}"]`)) return;

        const item = document.createElement('div');
        item.className = 'user-item';
        item.dataset.id = name;
        item.onclick = () => selectChannel(name);
        item.innerHTML = `<span class="user-avt">${name[0].toUpperCase()}</span><span class="user-name">${name.toUpperCase()}</span>`;
        activeUsersList.appendChild(item);
    }

    function saveChannels() {
        const items = activeUsersList.querySelectorAll('.user-item');
        const channels = [];
        items.forEach(item => {
            if (item.dataset.id !== 'broadcast') channels.push(item.dataset.id);
        });
        localStorage.setItem(CHANNELS_KEY + '_' + currentUserKey, JSON.stringify(channels));
    }

    btnAddTarget.addEventListener('click', () => {
        const target = targetInput.value.trim();
        if (!target) return;
        addChannelToList(target);
        saveChannels();
        targetInput.value = '';
        selectChannel(target);
    });

    // =========================================================
    //  MESSAGES - FIRESTORE EM TEMPO REAL
    // =========================================================

    function listenToMessages() {
        // Para o listener anterior
        if (messagesUnsubscribe) {
            messagesUnsubscribe();
            messagesUnsubscribe = null;
        }

        let query;

        if (currentTarget === 'broadcast') {
            // Canal global: todas as mensagens com channel = 'broadcast'
            query = db.collection('messages')
                .where('channel', '==', 'broadcast')
                .orderBy('timestamp', 'asc')
                .limitToLast(100);
        } else {
            // DM: mensagens do canal privado entre os dois usuários
            const channelId = getChannelId(currentUserKey, currentTarget);
            query = db.collection('messages')
                .where('channel', '==', channelId)
                .orderBy('timestamp', 'asc')
                .limitToLast(100);
        }

        messagesUnsubscribe = query.onSnapshot(snapshot => {
            // Limpa a área de mensagens
            messagesArea.innerHTML = '';

            const sysMsg = document.createElement('div');
            sysMsg.className = 'system-msg';
            sysMsg.innerHTML = `<span>CONEXÃO ESTABELECIDA EM <span id="clock">${new Date().toLocaleTimeString()}</span></span>`;
            messagesArea.appendChild(sysMsg);

            snapshot.forEach(doc => {
                const msg = doc.data();
                if (msg.timestamp) {
                    const isSent = msg.senderKey === currentUserKey;
                    messagesArea.appendChild(createMessageElement(msg, isSent));
                }
            });

            scrollToBottom();
        }, error => {
            console.error('Erro ao ouvir mensagens:', error);
        });
    }

    async function sendMessage(text) {
        let channel;

        if (currentTarget === 'broadcast') {
            channel = 'broadcast';
        } else {
            channel = getChannelId(currentUserKey, currentTarget);
        }

        await db.collection('messages').add({
            sender: currentUser,
            senderKey: currentUserKey,
            text: text,
            channel: channel,
            target: currentTarget,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    }

    function createMessageElement(msg, isSent) {
        const div = document.createElement('div');
        div.className = `message ${isSent ? 'sent' : 'received'}`;

        const time = msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleTimeString() : '';
        div.innerHTML = `
            <div class="msg-header">
                <span>${escapeHtml(msg.sender).toUpperCase()}</span>
                <span>${time}</span>
            </div>
            <div class="msg-content">${escapeHtml(msg.text)}</div>
        `;
        return div;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function scrollToBottom() {
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }

    // =========================================================
    //  AUTH HANDLER
    // =========================================================

    async function handleAuth() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            showError('PREENCHA TODOS OS CAMPOS');
            sounds.error();
            return;
        }

        const btnText = btnLogin.querySelector('.btn-text');
        btnLogin.disabled = true;

        if (authMode === 'register') {
            const confirmPass = confirmPasswordInput.value;
            if (password !== confirmPass) {
                showError('ERRO: SENHAS NÃO COINCIDEM');
                sounds.error();
                btnLogin.disabled = false;
                return;
            }

            btnText.textContent = 'REGISTRANDO...';

            const result = await registerUser(username, password);

            if (result.ok) {
                showError(result.msg, true);
                sounds.success();
                setTimeout(() => {
                    authTabs[0].click(); // Muda para modo login
                    usernameInput.value = username;
                    passwordInput.value = '';
                    confirmPasswordInput.value = '';
                    btnLogin.disabled = false;
                }, 1200);
            } else {
                showError(result.msg);
                sounds.error();
                btnLogin.disabled = false;
                btnText.textContent = 'CRIAR CONTA';
            }
        } else {
            btnText.textContent = 'AUTENTICANDO...';

            const result = await authenticateUser(username, password);

            if (result.ok) {
                sounds.success();
                enterChat(result.username, result.key);
            } else {
                showError(result.msg);
                sounds.error();
                btnLogin.disabled = false;
                btnText.textContent = 'INICIAR UPLINK';
            }
        }
    }

    function showError(msg, isSuccess = false) {
        authError.textContent = msg;
        authError.classList.toggle('success', isSuccess);
    }

    async function enterChat(username, key) {
        currentUser = username;
        currentUserKey = key;

        loginScreen.classList.add('hidden');
        loginScreen.classList.remove('active');

        chatScreen.classList.remove('hidden');
        setTimeout(() => chatScreen.classList.add('active'), 100);

        currentUserDisplay.textContent = currentUser.toUpperCase();
        userAvatarChar.textContent = currentUser[0].toUpperCase();

        // Conta total de usuários registrados
        const usersSnapshot = await db.collection('usernames').get();
        userCountDisplay.textContent = usersSnapshot.size;

        loadChannels();
        listenToMessages();

        // Reset botão
        btnLogin.disabled = false;
        btnLogin.querySelector('.btn-text').textContent = 'INICIAR UPLINK';
        passwordInput.value = '';
        confirmPasswordInput.value = '';
        authError.textContent = '';
    }

    // =========================================================
    //  EVENT LISTENERS
    // =========================================================

    btnLogin.addEventListener('click', handleAuth);

    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAuth();
    });
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAuth();
    });
    confirmPasswordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAuth();
    });

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = messageInput.value.trim();
        if (!text) return;

        messageInput.value = '';
        sounds.chirp();

        try {
            await sendMessage(text);
        } catch (err) {
            console.error('Erro ao enviar mensagem:', err);
        }
    });

    btnLogout.addEventListener('click', async () => {
        if (messagesUnsubscribe) messagesUnsubscribe();
        await auth.signOut();
        location.reload();
    });

    btnPanic.addEventListener('click', () => {
        messagesArea.innerHTML = '';
        const panicMsg = document.createElement('div');
        panicMsg.className = 'system-msg';
        panicMsg.innerHTML = '<span style="color:var(--alert)">!!! SISTEMA COMPROMETIDO - DADOS APAGADOS !!!</span>';
        messagesArea.appendChild(panicMsg);
    });

    btnExport.addEventListener('click', async () => {
        let channel;
        if (currentTarget === 'broadcast') {
            channel = 'broadcast';
        } else {
            channel = getChannelId(currentUserKey, currentTarget);
        }

        const snapshot = await db.collection('messages')
            .where('channel', '==', channel)
            .orderBy('timestamp', 'asc')
            .get();

        if (snapshot.empty) return alert('Nenhum log para exportar.');

        let content = "--- LOG DA ALCATEIA DIGITAL ---\n";
        content += `--- Canal: ${currentTarget.toUpperCase()} ---\n\n`;

        snapshot.forEach(doc => {
            const m = doc.data();
            const time = m.timestamp ? new Date(m.timestamp.toDate()).toLocaleString() : 'pendente';
            content += `[${time}] ${m.sender} -> ${m.target}: ${m.text}\n`;
        });

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `alcateia_log_${currentTarget}_${Date.now()}.txt`;
        a.click();
    });

    // Relógio
    setInterval(() => {
        const c = document.getElementById('clock');
        if (c) c.innerText = new Date().toLocaleTimeString();
    }, 1000);

    // =========================================================
    //  AUTO-LOGIN (se já estiver autenticado no Firebase)
    // =========================================================

    auth.onAuthStateChanged(async (user) => {
        if (user && !currentUser) {
            const email = user.email;
            const key = email.replace('@alcateia.app', '');
            const doc = await db.collection('usernames').doc(key).get();
            if (doc.exists) {
                enterChat(doc.data().displayName, key);
            }
        }
    });
});
