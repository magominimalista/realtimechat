# Chat em Tempo Real com Node.js

Um chat em tempo real com suporte a mensagens de texto, emojis, GIFs, imagens, áudio e captura de tela.

## 🚀 Funcionalidades

- 💬 Mensagens em tempo real
- 😊 Suporte a emojis
- 🖼️ Compartilhamento de GIFs (via GIPHY)
- 📸 Captura de tela
- 🎥 Captura de webcam
- 🎤 Gravação de áudio
- 📎 Upload de arquivos
- 🎨 Mensagens coloridas
- 🗑️ Exclusão de mensagens próprias
- 📜 Histórico de mensagens
- 🔄 Carregamento de mensagens antigas

## 🛠️ Tecnologias Utilizadas

- Node.js
- Express
- Socket.IO
- SQLite3
- TailwindCSS
- Plyr (player de áudio)
- EmojiMart
- Lightbox2
- Font Awesome

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- NPM ou Yarn

## 🔧 Instalação

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/chat-realtime.git
cd chat-realtime
```

2. Instale as dependências:

```bash
npm install
```

3. Configure a API key do GIPHY:

   - Crie uma conta em [GIPHY Developers](https://developers.giphy.com/)
   - Obtenha sua API key
   - Substitua a chave no arquivo `server.js`

4. Inicie o servidor:

```bash
npm start
```

5. Acesse o chat em `http://localhost:3000`

## 📦 Estrutura do Projeto

```
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── modules/
│   │   │   ├── audio.js
│   │   │   ├── elements.js
│   │   │   ├── file.js
│   │   │   ├── gif.js
│   │   │   ├── messages.js
│   │   │   ├── screen.js
│   │   │   ├── state.js
│   │   │   ├── ui.js
│   │   │   └── webcam.js
│   │   └── chat.js
│   └── uploads/
├── src/
│   └── database.js
├── index.html
├── server.js
├── package.json
└── README.md
```

## 💡 Recursos

- Interface moderna e responsiva
- Suporte a temas escuros
- Animações suaves
- Feedback visual de ações
- Tooltips informativos
- Visualização de imagens em lightbox
- Player de áudio personalizado
- Indicadores de carregamento
- Botões de ação contextuais

## 🔒 Segurança

- Validação de uploads
- Sanitização de inputs
- Proteção contra XSS
- Verificação de propriedade das mensagens
- Limpeza automática de arquivos deletados

## 📱 Responsividade

O chat é totalmente responsivo e se adapta a diferentes tamanhos de tela:

- Desktop
- Tablet
- Mobile

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## ✨ Agradecimentos

- [Socket.IO](https://socket.io/)
- [GIPHY](https://giphy.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Font Awesome](https://fontawesome.com/)
- [Plyr](https://plyr.io/)
- [EmojiMart](https://github.com/missive/emoji-mart)
