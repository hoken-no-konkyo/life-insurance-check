const COOKIE_NAME = "hoken_auth";

function loginPage(message = "") {
  return new Response(`<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ホケンの根拠｜必要保障額診断</title>
<style>
  *{box-sizing:border-box}
  body{
    margin:0;
    font-family:-apple-system,BlinkMacSystemFont,"Helvetica Neue","Noto Sans JP",sans-serif;
    background:#f5f7f8;
    color:#172033;
    min-height:100vh;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:24px;
  }
  .box{
    width:100%;
    max-width:420px;
    background:#fff;
    border-radius:20px;
    padding:32px 24px;
    box-shadow:0 8px 30px rgba(0,0,0,.08);
  }
  h1{font-size:22px;margin:0 0 8px;text-align:center}
  .sub{font-size:14px;color:#667085;text-align:center;margin-bottom:28px}
  input{
    width:100%;
    font-size:18px;
    padding:14px;
    border:1px solid #cfd5dc;
    border-radius:10px;
    margin-bottom:12px;
  }
  button{
    width:100%;
    border:0;
    border-radius:10px;
    padding:14px;
    font-size:16px;
    font-weight:700;
    background:#183b56;
    color:#fff;
  }
  .error{color:#c62828;font-size:13px;text-align:center;margin-bottom:12px}
  .note{font-size:12px;color:#7b8490;text-align:center;margin-top:20px}
</style>
</head>
<body>
<div class="box">
  <h1>ホケンの根拠</h1>
  <div class="sub">必要保障額診断</div>
  ${message ? `<div class="error">${message}</div>` : ""}
  <form method="POST" action="/login">
    <input
      type="password"
      name="code"
      placeholder="アクセスコード"
      autocomplete="off"
      required
    >
    <button type="submit">診断を開始する</button>
  </form>
  <div class="note">購入者専用ページです</div>
</div>
</body>
</html>`, {
    headers: {
      "content-type": "text/html; charset=UTF-8",
      "cache-control": "no-store"
    }
  });
}

function hasAuthCookie(request, env) {
  const cookie = request.headers.get("Cookie") || "";
  return cookie
    .split(";")
    .map(v => v.trim())
    .includes(`${COOKIE_NAME}=${env.ACCESS_CODE}`);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (!env.ACCESS_CODE) {
      return new Response("ACCESS_CODE is not configured.", { status: 500 });
    }

    if (url.pathname === "/login" && request.method === "POST") {
      const form = await request.formData();
      const code = String(form.get("code") || "");

      if (code !== env.ACCESS_CODE) {
        return loginPage("アクセスコードが違います。");
      }

      return new Response(null, {
        status: 303,
        headers: {
          "Location": "/",
          "Set-Cookie":
            `${COOKIE_NAME}=${env.ACCESS_CODE}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000`,
          "Cache-Control": "no-store"
        }
      });
    }

    if (!hasAuthCookie(request, env)) {
      return loginPage();
    }

    return env.ASSETS.fetch(request);
  }
};
