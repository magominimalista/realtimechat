require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const multer = require("multer");
const path = require("path");
const db = require("./src/database");
const fs = require("fs");
const fetch = require("node-fetch");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Aceitar MP3 além dos tipos já permitidos
    if (file.mimetype === "audio/mpeg" || file.mimetype === "audio/webm") {
      cb(null, true);
    } else {
      cb(null, true); // ou mantenha seus filtros existentes
    }
  },
});

app.use(express.static("public"));

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Nenhum arquivo enviado" });
  }

  res.json({
    filename: req.file.originalname,
    url: `/uploads/${req.file.filename}`,
  });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Rota para carregar mensagens antigas
app.get("/messages", (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = 10;

  db.get("SELECT COUNT(*) as total FROM messages", (err, count) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    // Calcular offset simples para paginação decrescente
    const offset = page * limit;

    db.all(
      `SELECT id, nickname, message as text, timestamp, color, fileUrl, fileName 
       FROM messages 
       ORDER BY id DESC 
       LIMIT ? 
       OFFSET ?`,
      [limit, offset],
      (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        // Inverter a ordem das mensagens antes de enviar
        const reversedRows = [...rows].reverse();

        res.json({
          messages: reversedRows,
          hasMore: offset + limit < count.total,
        });
      }
    );
  });
});

// Adicionar nova rota para deletar mensagem
app.delete("/message/:id", (req, res) => {
  const { id } = req.params;
  const { nickname } = req.query;

  db.get("SELECT * FROM messages WHERE id = ?", [id], (err, message) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!message || message.nickname !== nickname) {
      return res.status(403).json({ error: "Não autorizado" });
    }

    // Se houver arquivo, deletá-lo
    if (message.fileUrl) {
      const filePath = path.join(__dirname, "public", message.fileUrl);
      fs.unlink(filePath, (err) => {
        if (err) console.error("Erro ao deletar arquivo:", err);
      });
    }

    // Deletar mensagem do banco
    db.run("DELETE FROM messages WHERE id = ?", [id], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Emitir evento de mensagem deletada
      io.emit("message deleted", { id });
      res.json({ success: true });
    });
  });
});

// A chave da API estará disponível como:
const GIPHY_API_KEY = process.env.GIPHY_API_KEY;

// Adicionar nova rota para buscar GIFs
app.get("/search-gifs", async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    const url = `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(
      q
    )}&limit=20&rating=g`;

    console.log("Fazendo requisição para:", url); // Log para debug

    const response = await fetch(url);
    if (!response.ok) {
      console.error("Erro na resposta do GIPHY:", response.status); // Log para debug
      throw new Error("GIPHY API error");
    }

    const data = await response.json();
    console.log("Total de GIFs encontrados:", data.data?.length); // Log para debug

    res.json(data);
  } catch (error) {
    console.error("Erro detalhado ao buscar GIFs:", error); // Log para debug
    res
      .status(500)
      .json({ error: "Erro ao buscar GIFs", details: error.message });
  }
});

// Criar rota para proxy das requisições do Giphy
app.get("/api/giphy/search", async (req, res) => {
  const query = req.query.q;
  try {
    const response = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${query}&limit=20`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar GIFs" });
  }
});

io.on("connection", (socket) => {
  console.log("Um usuário se conectou");

  socket.on("user joined", (nickname) => {
    console.log(`${nickname} entrou no chat`);
    socket.nickname = nickname;
  });

  socket.on("disconnect", () => {
    console.log(`${socket.nickname || "Um usuário"} se desconectou`);
  });

  socket.on("chat message", (msgData) => {
    // Log para debug
    console.log("Recebendo mensagem:", msgData);

    db.run(
      `INSERT INTO messages (nickname, message, timestamp, color, fileUrl, fileName) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        msgData.nickname,
        msgData.text, // Aqui está usando text, mas no banco é message
        msgData.timestamp,
        msgData.color,
        msgData.fileUrl || null,
        msgData.fileName || null,
      ],
      function (err) {
        if (err) {
          console.error("Erro ao inserir mensagem:", err);
          return;
        }
        msgData.id = this.lastID;
        io.emit("chat message", msgData);
      }
    );
  });
});

server.listen(3000, () => {
  console.log("Servidor ouvindo na porta 3000");
});
