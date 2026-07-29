# ☁️ Como fazer o sistema salvar os dados na nuvem (Firebase)

Este guia mostra, passo a passo, como conectar o **Sistema de Reservas de Salas**
a um banco de dados online **gratuito** do Google (Firebase). Assim os cadastros
ficam salvos na nuvem e aparecem em **todos os dispositivos** em tempo real.

⏱️ Tempo estimado: **10 a 15 minutos**. Não precisa saber programar.

---

## Passo 1 — Criar a conta e o projeto

1. Acesse **https://console.firebase.google.com** e entre com sua conta Google.
2. Clique em **"Criar um projeto"** (ou "Add project").
3. Dê um nome, por exemplo: `reservas-salas`.
4. Pode **desativar** o Google Analytics (não é necessário) e clicar em **Criar projeto**.
5. Aguarde e clique em **Continuar**.

---

## Passo 2 — Criar o banco de dados (Firestore)

1. No menu à esquerda, clique em **Build → Firestore Database**.
2. Clique em **"Criar banco de dados"**.
3. Escolha o modo **"Iniciar no modo de teste"** (test mode).
   - Isso libera leitura/escrita por 30 dias. Depois ajustamos as regras (Passo 5).
4. Escolha a localização mais próxima (ex.: `southamerica-east1` — São Paulo).
5. Clique em **Ativar / Enable**.

---

## Passo 3 — Registrar o aplicativo web e pegar as chaves

1. Volte para a página inicial do projeto (ícone de casa no topo).
2. Clique no ícone **`</>`** (Web) para adicionar um app da Web.
3. Dê um apelido, ex.: `reservas-web`, e clique em **Registrar app**.
   - **Não** precisa marcar "Firebase Hosting".
4. O Firebase vai mostrar um trecho de código parecido com este:

```js
const firebaseConfig = {
  apiKey: "AIzaSyD...xxxxx",
  authDomain: "reservas-salas.firebaseapp.com",
  projectId: "reservas-salas",
  storageBucket: "reservas-salas.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};
```

5. **Copie esse bloco inteiro.** É a "chave" que liga o site ao banco.

---

## Passo 4 — Colar as chaves no sistema

1. Abra o arquivo **`index.html`** em um editor de texto (Bloco de Notas serve).
2. Procure por este trecho (está perto do fim do arquivo):

```js
const firebaseConfig = {
  apiKey: "COLE_AQUI",
  authDomain: "COLE_AQUI",
  ...
};
```

3. **Substitua** todo esse bloco pelo que você copiou do Firebase.
4. Salve o arquivo.
5. Suba a nova versão do `index.html` para o GitHub (ou abra localmente).

✅ Pronto! Ao abrir o sistema, a faixa no topo deve ficar **verde**:
"✅ Conectado à nuvem". Faça um cadastro de teste e abra em outro
aparelho — ele deve aparecer lá também. 🎉

---

## Passo 5 — (IMPORTANTE) Proteger o banco depois do teste

O "modo de teste" expira em 30 dias. Para manter o sistema funcionando e seguro:

1. No Firebase, vá em **Firestore Database → Regras (Rules)**.
2. Para um uso interno simples, você pode usar as regras abaixo
   (permite leitura/escrita apenas na coleção de reservas):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reservas/{doc} {
      allow read, write: if true;
    }
  }
}
```

3. Clique em **Publicar**.

> ⚠️ Essas regras deixam a coleção **aberta** (qualquer um com o endereço
> pode ler/gravar). Para uso interno do CT costuma ser suficiente. Se quiser
> mais segurança (login por senha), me avise que preparo a versão com
> autenticação.

---

## ❓ Dúvidas comuns

**A faixa ficou amarela ("Modo local"). O que significa?**
Você ainda não colou as chaves, ou colou incompleto. Refaça o Passo 4.

**Perco os dados que já tinha no modo local?**
Os dados antigos ficavam só no navegador. Ao migrar para a nuvem o sistema
começa "do zero" na nuvem — mas você pode exportar o CSV antigo antes
(botão Exportar CSV) para guardar.

**É gratuito mesmo?**
Sim. O plano gratuito (Spark) do Firebase é mais que suficiente para o uso
de um Centro de Treinamento.

**Funciona no iPhone e Android?**
Sim, funciona em qualquer navegador e dispositivo.

---
Qualquer dúvida na configuração, é só chamar! 💙
