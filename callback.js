"use strict";

(() => {
  const title = document.querySelector("#title");
  const message = document.querySelector("#message");
  const returnLink = document.querySelector("#return-link");
  const incoming = new URLSearchParams(window.location.search);

  function oneValue(name, maxLength) {
    const values = incoming.getAll(name);
    if (values.length !== 1 || values[0].length === 0 || values[0].length > maxLength) return null;
    return values[0];
  }

  function vaultFromState(state) {
    const match = /^v1\.([\w-]{43})\.([\w-]{1,683})$/.exec(state);
    if (!match || state.length > 1024) return null;
    try {
      const encoded = match[2].replace(/-/g, "+").replace(/_/g, "/");
      const binary = atob(encoded + "=".repeat((4 - encoded.length % 4) % 4));
      if (binary.length > 512) return null;
      const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
      const name = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      return name.length > 0 ? name : null;
    } catch {
      return null;
    }
  }

  const code = oneValue("code", 8192);
  const state = oneValue("state", 1024);
  const error = oneValue("error", 128);
  const vault = state ? vaultFromState(state) : null;

  // O código fica somente nesta página e no link de retorno de uso único.
  // Remova os parâmetros da barra de endereço e do histórico antes de continuar.
  try {
    window.history.replaceState(null, "", window.location.pathname);
  } catch {
    // O botão de retorno continua disponível mesmo se o navegador bloquear o histórico.
  }

  let target;
  if (code && state && vault && !error) {
    title.textContent = "Autorização concluída";
    message.textContent = "O código de uso único será entregue ao plugin para finalizar o login.";
    target = new URL("obsidian://obsync-google-poc-oauth");
    target.searchParams.set("vault", vault);
    target.searchParams.set("code", code);
    target.searchParams.set("state", state);
  } else if (state && vault && error && !code) {
    title.textContent = "Autorização não concluída";
    message.textContent = "O Google cancelou ou recusou o login. Volte ao Obsidian e tente novamente.";
    target = new URL("obsidian://obsync-google-poc-oauth");
    target.searchParams.set("vault", vault);
    target.searchParams.set("error", error);
    target.searchParams.set("state", state);
  } else {
    title.textContent = "Retorno de login inválido";
    message.textContent = "Esta página só funciona durante um login iniciado no Obsync. Volte ao plugin e inicie outra tentativa.";
    return;
  }

  returnLink.href = target.toString();
  returnLink.hidden = false;

  // Tente reabrir o Obsidian automaticamente; o botão cobre navegadores que
  // exigem uma ação explícita para abrir links obsidian://.
  window.setTimeout(() => {
    window.location.href = target.toString();
  }, 350);
})();
