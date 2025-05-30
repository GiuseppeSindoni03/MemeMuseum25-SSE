import "./LeftSidebar.css";
import {
  IoHomeOutline,
  IoTodayOutline,
  IoThumbsUpOutline,
  IoPersonOutline,
  IoLogOutOutline,
} from "react-icons/io5";
import { useAuth } from "../services/AuthContext";

export default function LeftSidebar({
  currentPage,
  clickOnTodayMeme,
  navigateToHome,
  navigateToProfile,
  clickOnMyUpVotedMeme,
}) {
  const { isLoggedIn, logout } = useAuth();
  return (
    <div className="left-sidebar sidebar-sticky">
      <ul className="menu">
        <li
          className={`menu-item ${currentPage === "home" ? "selected" : ""}`}
          onClick={navigateToHome}
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
          onClick={clickOnTodayMeme}
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
            onClick={clickOnMyUpVotedMeme}
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
            onClick={navigateToProfile}
          >
            <i className="icon">
              <IoPersonOutline />
            </i>
            <span>Profilo</span>
          </li>
        )}
        {isLoggedIn && (
          <li className="menu-item d-md-none" onClick={logout}>
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
