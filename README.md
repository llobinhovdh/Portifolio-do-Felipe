# Portfólio do Felipe

Portfólio pessoal com layout moderno e projetos demonstrativos. O site principal fica em `inicio.html` e reúne os projetos e links principais.

## Projetos
- Galáxia do Amor: experiência 3D com Three.js e trilha musical integrada.
- Assistente Educacional: flashcards, quiz, pomodoro e anotações (login local no navegador).
- Chat Binário: interface cyberpunk com sons e conversão para binário.

## Tecnologias
- HTML, CSS, JavaScript
- Three.js
- LocalStorage

## Estrutura
- `inicio.html`: página principal do portfólio.
- `estilos/principal.css`: estilos globais do portfólio.
- `scripts/principal.js`: interações da página principal.
- `projetos/assistente-educacional/inicio.html`: app de estudos.
- `projetos/comunicacao/chat-binario/`: projeto Chat Binário.
- `projetos/divertido/universo/galaxia-do-amor.html`: projeto Galáxia do Amor.

## Como executar
1. Abra `inicio.html` no navegador.
2. Para melhor compatibilidade, use um servidor local simples (ex.: extensão Live Server do VS Code).

## Login local (Assistente Educacional)
O login/cadastro funciona sem servidor. Os dados ficam salvos no navegador (LocalStorage). Em outro dispositivo ou ao limpar o navegador, os dados são perdidos.

## Publicar no GitHub Pages
1. Suba o repositório para o GitHub.
2. Em Settings > Pages, selecione a branch `main` e a pasta `/root`.
3. A URL publicada vai abrir `inicio.html` como página inicial.
