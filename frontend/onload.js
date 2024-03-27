const getToken = async (code) => {

  console.log("code: ", code)
  const result = await fetch('http://localhost:5000/getToken', {
    method: 'POST',
    body: JSON.stringify({ code }),
    headers: {
      "Content-Type": "application/json",
    },
  })

  const resultJson = await result.json()
  console.log(resultJson, "resultJson", result)
  window.localStorage.setItem("access_token", resultJson.access_token)
  window.localStorage.setItem("token_type", resultJson.token_type)
  return resultJson
}

const getMe = async (tokenType, accessToken) => {
  const result = await fetch('http://localhost:5000/p/getMe', {
    headers: {
      authorization: `${tokenType} ${accessToken}`,
    },
  })

  const resultJson = await result.json()
  const { username, id, coins } = resultJson;
  document.getElementById('coins').innerText = coins;
  document.getElementById('info').innerText = `Logged in as: ${username} (id: ${id})`;
  return resultJson
}



window.onload = async () => {
  const accessToken = window.localStorage.getItem("access_token")

  const tokenType = window.localStorage.getItem("token_type")

  // get code from URL
  const fragment = new URLSearchParams(window.location.search);
  const code = fragment.get('code')
  console.log("code: ", code, "accessToken: ", accessToken, "tokenType: ", tokenType)

  if (!code && !accessToken || !code) {
    // if no code and no token (not logged in), 
    // show button "Login with Discord"
    document.getElementById('login').style.display = `block`;
    return
  }

  if (code) {
    // if there is code but no token (code not yet exchanged), 
    // exchange code for tokens and save tokens in localStorage
    console.log(code)
    window.history.replaceState({}, document.title, "/");  // set url to "/"
    const result = await getToken(code)
    if (result.token_type && result.access_token) {
      window.localStorage.setItem("token_type", result.token_type)
      window.localStorage.setItem("access_token", result.access_token)
      // get the user info
      getMe(result.token_type, result.access_token)
    }
  }
  if (accessToken) {
    // if token exists, just get the user info
    getMe(tokenType, accessToken)
  }
}