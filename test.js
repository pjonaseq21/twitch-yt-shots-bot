const axios = require('axios');

const clientId = 'lp8l4bp50oaj3p2ll75y90sddildvw';
const clientSecret = 'z0xe51rie687asq94fs6ejobdqm7u2';
const grantType = 'client_credentials';
const scope = 'user:read:email';

async function getUserInfo() {
  try {
    const tokenResponse = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: grantType,
        scope: scope,
      },
    });

    const accessToken = tokenResponse.data.access_token;

    const userInfoResponse = await axios.get('https://api.twitch.tv/helix/users', {
      params: {
        id: '123456789', // tu wstaw poprawny identyfikator użytkownika
      },
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (userInfoResponse.status === 200 || userInfoResponse.status === 201) {
      console.log('Pobrano informacje o użytkowniku:', userInfoResponse.data.data[0]);
    } else {
      console.log('Wystąpił błąd podczas pobierania informacji o użytkowniku');
    }
  } catch (error) {
    console.error('Błąd pobierania danych użytkownika:', error);
  }
}

getUserInfo();