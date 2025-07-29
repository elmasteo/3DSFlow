const fetch = require('node-fetch');
const crypto = require('crypto');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Only POST allowed' };
  }

  try {
    const params = new URLSearchParams(event.body);
    const cres = params.get('cres');

    if (!cres || !transactionData) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing cres or transactionData' })
      };
    }

    const {
      sessionToken,
      merchantId,
      merchantSiteId,
      clientRequestId,
      userTokenId,
      relatedTransactionId,
      currency,
      amount,
      card,
      billingAddress,
      deviceDetails
    } = transactionData;

    const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
    const checksumRaw = merchantId + merchantSiteId + clientRequestId + timestamp + merchantSecretKey; // optional if you have a static secret
    const checksum = crypto.createHash('sha256').update(checksumRaw).digest('hex');

    const finalPayload = {
      sessionToken,
      merchantId,
      merchantSiteId,
      clientRequestId,
      timeStamp: timestamp,
      checksum,
      userTokenId,
      relatedTransactionId,
      currency,
      amount,
      transactionType: "Auth",
      paymentOption: {
        card
      },
      billingAddress,
      deviceDetails
    };

    const result = await fetch("https://ppp-test.nuvei.com/ppp/api/v1/payment.do", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalPayload)
    });

    const responseJson = await result.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ status: "OK", response: responseJson })
    };
  } catch (error) {
    console.error("Webhook error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
