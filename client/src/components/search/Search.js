import React, { useContext, useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import Filter from "../shop/subComponents/filter/Filter";
import ShopItem from "../shop/subComponents/ShopItem";
import "../shop/Shop.css";
import { ProductsContext } from "../../App";
import pluralize from "pluralize";

function Search() {
  const location = useLocation();

  const { uploadOptions } = useContext(ProductsContext);
  const [search, setSearch] = useState("");

  const [catagory, setCatagory] = useState([]);
  const [type, setType] = useState([]);

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

  const [noResults, setNoResults] = useState(false);

  const [blackBox, setBlackBox] = useState(false);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const [PaginateLoading, setPaginateLoading] = useState(false);

  useEffect(() => {
    if (search !== "") {
      document.title = `${search} | Stand Out`;
    }
  }, [search]);

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

  // changing search query
  useEffect(() => {
    const query = location.search.replace("?", "").split("&");
    if (query.length >= 1) {
      if (query.filter((el) => el.includes("q=")).length >= 1) {
        setSearch(
          decodeURI(
            query.filter((el) => el.includes("q="))[0].replace("q=", "")
          )
        );
      }
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
              if (!types.includes(el.toLowerCase())) {
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
                    types.push(pluralize.plural(el).toLowerCase());
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

  //set page to 0 when catagory changes
  useEffect(() => {
    setPage(0);
  }, [search]);

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
            axios
              .get(`product/best-seller/colors-sizes`)
              .then((resp) => {
                if (resp.status !== 200) {
                  throw new Error();
                }
                setItemStock(resp.data);
              })
              .catch((err) => {
                console.log(err);
              });
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
              axios
                .get(
                  `/product/best-seller/?page=${0 + 1}&limit=${limit}&sort=${
                    filter.sort
                  }&color=${filter.color}&size=${filter.size}`
                )
                .then((resp) => {
                  if (resp.status !== 200) {
                    throw new Error();
                  }

                  setItemsCount(resp.data.count);
                  setStockIndex((prev) => {
                    let obj = {};
                    for (let i = 0; i < resp.data.products.length; i++) {
                      obj[i] = 0;
                    }
                    return obj;
                  });

                  setItems(resp.data.products);
                  setPage(1);
                })
                .catch((err) => {
                  console.log(err);
                });
            } else {
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
            }
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
              axios
                .get(
                  `/product/best-seller/?page=${0 + 1}&limit=${limit}&sort=${
                    filter.sort
                  }&color=${filter.color}&size=${filter.size}`
                )
                .then((resp) => {
                  if (resp.status !== 200) {
                    throw new Error();
                  }

                  setItemsCount(resp.data.count);
                  setStockIndex((prev) => {
                    let obj = {};
                    for (let i = 0; i < resp.data.products.length; i++) {
                      obj[i] = 0;
                    }
                    return obj;
                  });

                  setItems(resp.data.products);
                  setPage(1);
                })
                .catch((err) => {
                  console.log(err);
                });
            } else {
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
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }
  }, [filter, catagory, showFilters, type, page]);

  const getItems = () => {
    if (!noResults) {
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
    } else {
      axios
        .get(
          `/product/best-seller/?page=${0 + 1}&limit=${limit}&sort=${
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
    }
  };

  const pagination = () => {
    setPaginateLoading(true);
    if (!noResults) {
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
    } else {
      axios
        .get(
          `/product/best-seller/?page=${page + 1}&limit=${limit}&sort=${
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
    }
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
        }}
      />
      <div className="shop__items-container">
        <div
          className="shop__items-container__title"
          style={noResults ? { borderBottom: "none" } : {}}
        >
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
          <p
            onClick={() => {
              setShowFilters((prev) => !prev);
              setBlackBox((prev) => !prev);
            }}
          >
            filter
            <FontAwesomeIcon className="icon" icon="chevron-right" />
          </p>
        </div>
        {noResults && (
          <p className="shop__items-container__no-result">
            recommended for you
          </p>
        )}
        {items.length <= 0 ? (
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
                {...{ el, stockIndex, index, setStockIndex }}
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

export default Search;
