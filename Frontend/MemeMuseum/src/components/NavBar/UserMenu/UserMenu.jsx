import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../../services/AuthContext";
import { FiUser } from "react-icons/fi";
import "./UserMenu.css";
import { IoLogOutOutline, IoPersonOutline } from "react-icons/io5";

export default function UserMenu({onClickProfile}) {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  const handleClickOutside = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="user-menu" ref={menuRef}>
      <button className="icon-button" onClick={() => setOpen(!open)}>
        <FiUser size={22} />
      </button>

      {open && (
        <div className="dropdown">
          <button onClick={onClickProfile}> <IoPersonOutline /> Profilo</button>
          <button onClick={logout}><IoLogOutOutline /> Logout</button>
        </div>
      )}
    </div>
  );
}
