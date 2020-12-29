import React, {
  createContext,
  useState,
  useEffect,
  lazy,
  Suspense,
} from "react";
import "./App.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faSearch,
  faUser,
  faShoppingCart,
  faPen,
  faTrash,
  faEye,
  faEyeSlash,
  faCloudUploadAlt,
  faPlus,
  faMinus,
  faTimes,
  faStar,
  faStarHalf,
  faCheckSquare,
  faChevronRight,
  faCircle,
} from "@fortawesome/free-solid-svg-icons";
import {
  faSquare,
  faTimesCircle,
  faCheckCircle,
} from "@fortawesome/free-regular-svg-icons";
import {
  faFacebookSquare,
  faInstagram,
  faTwitter,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import axios from "axios";
import products from "./state/products";
import usStates from "./state/states";
import colors from "./state/colors";
import ErrorBoundary from "./ErrorBoundary";
const Header = lazy(() => import("./components/header/Header"));
const Home = lazy(() => import("./components/home/Home"));
const Items = lazy(() => import("./components/items/Items"));
const Item = lazy(() => import("./components/item/Item"));
const Billing = lazy(() => import("./components/billing/Billing"));
const SignUp = lazy(() => import("./components/signupAndSignin/SignUp"));
const SignIn = lazy(() => import("./components/signupAndSignin/SignIn"));
const UploadItem = lazy(() => import("./components/upload/UploadItem"));
const Checkout = lazy(() => import("./components/checkout/Checkout"));
const Search = lazy(() => import("./components/search/Search"));
const UpdateProducts = lazy(() =>
  import("./components/updateProducts/UpdateProducts")
);
const EditProduct = lazy(() => import("./components/editProduct/EditProduct"));
const Trending = lazy(() => import("./components/trending/Trending"));
const BestSeller = lazy(() => import("./components/bestSeller/BestSeller"));
const PersonalInfo = lazy(() =>
  import("./components/personalInfo/PersonalInfo")
);
const YourOrders = lazy(() => import("./components/yourOrders/YourOrders"));
const UpdateOrder = lazy(() => import("./components/updateOrder/UpdateOrder"));
const Footer = lazy(() => import("./components/footer/Footer"));
const TermsAndConditions = lazy(() =>
  import("./components/footer/subComponents/TermsAndConditions")
);
const PrivatePolicy = lazy(() =>
  import("./components/footer/subComponents/PrivatePolicy")
);
const Accessibility = lazy(() =>
  import("./components/footer/subComponents/Accessibility")
);
const WrongPage = lazy(() => import("./components/404/WrongPage"));

export const ProductsContext = createContext();
export const UserContext = createContext();
export const CartContext = createContext();
export const StateContext = createContext();
export const ColorsContext = createContext();
export const PathContext = createContext();

function App() {
  library.add(
    faSearch,
    faUser,
    faShoppingCart,
    faPen,
    faTrash,
    faEye,
    faEyeSlash,
    faCloudUploadAlt,
    faPlus,
    faMinus,
    faTimes,
    faStar,
    faStarHalf,
    faSquare,
    faCheckSquare,
    faCheckCircle,
    faTimesCircle,
    faChevronRight,
    faCircle,
    faYoutube,
    faTwitter,
    faInstagram,
    faFacebookSquare
  );

  const [user, setUser] = useState({});
  const [cart, setCart] = useState([]);
  const [path, setPath] = useState("");
  const [loaded, setLoaded] = useState(true);

  useEffect(() => {
    axios
      .get("/user/authenticate")
      .then((res) => {
        if (res.status !== 200) {
          throw new Error();
        }
        setUser(res.data.user);
        setLoaded(false);
      })
      .catch((err) => {
        setLoaded(false);
      });

    if (localStorage.getItem("cart")) {
      setCart(JSON.parse(localStorage.getItem("cart")));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  return (
    <Router>
      <ErrorBoundary>
        <Suspense
          fallback={
            <div className="loader-container">
              <div className="loader"></div>
            </div>
          }
        >
          {loaded ? (
            <div className="loader-container">
              <div className="loader"></div>
            </div>
          ) : (
            <ProductsContext.Provider value={products}>
              <UserContext.Provider value={{ user, setUser }}>
                <CartContext.Provider value={{ cart, setCart }}>
                  <PathContext.Provider value={{ path, setPath }}>
                    <ColorsContext.Provider value={colors}>
                      <StateContext.Provider value={usStates}>
                        <Header />
                        <Switch>
                          <Route path="/" exact>
                            <Home />
                          </Route>
                          <Route path="/signup" exact>
                            <SignUp />
                          </Route>
                          <Route path="/signin" exact>
                            <SignIn />
                          </Route>
                          <Route path="/items/:catagory/:type" exact>
                            <Items />
                          </Route>
                          <Route path="/item/:id" exact>
                            <Item />
                          </Route>
                          <Route path="/checkout" exact>
                            <Checkout />
                          </Route>
                          <Route path="/your-orders" exact>
                            <YourOrders />
                          </Route>
                          <Route path="/orders" exact>
                            <YourOrders />
                          </Route>
                          <Route path="/search" exact>
                            <Search />
                          </Route>

                          {user.type === "admin" && (
                            <Route path="/upload" exact>
                              <UploadItem />
                            </Route>
                          )}
                          {user.type === "admin" && (
                            <Route path="/update-products" exact>
                              <UpdateProducts />
                            </Route>
                          )}
                          {user.type === "admin" && (
                            <Route path="/edit-item/:id" exact>
                              <EditProduct />
                            </Route>
                          )}
                          {user.type === "admin" && (
                            <Route path="/update-order" exact>
                              <UpdateOrder />
                            </Route>
                          )}
                          <Route path="/terms-and-conditions" exact>
                            <TermsAndConditions />
                          </Route>
                          <Route path="/private-policy" exact>
                            <PrivatePolicy />
                          </Route>
                          <Route path="/accessibility" exact>
                            <Accessibility />
                          </Route>
                          <Route path="/personal-info" exact>
                            <PersonalInfo />
                          </Route>
                          <Route path="/shipping-and-billing" exact>
                            <Billing />
                          </Route>
                          <Route path="/trending" exact>
                            <Trending />
                          </Route>
                          <Route path="/best-sellers" exact>
                            <BestSeller />
                          </Route>
                          <Route>
                            <WrongPage />
                          </Route>
                        </Switch>
                        <Footer />
                      </StateContext.Provider>
                    </ColorsContext.Provider>
                  </PathContext.Provider>
                </CartContext.Provider>
              </UserContext.Provider>
            </ProductsContext.Provider>
          )}
        </Suspense>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
