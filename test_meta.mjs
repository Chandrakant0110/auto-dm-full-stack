async function run() {
  const code = "AQC_EtB-C1Tmsh1xywBzy0ebZ8qFGNmfC1aLpd0rfr_x3RKgZsEFqQyrI3wlqkE-8mX_UtjmStb9AZy4iPKJ7lcfcQWvDGHJkxz1lxHJcCY6tCvN8CuqzVhbK9DXClUyY2zGCDt-8VWIR2WbiRUDu2ozX5VewZZfQZeOMfh_QP_ACY81nn9XHPZreHxQv1V60ZLiKXy4VLZfzBtgMOTzb0EgLhWgA74Lk1KCW8SARXmaDA";
  
  const body = new URLSearchParams({
    client_id: "1902341750660120",
    client_secret: "4557ba920452c2d37aaef91819b96d84",
    grant_type: "authorization_code",
    redirect_uri: "https://auto-dm-full-stack.vercel.app/api/auth/instagram/callback",
    code
  });

  try {
    const res = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
    console.log("Status:", res.status);
    const json = await res.text();
    console.log("Response:", json);
  } catch(e) {
    console.error("Error:", e);
  }
}
run();
