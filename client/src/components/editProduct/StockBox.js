import React, { useEffect } from "react";
import { useFieldArray } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SizeRemainingInputs from "./SizeRemainingInputs";

function StockBox({
  control,
  register,
  errors,
  images,
  setImages,
  getValues,
  item,
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "stock",
  });

  useEffect(() => {
    if (fields.length < 1) {
      item.stock.forEach((el) => {
        setTimeout(() => {
          setImages((prev) => {
            return { ...prev, [el._id]: el.images };
          });
          append({ color: el.color, _id: el._id });
        }, 1);
      });
    }
  }, [item, append, setImages, fields.length]);

  return (
    <div className="upload__form__stocks-box__stocks-container">
      {fields.map((field, index) => (
        <div
          className="upload__form__stocks-box__stocks-container__stock"
          key={field.id}
        >
          <input
            name={`stock[${index}]._id`}
            ref={register()}
            defaultValue={typeof field._id === "string" ? field._id : field.id}
            type="hidden"
          />
          <div className="upload__form__input-container">
            <label htmlFor={`stock[${index}].images`}>
              image <span>*</span>
            </label>
            <div
              className="upload__form__stocks-box__stocks-container__stock__drop-zone"
              onDrop={(ev) => {
                ev.preventDefault();

                for (let i = 0; i < ev.dataTransfer.files.length; i++) {
                  const reader = new FileReader();

                  reader.onload = (e) => {
                    console.log(field._id);
                    setImages((prev) => {
                      const arr =
                        typeof prev[field._id] === "undefined"
                          ? [reader.result]
                          : prev[field._id].concat(reader.result);

                      return {
                        ...prev,
                        [field._id]: arr,
                      };
                    });
                  };
                  reader.readAsDataURL(ev.dataTransfer.files[i]);
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
              }}
            >
              {typeof images[field._id] === "undefined" ? (
                <div className="upload__form__stocks-box__stocks-container__stock__drop-zone__upload-desc">
                  <FontAwesomeIcon className="icon" icon="cloud-upload-alt" />
                  <p>Drag & drop or click to upload</p>
                </div>
              ) : images[field._id].length < 1 ? (
                <div className="upload__form__stocks-box__stocks-container__stock__drop-zone__upload-desc">
                  <FontAwesomeIcon className="icon" icon="cloud-upload-alt" />
                  <p>Drag & drop or click to upload</p>
                </div>
              ) : (
                <div className="upload__form__stocks-box__stocks-container__stock__drop-zone__images-container">
                  <div className="upload__form__stocks-box__stocks-container__stock__drop-zone__images-container__images">
                    {images[field._id].map((el, l) => (
                      <div
                        key={l}
                        className="upload__form__stocks-box__stocks-container__stock__drop-zone__images-container__images__image"
                      >
                        <img
                          src={el}
                          alt="product"
                          onError={(e) => {
                            e.target.src = "/images/imgFailed.jpg";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImages((prev) => {
                              return {
                                ...prev,
                                [field._id]: prev[field._id].filter(
                                  (img) => img !== el
                                ),
                              };
                            });
                          }}
                        >
                          <FontAwesomeIcon icon="times" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <p>Hover on image and click X to delete images</p>
                </div>
              )}
              <input
                type="file"
                multiple
                onChange={(ev) => {
                  for (var i = 0; i < ev.target.files.length; i++) {
                    const reader = new FileReader();

                    reader.onload = (e) => {
                      setImages((prev) => {
                        const arr =
                          typeof prev[field._id] === "undefined"
                            ? [reader.result]
                            : prev[field._id].concat(reader.result);

                        return {
                          ...prev,
                          [field._id]: arr,
                        };
                      });
                    };
                    reader.readAsDataURL(ev.target.files[i]);
                  }
                }}
                name={`stock[${index}].images`}
                ref={register()}
                defaultValue={field.images}
              />
            </div>
          </div>
          <div className="upload__form__input-container">
            <label htmlFor={`stock[${index}].color`}>
              color <span>*</span>
            </label>
            <input
              name={`stock[${index}].color`}
              placeholder="#000000 (Hex-codes only)"
              ref={register({
                pattern: {
                  value: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
                  message: "not a valid Hex-code",
                },
                required: "required",
              })}
              defaultValue={field.color}
            />
            {typeof errors.stock !== "undefined" && (
              <p className="upload__form__input-container__error-msg">
                {typeof errors.stock[index] !== "undefined" &&
                  typeof errors.stock[index].color !== "undefined" && (
                    <span>
                      <FontAwesomeIcon icon="circle" className="icon" />{" "}
                      {errors.stock[index].color.message}
                    </span>
                  )}
              </p>
            )}
          </div>
          <div>
            <SizeRemainingInputs
              stockIndex={index}
              {...{
                control,
                register,
                errors,
                getValues,
                item: item.stock[index],
              }}
            />
          </div>
          <div className="upload__form__button-container">
            <button
              type="button"
              className="upload__form__button-container__delete-button"
              onClick={() => {
                const formObj = getValues();
                if (formObj.stock.length > 1) {
                  remove(index);
                  setImages((prev) => {
                    delete prev[field.id];
                    return prev;
                  });
                }
              }}
            >
              <FontAwesomeIcon icon="trash" />
            </button>
            <button
              type="button"
              className="upload__form__button-container__add-button"
              onClick={() => {
                append({
                  color: "",
                  sizeRemaining: [{ size: "", remaining: "" }],
                });
              }}
            >
              <FontAwesomeIcon icon="plus" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StockBox;
