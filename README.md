# Sistema de Espaços SRA - Firebase + GitHub

Projeto estático para Firebase Hosting com dados no Cloud Firestore.

## Arquivos principais

- `index.html`: painel público dos espaços.
- `cadastro.html`: cadastro, edição, cancelamento e registros salvos.
- `style.css`: visual do sistema.
- `firebase-config.js`: configuração do Firebase.
- `app.js`: lógica da tela de cadastro com Firestore.
- `painel.js`: lógica do painel lendo o Firestore.
- `firebase.json`: configuração do Firebase Hosting.
- `.firebaserc`: projeto Firebase padrão.

## Como configurar

1. Abra `firebase-config.js`.
2. Substitua os valores por aqueles do seu Firebase Console:
   - apiKey
   - authDomain
   - projectId
   - storageBucket
   - messagingSenderId
   - appId
3. Abra `.firebaserc` e troque `SEU_PROJECT_ID_AQUI` pelo ID real do projeto.
4. No Firebase Console, crie o Cloud Firestore.
5. Para teste inicial, use regras temporárias:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /eventos/{eventoId} {
      allow read, write: if true;
    }
  }
}
```

> Importante: essas regras são apenas para teste. Depois, proteja com autenticação.

## Deploy manual

```bash
firebase login
firebase init hosting
firebase deploy
```

## Deploy GitHub Actions

Se quiser deploy automático via GitHub:

```bash
firebase init hosting:github
```

## Observações

- O botão de exportar CSV fica escondido no canto inferior direito da página `cadastro.html`.
- Cancelar não apaga o registro; apenas muda `status` para `CANCELADO`.
- Eventos concluídos continuam no histórico.