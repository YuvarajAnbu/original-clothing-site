import React, { useState, useEffect, useContext } from "react";
import "./Header.css";
import NavLinks from "./subComponents/navLinks/NavLinks";
import Tools from "./subComponents/tools/Tools";
import { Link } from "react-router-dom";
import { UserContext } from "../../App";

function Header() {
  const [blackBox, setBlackBox] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);

  const { user } = useContext(UserContext);

  useEffect(() => {
    if (user.name !== "") {
      if (user.type === "admin") {
        setIsAdmin(true);
      }
    }
  }, [user]);

  return (
    <header>
      <div className="nav-bar">
        <div className="nav-bar__logo">
          <h1>
            <Link to="/">StandOut</Link>
          </h1>
        </div>
        <NavLinks setBlackBox={setBlackBox} />
        <Tools setBlackBox={setBlackBox} blackBox={blackBox} />
      </div>
      <div
        className={blackBox ? " black-box black-box--visible" : "black-box"}
      ></div>

      <div className="advertisement">
        <p>
          <span>Hurry up !</span> 40 % off on every products this month. Don’t
          miss the deal
        </p>
      </div>

      {isAdmin && (
        <div className="owner-features">
          <Link to="/upload">Upload Products</Link>
          <Link to="/update-products">Update Products</Link>
          <Link to="/update-order">Update Orders</Link>
        </div>
      )}
    </header>
  );
}

export default Header;
