const axios = require('axios');

async function getAccessToken(clientId, clientSecret, code, redirectUri) {
  try {
    // Make API request to get access token using authorization code
    const response = await axios.post('https://open-api.tiktok.com/oauth/access_token/', {
      client_key: clientId,
      client_secret: clientSecret,
      code: code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    console.log('Access token response:', response.data);
    return {
      accessToken: response.data.access_token,
      openId: response.data.open_id,
    };

  } catch (error) {
    console.error('Error getting access token:', error.message);
  }
}

// Example usage: get access token for user authorization code 'abcd1234' with client ID 'awwjga0xejagjns6', client secret 'fda3c3fb67b4ef61e478cd5099fce1df', and redirect URI 'https://your-redirect-uri.com'
getAccessToken('awwjga0xejagjns6', 'fda3c3fb67b4ef61e478cd5099fce1df', 'abcd1234', 'https://your-redirect-uri.com');