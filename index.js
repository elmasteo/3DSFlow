
document.addEventListener('DOMContentLoaded', () => {
for (const el of document.querySelectorAll("[placeholder][data-slots]")) {
const pattern = el.getAttribute("placeholder"),
slots = new Set(el.dataset.slots || "_"),
prev = (j => Array.from(pattern, (c,i) => slots.has(c)? j=i+1: j))(0),
first = [...pattern].findIndex(c => slots.has(c)),
accept = new RegExp(el.dataset.accept || "\\d", "g"),
clean = input => {
input = input.match(accept) || [];
return Array.from(pattern, c =>
input[0] === c || slots.has(c) ? input.shift() || c : c
);
},
format = () => {
const [i, j] = [el.selectionStart, el.selectionEnd].map(i => {
i = clean(el.value.slice(0, i)).findIndex(c => slots.has(c));
return i<0? prev[prev.length-1]: back? prev[i-1] || first: i; }); el.value=clean(el.value).join``; el.setSelectionRange(i, j); back=false; }; let back=false; el.addEventListener("keydown", (e)=> back = e.key === "Backspace");
    el.addEventListener("input", format);
    el.addEventListener("focus", format);
    el.addEventListener("blur", () => el.value === pattern && (el.value=""));
    }
    });

var user_name = document.querySelector(".user_name");
var set_card_number = document.querySelector(".set_card_number");
var user_cardcvv = document.querySelector(".user_card_cvv");
var card= document.querySelector(".debit-card");
var click_pay = document.querySelector(".click-pay");
var left_side = document.querySelector(".left-side");
var right_side = document.querySelector(".right-side");
var success = document.querySelector(".success");


function validateform(){
    validate=true;
var validate_inputs=document.querySelectorAll(".right-side input");  
     
     validate_inputs.forEach(function(input_valid){
     input_valid.classList.remove('warning');
     if(input_valid.hasAttribute('require')){
         if(input_valid.value.length==0){
             validate=false;
             input_valid.classList.add('warning');
         }
     }
});
  return validate;
}

