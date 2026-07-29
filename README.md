# 🗂️ Sistema de Reservas de Salas (versão com nuvem)

Sistema web para cadastro e controle de uso de salas, agora com **banco de dados
na nuvem** (Firebase). Os cadastros ficam salvos online e são compartilhados
entre **todos os dispositivos** em tempo real.

## ✨ Funcionalidades

- Cadastro com **Nome, Órgão, Tempo de uso e Sala** (botões de seleção rápida).
- **Período automático e editável** (Diário, Semanal, Quinzenal, Mensal).
- **Painel de gestão oculto** (clique no logo 🗂️ ou Ctrl+E): busca, filtro, edição e exclusão.
- **Exportar CSV** para backup em planilha.
- **☁️ Armazenamento na nuvem (Firebase)** — dados centralizados e em tempo real.
- **Modo local automático**: se o Firebase não estiver configurado, funciona salvando
  no próprio navegador (localStorage), sem quebrar.

## ⚙️ Configuração (IMPORTANTE)

Para os dados serem salvos na nuvem, siga o guia:
**➡️ Veja o arquivo [`CONFIGURAR-FIREBASE.md`](CONFIGURAR-FIREBASE.md)**

Enquanto o Firebase não for configurado, o sistema roda em **modo local**
(a faixa no topo fica amarela avisando).

## 🚀 Publicar no GitHub Pages

1. Faça upload dos arquivos para um repositório.
2. Vá em **Settings → Pages**, selecione a branch `main` e salve.
3. O site ficará em `https://SEU-USUARIO.github.io/NOME-DO-REPO/`.

## 📁 Arquivos

| Arquivo | Função |
|---|---|
| `index.html` | Sistema completo (com Firebase integrado). |
| `CONFIGURAR-FIREBASE.md` | Passo a passo para ativar a nuvem. |
| `README.md` | Este arquivo. |
| `.gitignore` | Arquivos ignorados pelo Git. |

---
Desenvolvido com 💙
