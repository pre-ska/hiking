import Axios from "axios";
import { ShowAlert } from "./alert";
var stripe = Stripe("pk_test_x9rPYMlgaj9DsNEzpFpbs9ES00uCUxhLoQ");

//ovo pozivam iz index.js koji dohvati button i stavi listener na njega
export const bookTour = async (tourId) => {
  try {
    // 1) get checkout session from API
    const session = await Axios(
      `http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`
    );

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (error) {
    console.log(error);
    showAlert("error", error);
  }
};
