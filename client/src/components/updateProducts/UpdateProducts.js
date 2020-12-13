import React, { useContext, useEffect, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import Filter from "../shop/subComponents/filter/Filter";
import ShopItem from "./subComponents/ShopItem";
import "../shop/Shop.css";
import { ProductsContext, UserContext } from "../../App";
import pluralize from "pluralize";
import { Link, useHistory, useLocation } from "react-router-dom";

function UpdateProducts() {
  const history = useHistory();
  const location = useLocation();

  const { uploadOptions } = useContext(ProductsContext);
  const { user } = useContext(UserContext);

  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");

  const [catagory, setCatagory] = useState([]);
  const [type, setType] = useState([]);

  const [noResults, setNoResults] = useState(false);

  const [items, setItems] = useState([]);
  const [itemsCount, setItemsCount] = useState(0);

  // getting colors and sizes from server on page load
  const [itemStock, setItemStock] = useState({
    colors: [],
    sizes: [],
  });

  // changing all product images based on color
  const [stockIndex, setStockIndex] = useState({});
  const [page, setPage] = useState(0);
  const limit = 12;

  // state for filter
  const [filter, setFilter] = useState({
    sort: "",
    color: [],
    size: [],
  });

  // hide filter on click
  const [hideFilter, setHideFilter] = useState({
    sort: true,
    color: true,
    size: true,
  });

  const [showFilters, setShowFilters] = useState(false);

  const [blackBox, setBlackBox] = useState(false);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const [successMsgs, setSuccessMsgs] = useState("");
  const [errorMsgs, setErrorMsgs] = useState("");
  const [showMsgs, setShowMsgs] = useState(false);

  const [PaginateLoading, setPaginateLoading] = useState(false);

  useEffect(() => {
    document.title = "Update Products | Stand Out";
  }, []);

  useEffect(() => {
    if (typeof user.name !== "undefined") {
      axios
        .get(`/user/is-admin`)
        .then((res) => {
          if (res.status !== 200) {
            throw new Error();
          }
          if (res.data !== "admin") {
            history.push(404);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      history.push("404");
    }
  }, [user.name, history]);

  useEffect(() => {
    if (window.innerWidth >= 1000 && showFilters) {
      setBlackBox(false);
      setShowFilters(false);
    }
  }, [windowWidth, showFilters]);

  const resizeEvent = useCallback(() => {
    setWindowWidth(window.innerWidth);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", resizeEvent);

    return () => {
      window.removeEventListener("resize", resizeEvent);
    };
  }, [resizeEvent]);

  useEffect(() => {
    if (errorMsgs !== "") {
      const a = setTimeout(() => {
        setErrorMsgs("");
      }, 3400);
      const b = setTimeout(() => {
        setShowMsgs(true);
      }, 1);
      const c = setTimeout(() => {
        setShowMsgs(false);
      }, 3000);

      return () => {
        clearTimeout(a);
        clearTimeout(b);
        clearTimeout(c);
      };
    }
  }, [errorMsgs]);

  useEffect(() => {
    if (successMsgs !== "") {
      const a = setTimeout(() => {
        setSuccessMsgs("");
      }, 3400);
      const b = setTimeout(() => {
        setShowMsgs(true);
      }, 1);
      const c = setTimeout(() => {
        setShowMsgs(false);
      }, 3000);

      return () => {
        clearTimeout(a);
        clearTimeout(b);
        clearTimeout(c);
      };
    }
  }, [successMsgs]);

  //set page to 0 when catagory changes
  useEffect(() => {
    setPage(0);
  }, [search]);

  // changing search query
  useEffect(() => {
    const query = location.search.replace("?", "").split("&");
    if (query.length >= 1) {
      if (query.filter((el) => el.includes("q=")).length >= 1) {
        if (
          decodeURI(
            query.filter((el) => el.includes("q="))[0].replace("q=", "")
          ) !== ""
        ) {
          setSearch(
            decodeURI(
              query.filter((el) => el.includes("q="))[0].replace("q=", "")
            )
          );
        } else {
          setNoResults(true);
        }
      } else {
        setNoResults(true);
      }
    } else {
      setNoResults(true);
    }
  }, [location]);

  // updating catagory and type
  useEffect(() => {
    if (search !== "") {
      let types = [];
      let catagories = [];

      const searchStr = search
        .trim()
        .replace(/[`~!@#$%^&*()_|+\-=?;:'",.{}[\]()/\\]/gi, "");

      const catagoryArr = {
        men: ["men", "man", "mens", "mans"],
        women: ["women", "woman", "womens", "womans"],
      };

      searchStr.split(" ").forEach((el) => {
        Object.keys(catagoryArr).forEach((e) => {
          catagoryArr[e].forEach((k) => {
            if (!catagories.includes(e)) {
              if (
                pluralize
                  .plural(k)
                  .toLowerCase()
                  .replace(/[`~!@#$%^&*()_|+\-=?;:'",.{}[\]()/\\]/gi, "") ===
                pluralize.plural(el).toLowerCase()
              ) {
                catagories.push(e);
              }
            }
          });
        });

        Object.keys(uploadOptions).forEach((e) => {
          if (e !== "both") {
            uploadOptions[e].forEach((k) => {
              if (!types.includes(el)) {
                k.split(" ").forEach((j) => {
                  if (
                    pluralize
                      .plural(j)
                      .toLowerCase()
                      .replace(
                        /[`~!@#$%^&*()_|+\-=?;:'",.{}[\]()/\\]/gi,
                        ""
                      ) === pluralize.plural(el).toLowerCase()
                  ) {
                    pluralize.plural(el).toLowerCase();
                  }
                });
              }
            });
          }
        });
      });

      if (types.length < 1) {
        types = [";0.hjgbhj"];
      }

      if (catagories.length < 1) {
        catagories = [";0.hjgbhj"];
      }

      setCatagory(catagories);
      setType(types);
    }
  }, [search, uploadOptions]);

  // setting color on page loads
  useEffect(() => {
    if (catagory.length > 0 && type.length > 0) {
      axios
        .get(`/product/total-items/${catagory}/${type}`)
        .then((res) => {
          if (res.status !== 200) {
            throw new Error();
          }

          if (res.data.colors.length < 1) {
            setNoResults(true);
            setItemStock({ colors: [], sizes: [] });
          } else {
            setNoResults(false);
            setItemStock(res.data);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [catagory, type]);

  // getting items from server on page loads and when filter changes
  useEffect(() => {
    if (window.innerWidth > 1000) {
      if (catagory.length > 0 && type.length > 0) {
        axios
          .get(
            `/product/${catagory}/${type}/?page=${0 + 1}&limit=${limit}&sort=${
              filter.sort
            }&color=${filter.color}&size=${filter.size}`
          )
          .then((res) => {
            if (res.status !== 200) {
              throw new Error();
            }
            const { count, products } = res.data;
            setItems([]);

            if (count < 1) {
              setNoResults(true);
            }
            setItemsCount(count);
            setStockIndex((prev) => {
              let obj = {};
              for (let i = 0; i < products.length; i++) {
                obj[i] = 0;
              }
              return obj;
            });

            setItems(products);
            setPage(1);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }
  }, [filter, catagory, showFilters, type]);

  useEffect(() => {
    if (window.innerWidth <= 1000 && page === 0) {
      if (catagory.length > 0 && type.length > 0) {
        axios
          .get(
            `/product/${catagory}/${type}/?page=${0 + 1}&limit=${limit}&sort=${
              filter.sort
            }&color=${filter.color}&size=${filter.size}`
          )
          .then((res) => {
            if (res.status !== 200) {
              throw new Error();
            }
            const { count, products } = res.data;
            setItems([]);

            if (count < 1) {
              setNoResults(true);
            }
            setItemsCount(count);
            setStockIndex((prev) => {
              let obj = {};
              for (let i = 0; i < products.length; i++) {
                obj[i] = 0;
              }
              return obj;
            });

            setItems(products);
            setPage(1);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }
  }, [filter, catagory, showFilters, type, page]);

  const getItems = () => {
    axios
      .get(
        `/product/${catagory}/${type}/?page=${1}&limit=${limit}&sort=${
          filter.sort
        }&color=${filter.color}&size=${filter.size}`
      )
      .then((res) => {
        if (res.status !== 200) {
          throw new Error();
        }

        const { count, products } = res.data;
        setItemsCount(count);

        setItems([]);

        setStockIndex((prev) => {
          let obj = {};
          for (let i = 0; i < products.length; i++) {
            obj[i] = 0;
          }
          return obj;
        });

        setItems(products);
        setPage(1);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const pagination = () => {
    setPaginateLoading(true);
    axios
      .get(
        `/product/${catagory}/${type}/?page=${page + 1}&limit=${limit}&sort=${
          filter.sort
        }&color=${filter.color}&size=${filter.size}`
      )
      .then((res) => {
        if (res.status !== 200) {
          throw new Error();
        }

        const { count, products } = res.data;
        setItemsCount(count);

        setStockIndex((prev) => {
          let obj = { ...prev };
          for (let i = 0; i < products.length; i++) {
            obj[i + page * limit] = 0;
          }
          return obj;
        });

        setItems((prev) => prev.concat(products));
        setPage((prev) => prev + 1);
        setPaginateLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const limitArr = () => {
    let arr = [];
    for (var i = 0; i < limit; i++) {
      arr.push(i);
    }
    return arr;
  };

  return (
    <div className="shop">
      {errorMsgs !== "" && (
        <div className={showMsgs ? "msg msg--visible" : "msg"}>
          <FontAwesomeIcon
            icon={["far", "times-circle"]}
            className="icon"
            onClick={() => {
              setSuccessMsgs("");
            }}
          />
          <p>{errorMsgs}</p>
        </div>
      )}
      {successMsgs !== "" && (
        <div className={showMsgs ? "msg msg--visible" : "msg"}>
          <FontAwesomeIcon
            icon={["far", "check-circle"]}
            className="icon"
            onClick={() => {
              setSuccessMsgs("");
            }}
          />
          <p>{successMsgs}</p>
        </div>
      )}
      <Filter
        {...{
          filter,
          setFilter,
          itemStock,
          hideFilter,
          setHideFilter,
          showFilters,
          setShowFilters,
          setBlackBox,
          getItems,
          noResults,
        }}
      />
      <div className="shop__items-container">
        <div className="shop__items-container__search-container">
          <svg
            className="shop__items-container__search-container__icon"
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            width="32"
            height="32"
            viewBox="0 0 30 30"
            style={{ fill: "#ffffff" }}
          >
            <path d="M 13 3 C 7.4889971 3 3 7.4889971 3 13 C 3 18.511003 7.4889971 23 13 23 C 15.396508 23 17.597385 22.148986 19.322266 20.736328 L 25.292969 26.707031 A 1.0001 1.0001 0 1 0 26.707031 25.292969 L 20.736328 19.322266 C 22.148986 17.597385 23 15.396508 23 13 C 23 7.4889971 18.511003 3 13 3 z M 13 5 C 17.430123 5 21 8.5698774 21 13 C 21 17.430123 17.430123 21 13 21 C 8.5698774 21 5 17.430123 5 13 C 5 8.5698774 8.5698774 5 13 5 z"></path>
          </svg>
          <form>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoFocus
              required
            />
            <Link to={`/update-products?q=${input}`}>
              <button type="submit" style={{ display: "none" }}></button>
            </Link>
          </form>
        </div>
        <div
          className="shop__items-container__title"
          style={
            noResults
              ? {
                  borderBottom: "1px solid #dddddd",
                  paddingBottom: "2rem",
                }
              : {}
          }
        >
          {search !== "" ? (
            <h1
              className={
                noResults ? "shop__items-container__title__no-result" : ""
              }
            >
              <span>
                {noResults ? "We couldn't find anything for" : "Results For"}
              </span>{" "}
              "{search}"
            </h1>
          ) : (
            <h1 className="shop__items-container__title__no-result">
              <span>Search For Something</span>
            </h1>
          )}
          {!noResults && (
            <p
              onClick={() => {
                setShowFilters((prev) => !prev);
                setBlackBox((prev) => !prev);
              }}
            >
              filter
              <FontAwesomeIcon className="icon" icon="chevron-right" />
            </p>
          )}
        </div>
        {!noResults && (
          <div>
            {items.length < 1 ? (
              <div className="shop__loading__box">
                {limitArr().map((index) => (
                  <div
                    key={index}
                    className="shop__loading__container shop__loading__container--item"
                  >
                    <div className="shop__loading__container__img"></div>
                    <div className="shop__loading__container__text shop__loading__container__text--name"></div>
                    <div className="shop__loading__container__text"></div>
                    <div className="shop__loading__container__text"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="shop__items-container__items">
                {items.map((el, index) => (
                  <ShopItem
                    key={index}
                    {...{
                      el,
                      stockIndex,
                      index,
                      setStockIndex,
                      setSuccessMsgs,
                      setErrorMsgs,
                      setItems,
                    }}
                  />
                ))}
              </div>
            )}

            {items.length > 0 && (
              <div>
                <p className="shop__items-container__count">
                  {page * limit < itemsCount
                    ? `${page * limit}/${itemsCount} products`
                    : `${itemsCount}/${itemsCount} products`}
                </p>
                {page * limit < itemsCount && (
                  <button
                    className={
                      PaginateLoading
                        ? "shop__items-container__load-more shop__items-container__load-more--loading"
                        : "shop__items-container__load-more"
                    }
                    type="button"
                    onClick={() => {
                      if (!PaginateLoading) {
                        pagination();
                      }
                    }}
                  >
                    {PaginateLoading ? (
                      <div className="shop__items-container__load-more__loading"></div>
                    ) : (
                      "load more"
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <div
        className={
          blackBox
            ? "shop__black-box shop__black-box--visible"
            : "shop__black-box"
        }
        onClick={() => {
          setShowFilters(false);
          setBlackBox(false);
        }}
      ></div>
    </div>
  );
}

export default UpdateProducts;
