import React, { useContext, useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import "../upload/UploadItem.css";
import { ProductsContext, UserContext } from "../../App";
import StockBox from "./StockBox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function EditProduct() {
  const history = useHistory();
  const [item, setItem] = useState({});

  const { uploadOptions } = useContext(ProductsContext);
  const { user } = useContext(UserContext);

  const [catagory, setCatagory] = useState("women");
  const [images, setImages] = useState({});

  const [loading, setLoading] = useState(false);

  const { id } = useParams();

  const [successMsgs, setSuccessMsgs] = useState("");
  const [errorMsgs, setErrorMsgs] = useState("");
  const [showMsgs, setShowMsgs] = useState(false);

  useEffect(() => {
    document.title = "Edit Products | Stand Out";
  }, []);

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
          history.push(404);
        });
    } else {
      history.push("404");
    }
  }, [user.name, history]);

  useEffect(() => {
    axios
      .get(`/product/${id}`)
      .then((res) => {
        if (res.status !== 200) {
          throw new Error();
        }
        setItem(res.data);
        setTimeout(() => {
          document
            .querySelector('.upload__form__input-container input[name="name"]')
            .focus();
        }, 500);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [id]);

  const { register, handleSubmit, errors, control, getValues } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await axios.put("/product/update", {
        data: { ...data, _id: id },
        images,
      });
      if (res.status !== 200) {
        throw new Error();
      }
      setSuccessMsgs("Product Updated Successfully");
      setLoading(false);
    } catch (err) {
      console.log("something went wrong");
      setErrorMsgs("Something went wrong. Please try again");
      setLoading(false);
    }
  };

  return typeof item._id === "undefined" ? (
    <div className="loader-container">
      <div className="loader"></div>
    </div>
  ) : (
    <div className="upload">
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
      <h1>edit products</h1>
      <form className="upload__form" onSubmit={handleSubmit(onSubmit)}>
        <div className="upload__form__input-container">
          <label htmlFor="name">
            name <span>*</span>
          </label>
          <input
            name="name"
            autoFocus
            placeholder="eg.  button down shirts for men"
            id="inputName"
            ref={register({
              pattern: {
                value: /^[\w/d ]{0,}[\w-/d]{2,}[\w-/d ]{0,}$/,
                message: "should only be 2 or more than 2 letters",
              },
              required: "required",
            })}
            defaultValue={item.name}
          />
          {typeof errors.name !== "undefined" && (
            <p className="upload__form__input-container__error-msg">
              <FontAwesomeIcon icon="circle" className="icon" />{" "}
              {errors.name.message}
            </p>
          )}
        </div>
        <div className="upload__form__input-container">
          <label htmlFor="price">
            price <span>*</span>
          </label>
          <input
            name="price"
            placeholder="25.55 or 25 (in usd)"
            ref={register({
              required: "required",
              pattern: {
                value: /^(\d+)(\.\d+)?$/,
                message:
                  "should only contain number and may or may not one decimal",
              },
            })}
            defaultValue={item.price / 100}
          />
          {typeof errors.price !== "undefined" && (
            <p className="upload__form__input-container__error-msg">
              <FontAwesomeIcon icon="circle" className="icon" />{" "}
              {errors.price.message}
            </p>
          )}
        </div>
        <div className="upload__form__flex">
          <div className="upload__form__input-container">
            <label htmlFor="catagory">
              catagory <span>*</span>
            </label>
            <div className="upload__form__input-container__select-container">
              <select
                name="catagory"
                onChange={(e) => setCatagory(e.target.value)}
                ref={register}
                defaultValue={item.catagory}
              >
                <option value="women">women</option>
                <option value="men">men</option>
                <option value="both">both</option>
              </select>{" "}
              <FontAwesomeIcon icon="chevron-right" className="icon" />
            </div>
          </div>
          <div className=" upload__form__input-container">
            <label htmlFor="type">
              type <span>*</span>
            </label>
            <div className="upload__form__input-container__select-container">
              <select name="type" ref={register} defaultValue={item.type}>
                {uploadOptions[catagory].map((el, l) => (
                  <option key={l} value={el.toLowerCase()}>
                    {el}
                  </option>
                ))}
              </select>{" "}
              <FontAwesomeIcon icon="chevron-right" className="icon" />
            </div>
          </div>
        </div>
        <div className=" upload__form__input-container upload__form__stocks-box">
          <label htmlFor="stock">
            stock <span>*</span>
          </label>
          <StockBox
            {...{
              control,
              register,
              errors,
              images,
              setImages,
              getValues,
              item,
            }}
          />
        </div>
        <button
          className={
            loading
              ? "upload__form__submit-button upload__form__submit-button--loading"
              : "upload__form__submit-button"
          }
          type="submit"
        >
          {loading ? (
            <div className="upload__form__submit-button__loader"></div>
          ) : (
            "upload"
          )}
        </button>
      </form>
    </div>
  );
}

export default EditProduct;