function obtenerDatos(){

    document.getElementById('result').innerHTML = '';
    var environment = document.getElementById('environment').value;
    var merchant_secret_key = document.getElementById('merchant_secret_key').value;
    var amount = document.getElementById('amount').value;
    var merchant_site_id = document.getElementById('merchant_site_id').value;
    var merchant_id = document.getElementById('merchant_id').value;
    var client_request_id = document.getElementById('client_request_id').value;
    var currency = document.getElementById('currency').value;
    var notification_url = document.getElementById('notification_url').value;
    var cardNumber = document.getElementById('cardNumber').value;
    var cardHolderName = document.getElementById('cardHolderName').value;
    var expirationMonth = document.getElementById('expirationMonth').value;
    var expirationYear = document.getElementById('expirationYear').value;
    var CVV = document.getElementById('CVV').value;

    if (!amount ||!merchant_secret_key ||!merchant_site_id ||!merchant_id ||!client_request_id ||!currency ||!cardNumber || !cardHolderName || !expirationMonth || !expirationYear || !CVV) {
      alert("Review your fields");
      return;
    }
  
const fecha = new Date();
const timestamp = `${fecha.getFullYear()}${padZero(fecha.getMonth() + 1)}${padZero(fecha.getDate())}${padZero(fecha.getHours())}${padZero(fecha.getMinutes())}${padZero(fecha.getSeconds())}`;

  function padZero(valor) {
    return valor.toString().padStart(2, '0');
  }

  const cadena =CryptoJS.SHA256(merchant_id + merchant_site_id + client_request_id + timestamp + merchant_secret_key);
  const checksum = cadena.toString();

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
    "merchantId": merchant_id,
    "merchantSiteId": merchant_site_id,
    "clientRequestId": client_request_id,
    "timeStamp": timestamp,
    "checksum": checksum
    });
  
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };
  
    fetch(environment, requestOptions)
      .then(response => response.json())
      .then(result => {

        if (result.status == 'SUCCESS'){


          var jsonInitPayment = JSON.stringify({

            "merchantSiteId": merchant_site_id,
            "merchantId": merchant_id,
            "sessionToken": result.sessionToken,
            "clientRequestId": client_request_id,
            "currency": currency,
            "amount": amount,
            "userTokenId": "asdasd",
            "paymentOption": {
                "card": {
                    "cardNumber": cardNumber,
                    "cardHolderName": cardHolderName,
                    "expirationMonth": expirationMonth,
                    "expirationYear": expirationYear,
                    "CVV": CVV,
                    "threeD": {
                        "methodNotificationUrl":notification_url,
                        "platformType": "01"
                    }
                }
            }
          });

           var initPaymentUrl = environment =='https://secure.safecharge.com/ppp/api/v1/getSessionToken.do' ? "https://secure.safecharge.com/ppp/api/v1/initPayment.do" :"https://ppp-test.nuvei.com/ppp/api/v1/initPayment.do";

          var requestInitPayment = {
            method: 'POST',
            headers: myHeaders,
            body: jsonInitPayment,
            redirect: 'follow'
          };
      }else{
        document.getElementById('result').style.display = 'block';
        document.getElementById('result').innerHTML = JSON.stringify(result, null, 2);
        alert("Review your fields");
      return;
      }

          setTimeout(() => {

            fetch(initPaymentUrl, requestInitPayment)
            .then(response => response.json())
            .then(resultInitPayment => {

                if (resultInitPayment.status == 'SUCCESS'){
              
            const cadenaPayment =CryptoJS.SHA256(merchant_id + merchant_site_id + client_request_id + amount.toString() + currency + timestamp + merchant_secret_key);
            const checksumPayment = cadenaPayment.toString();

          var jsonPayment = JSON.stringify({
            
            "sessionToken": resultInitPayment.sessionToken,
            "merchantId": merchant_id,
            "merchantSiteId": merchant_site_id,
            "clientRequestId": client_request_id,
            "timeStamp": timestamp,
            "checksum": checksumPayment,
            "currency": currency,
            "amount": amount,
            "relatedTransactionId": resultInitPayment.transactionId,
            "paymentOption": {
                "card": {
                    "cardNumber": cardNumber,
                    "cardHolderName": cardHolderName,
                    "expirationMonth": expirationMonth,
                    "expirationYear": expirationYear,
                    "CVV": CVV,
                    "threeD": {
                        "methodCompletionInd": "U",
                        "version": resultInitPayment.paymentOption.card.threeD.version,
                        "notificationURL":notification_url,
                        "merchantURL": "http://www.The-Merchant-Website-Fully-Quallified-URL.com",
                        "platformType": "02",
                        "v2AdditionalParams": {
                            "challengePreference": "01",
                            "deliveryEmail": "santiago.gomez@nuvei.com",
                            "deliveryTimeFrame": "03",
                            "giftCardAmount": "1",
                            "giftCardCount": "41",
                            "giftCardCurrency": "CLP",
                            "preOrderDate": "20220511",
                            "preOrderPurchaseInd": "02",
                            "reorderItemsInd": "01",
                            "shipIndicator": "06",
                            "rebillExpiry": "20200101",
                            "rebillFrequency": "13",
                            "challengeWindowSize": "05"
                        },
                        "browserDetails": {
                            "acceptHeader": "text/html,application/xhtml+xml",
                            "ip": "200.118.62.71",
                            "javaEnabled": "TRUE",
                            "javaScriptEnabled": "TRUE",
                            "language": "EN",
                            "colorDepth": "48",
                            "screenHeight": "400",
                            "screenWidth": "600",
                            "timeZone": "0",
                            "userAgent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47"
                        },
                        "account": {
                            "age": "05",
                            "lastChangeDate": "20190220",
                            "lastChangeInd": "04",
                            "registrationDate": "20190221",
                            "passwordChangeDate": "20190222",
                            "resetInd": "01",
                            "purchasesCount6M": "6",
                            "addCardAttempts24H": "24",
                            "transactionsCount24H": "23",
                            "transactionsCount1Y": "998",
                            "cardSavedDate": "20190223",
                            "cardSavedInd": "02",
                            "addressFirstUseDate": "20190224",
                            "addressFirstUseInd": "03",
                            "nameInd": "02",
                            "suspiciousActivityInd": "01"
                        },
                         "externalRiskScore": "100"
                    }
                }
            },
            "billingAddress": {
                "firstName": "santiago",
                "lastName": "gomez",
                "address": "Cra falsa 123",
                "city": "Bogota",
                "country": "CO",
                "email": "santiago.gomez@nuvei.com"
            },
            "shippingAddress": {
                "firstName": "santiago",
                "lastName": "gomez",
                "address": "Cra falsa 123",
                "city": "Boota",
                "country": "CO",
                "email": "santiago.gomez@nuvei.com"
            },
            "deviceDetails": {
                "ipAddress": "200.118.62.71"
            }
        });

        }else{
            document.getElementById('result').style.display = 'block';
            document.getElementById('result').innerHTML = JSON.stringify(resultInitPayment, null, 2);
            alert("Something went wrong!!");
              return;
        }

          var paymentUrl = environment =='https://secure.safecharge.com/ppp/api/v1/getSessionToken.do' ? "https://secure.safecharge.com/ppp/api/v1/payment.do" :"https://ppp-test.nuvei.com/ppp/api/v1/payment.do";

           var requestPayment = {
            method: 'POST',
            headers: myHeaders,
            body: jsonPayment,
            redirect: 'follow'
          };


          setTimeout(() => {

            fetch(paymentUrl, requestPayment)
            .then(response => response.json())
            .then(resultPayment => {

            if (resultPayment.status == 'SUCCESS'){

              var acsUrl = resultPayment.paymentOption.card.threeD.acsUrl;
              var cReq = resultPayment.paymentOption.card.threeD.cReq;
              if(!acsUrl || !cReq){
                document.getElementById('result').style.display = 'block';
                document.getElementById('result').innerHTML = JSON.stringify(resultPayment, null, 2);
              }else{
                var urlPayment = 'https://docs.nuvei.com/3Dsimulator/simulator.php?acsUrl=' + acsUrl +'&creq=' + cReq;
                window.location.href = urlPayment;
              }
              
              

          }else{
            document.getElementById('result').style.display = 'block';
            document.getElementById('result').innerHTML = JSON.stringify(resultPayment, null, 2);
            alert("Something went wrong!!");
            return;
          }

              })
            .catch(error => console.log('Error', error));   

            }, "3000");

             })
            .catch(error => console.log('Error', error));   

            }, "3000");
           
      })
      .catch(error => console.log('error', error));
    }