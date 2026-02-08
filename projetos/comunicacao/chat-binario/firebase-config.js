// ============================================================
//  CONFIGURAÇÃO DO FIREBASE - ALCATEIA DIGITAL
// ============================================================
//
//  COMO CONFIGURAR:
//
//  1. Acesse: https://console.firebase.google.com
//  2. Clique em "Criar um projeto" (ou "Add project")
//  3. Dê um nome ao projeto (ex: alcateia-chat)
//  4. Desative o Google Analytics (não precisa) e crie
//  5. No painel, clique no ícone </> (Web) para adicionar um app
//  6. Dê um nome (ex: alcateia-web) e clique "Registrar app"
//  7. Copie o objeto firebaseConfig que aparece e cole abaixo
//
//  DEPOIS ATIVE:
//
//  8. Menu lateral > Authentication > Get started
//     - Clique em "E-mail/senha" > Ativar > Salvar
//
//  9. Menu lateral > Firestore Database > Criar banco de dados
//     - Selecione "Iniciar no modo de teste"
//     - Escolha a região (southamerica-east1 para Brasil)
//     - Clique "Criar"
//
// ============================================================

const firebaseConfig = {
    apiKey: "COLE_SUA_API_KEY_AQUI",
    authDomain: "SEU-PROJETO.firebaseapp.com",
    projectId: "SEU-PROJETO",
    storageBucket: "SEU-PROJETO.firebasestorage.app",
    messagingSenderId: "000000000000",
    appId: "0:000000000000:web:000000000000000000"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);

// Referências globais
const auth = firebase.auth();
const db = firebase.firestore();
