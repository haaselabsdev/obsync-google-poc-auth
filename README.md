# Obsync Google OAuth callback

Página estática de retorno para a POC do plugin Obsync. O fluxo usa Google OAuth Authorization Code com PKCE:

1. O plugin abre o consentimento do Google com o redirect HTTPS desta página.
2. O Google devolve um código temporário e o `state`.
3. Esta página remove os parâmetros da barra de endereço e encaminha `code`, `state` ou `error` ao handler `obsidian://obsync-google-poc-oauth`, junto do nome do vault extraído do state para o Obsidian selecionar a instalação correta.
4. O plugin confere o `state` e troca o código no endpoint oficial do Google usando o verifier PKCE.

Esta página não contém Client ID ou Client Secret, não recebe tokens e não chama uma API própria. O callback HTTPS inclui o código temporário e o state (que contém o nome do vault) na requisição à hospedagem GitHub Pages; depois, o script remove os parâmetros da barra de endereço e encaminha o código de uso único ao Obsidian, indicando o vault correto. O código requer o verifier PKCE que fica em memória no plugin. O Client Secret do OAuth Web é informado no plugin e enviado somente ao endpoint HTTPS de tokens do Google.

## Publicação

O repositório é publicado pelo GitHub Pages na branch `main`, diretório `/`. O URI de redirect exato é:

`https://haaselabsdev.github.io/obsync-google-poc-auth/callback.html`

Esse endereço deve ser adicionado em **Authorized redirect URIs** no cliente OAuth Google do tipo **Web application**. O redirect configurado no plugin deve ser idêntico.

O GitHub Pages precisa servir a página em HTTPS. A página pode ser hospedada em outro domínio controlado pelo usuário, desde que a URL de callback seja atualizada no Google Cloud e no plugin.
