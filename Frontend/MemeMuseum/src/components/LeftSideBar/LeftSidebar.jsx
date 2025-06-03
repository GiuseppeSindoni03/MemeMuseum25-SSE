import React, { useEffect, useRef } from "react";
import {
  IoHomeOutline,
  IoTodayOutline,
  IoThumbsUpOutline,
  IoPersonOutline,
  IoLogOutOutline,
} from "react-icons/io5";
import { useAuth } from "../../services/AuthContext";
import "./LeftSidebar.css";

export default function LeftSidebar({
  currentPage,
  clickOnTodayMeme,
  navigateToHome,
  navigateToProfile,
  clickOnMyUpVotedMeme,
  setSidebarOpen,
}) {
  const { isLoggedIn, logout } = useAuth();
  
  // Reference per la sidebar
  const sidebarRef = useRef(null);

  // Funzione per chiudere la sidebar
  const closeSidebar = () => setSidebarOpen(false);

  // Aggiungi un event listener per i clic fuori dalla sidebar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        closeSidebar();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={sidebarRef} className="left-sidebar sidebar-sticky">
      <ul className="menu">
        <li
          className={`menu-item ${currentPage === "home" ? "selected" : ""}`}
          onClick={() => {
            navigateToHome();
            closeSidebar(); // Chiudi la sidebar quando si clicca su un elemento
          }}
        >
          <i className="icon">
            <IoHomeOutline />
          </i>
          <span>Home</span>
        </li>
        <li
          className={`menu-item ${
            currentPage === "todayMemes" ? "selected" : ""
          }`}
          onClick={() => {
            clickOnTodayMeme();
            closeSidebar();
          }}
        >
          <i className="icon">
            <IoTodayOutline />
          </i>
          <span>Meme del giorno</span>
        </li>
        {isLoggedIn && (
          <li
            className={`menu-item ${
              currentPage === "myUpvotes" ? "selected" : ""
            }`}
            onClick={() => {
              clickOnMyUpVotedMeme();
              closeSidebar();
            }}
          >
            <i className="icon">
              <IoThumbsUpOutline />
            </i>
            <span>Mi Piace</span>
          </li>
        )}
        {isLoggedIn && (
          <li
            className={`menu-item ${
              currentPage === "profile" ? "selected" : ""
            }`}
            onClick={() => {
              navigateToProfile();
              closeSidebar();
            }}
          >
            <i className="icon">
              <IoPersonOutline />
            </i>
            <span>Profilo</span>
          </li>
        )}
        {isLoggedIn && (
          <li className="menu-item d-md-none" onClick={() => logout()}>
            <i className="icon">
              <IoLogOutOutline />
            </i>
            <span>Logout</span>
          </li>
        )}
      </ul>
    </div>
  );
}
