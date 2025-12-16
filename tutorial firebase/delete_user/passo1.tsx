Passo 1: Atualizar o Modelo de Dados do Usuário no Firestore/Realtime Database
Você precisará adicionar dois novos campos ao perfil do usuário no seu banco de dados Firebase (Firestore, provavelmente, dado que você já usa firebase/firestore):
isPendingDeletion: um booleano (true se a exclusão for solicitada, false caso contrário).
deletionScheduledDate: um timestamp (Date ou Timestamp do Firestore) que armazena a data em que a exclusão efetiva está agendada (ex: data de hoje + 15 dias).
Exemplo de como ficaria um documento de usuário no Firestore:

{
    "uid": "ykIhDTo4Qw...",
    "email": "usuario@exemplo.com",
    // ... outros campos do usuário ...
    "isPendingDeletion": true,
    "deletionScheduledDate": "2025-12-31T12:00:00.000Z" // Data futura (hoje + 15 dias)
  }