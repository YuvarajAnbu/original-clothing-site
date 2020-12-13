import React, { useEffect, useState } from "react";
import axios from "axios";

function Card({
  cart,
  billingDetails,
  setPaymentSuccess,
  setPaymentFailed,
  setOrderId,
}) {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const [hide, setHide] = useState(true);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!scriptLoaded) {
      const links = [
        "https://js.braintreegateway.com/web/3.65.0/js/client.min.js",
        "https://js.braintreegateway.com/web/3.65.0/js/hosted-fields.min.js",
      ];

      links.forEach((link, index) => {
        const script = document.createElement("script");

        script.src = link;
        document.body.appendChild(script);
        if (links.length - 1 === index) {
          script.onload = () => {
            setScriptLoaded(true);
          };
        }
      });
    }
  }, [scriptLoaded]);

  useEffect(() => {
    if (scriptLoaded) {
      axios
        .get("/payment/client_token")
        .then((res) => {
          if (res.status === 200) {
            const form = document.querySelector("#hosted-fields-form");
            const submit = document.querySelector("#payment-card-btn");

            window.braintree.client.create(
              {
                // Insert your tokenization key here
                authorization: res.data,
              },
              function (clientErr, clientInstance) {
                if (clientErr) {
                  console.error(clientErr);
                  return;
                }

                window.braintree.hostedFields.create(
                  {
                    client: clientInstance,
                    styles: {
                      input: {
                        "font-size": "13px",
                      },
                    },
                    fields: {
                      number: {
                        selector: "#card-number",
                        placeholder: "4111 1111 1111 1111",
                        prefill: "4111 1111 1111 1111",
                      },
                      cvv: {
                        selector: "#cvv",
                        placeholder: "123",
                        prefill: "123",
                      },
                      expirationDate: {
                        selector: "#expiration-date",
                        placeholder: "10/30",
                        prefill: "10/30",
                      },
                    },
                  },
                  function (hostedFieldsErr, hostedFieldsInstance) {
                    if (hostedFieldsErr) {
                      console.error(hostedFieldsErr);
                      return;
                    }

                    submit.removeAttribute("disabled");
                    setHide(false);

                    form.addEventListener(
                      "submit",
                      function (event) {
                        event.preventDefault();
                        setLoading(true);
                        hostedFieldsInstance.tokenize(function (
                          tokenizeErr,
                          payload
                        ) {
                          if (tokenizeErr) {
                            console.error(tokenizeErr);
                            setLoading(false);
                            return;
                          }

                          const opt = {
                            payload,
                            cart,
                            billingDetails,
                          };

                          axios
                            .post("/payment/checkout", opt)
                            .then((r) => {
                              return r.data;
                            })
                            .then((result) => {
                              hostedFieldsInstance.teardown(function (
                                teardownErr
                              ) {
                                if (teardownErr) {
                                  console.error(
                                    "Could not tear down the Hosted Fields form!"
                                  );
                                } else {
                                  console.info(
                                    "Hosted Fields form has been torn down!"
                                  );
                                }
                              });
                              setLoading(false);
                              setPaymentSuccess(true);
                              setOrderId(result.order);
                            })
                            .catch((err) => {
                              setLoading(false);
                              setPaymentFailed(true);
                            });
                        });
                      },
                      false
                    );
                  }
                );
              }
            );
          }
        })

        .catch((err) => {
          console.log(err);
        });
    }
  }, [
    scriptLoaded,
    billingDetails,
    cart,
    setOrderId,
    setPaymentFailed,
    setPaymentSuccess,
  ]);

  return scriptLoaded ? (
    <div className="billing__checkout__content__container__form">
      {hide && (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      )}

      <form
        action="/payment/checkout"
        method="post"
        className={
          hide
            ? "billing__checkout__content__container__form__card billing__checkout__content__container__form__card--hidden"
            : "billing__checkout__content__container__form__card"
        }
        id="hosted-fields-form"
      >
        <div className="billing__checkout__content__container__form__input-container">
          <label htmlFor="card-number">
            card number <span>*</span>
          </label>
          <div id="card-number" className="hosted-field"></div>
        </div>
        <div className="billing__checkout__content__container__form__flex billing__checkout__content__container__form__flex--card">
          <div className="billing__checkout__content__container__form__input-container">
            <label htmlFor="cvv">
              cvv <span>*</span>
            </label>
            <div id="cvv" className="hosted-field"></div>
          </div>
          <div className="billing__checkout__content__container__form__input-container">
            <label htmlFor="expiration-date">
              Expiration date <span>*</span>
            </label>
            <div id="expiration-date" className="hosted-field"></div>
          </div>
        </div>
        {loading ? (
          <button
            type="button"
            className="payment-card-btn payment-card-btn--loading"
            disabled
          >
            <div className="payment-card-btn__loading"></div>
          </button>
        ) : (
          <button type="submit" disabled id="payment-card-btn">
            place order
          </button>
        )}
      </form>
    </div>
  ) : (
    <div className="loader-container">
      <div className="loader"></div>
    </div>
  );
}

export default Card;
