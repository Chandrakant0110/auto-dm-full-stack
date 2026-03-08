// server/api/auth/instagram/callback.get.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const code = query.code as string | undefined
  const config = useRuntimeConfig()
  
  const cleanCode = code ? code.replace('#_', '') : ''
  const redirectUri = `${config.public.siteUrl}/api/auth/instagram/callback`

  event.node.res.setHeader('Content-Type', 'text/html')
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Instagram OAuth Debug</title>
        <style>
          body { font-family: monospace; margin: 2rem; background: #111; color: #eee; }
          .container { max-width: 800px; margin: 0 auto; background: #222; padding: 2rem; border-radius: 8px; }
          input { width: 100%; padding: 8px; margin-bottom: 12px; background: #333; color: white; border: 1px solid #555; }
          button { padding: 10px 20px; background: #2563eb; color: white; border: none; cursor: pointer; border-radius: 4px; }
          pre { background: #000; padding: 1rem; overflow-x: auto; white-space: pre-wrap; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Instagram OAuth Debugger</h2>
          <p>We received the code query parameter from Meta. Review the fields below before attempting to exchange it.</p>
          
          <div>
            <label>Client ID:</label>
            <input id="client_id" value="${config.public.instagramAppId}" />
            
            <label>Client Secret:</label>
            <input id="client_secret" value="${config.instagramAppSecret}" />
            
            <label>Redirect URI (must EXACTLY match the one in Meta app dashboard):</label>
            <input id="redirect_uri" value="${redirectUri}" />
            
            <label>Code (stripped of #_):</label>
            <input id="code" value="${cleanCode}" />
            
            <button id="exchangeBtn">Execute Meta POST Request</button>
          </div>

          <div id="result" style="margin-top: 2rem; display: none;">
            <h3>Meta Response:</h3>
            <pre id="resultOutput"></pre>
          </div>
        </div>

        <script>
          document.getElementById('exchangeBtn').addEventListener('click', async () => {
            const btn = document.getElementById('exchangeBtn');
            const resultDiv = document.getElementById('result');
            const resultOutput = document.getElementById('resultOutput');
            
            btn.innerText = 'Exchanging...';
            btn.disabled = true;
            resultDiv.style.display = 'block';
            resultOutput.innerText = 'Loading...';

            try {
              const res = await fetch('/api/auth/instagram/test-exchange', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  client_id: document.getElementById('client_id').value,
                  client_secret: document.getElementById('client_secret').value,
                  redirect_uri: document.getElementById('redirect_uri').value,
                  code: document.getElementById('code').value,
                })
              });
              
              const data = await res.json();
              resultOutput.innerText = JSON.stringify(data, null, 2);
            } catch (err) {
              resultOutput.innerText = String(err);
            }

            btn.innerText = 'Execute Meta POST Request';
            btn.disabled = false;
          });
        </script>
      </body>
    </html>
  `
})
