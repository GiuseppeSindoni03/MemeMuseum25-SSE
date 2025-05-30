import { useEffect, useRef, useState } from "react";
import { Form, Collapse } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import "./SearchBar.css";
import ReactTagInput from "@pathofdev/react-tag-input";
import "@pathofdev/react-tag-input/build/index.css";

export default function SearchBar({ onSearch, filters, setFilters }) {
  const [expanded, setExpanded] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setExpanded(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div
      ref={wrapperRef}
      className="search-bar-wrapper position-relative"
      onFocus={() => setExpanded(true)}
    >
      <Form.Control
        type="text"
        placeholder="Cerca meme..."
        onClick={() => setExpanded(true)}
        name="title"
        value={filters.title}
        onChange={handleChange}
        style={{ border: "0" }}
      />

      <Collapse in={expanded}>
        <div className="search-filters mt-2 bg-dark p-3 rounded shadow">
          {/* Data */}
          <Form.Group className="mb-2">
            <Form.Label className="text-light">Data caricamento</Form.Label>
            <Form.Control
              type="date"
              value={filters.date}
              name="date"
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label className="text-light">Tag</Form.Label>
            <ReactTagInput
              tags={Array.isArray(filters.tags) ? filters.tags : []}
              onChange={(newTags) =>
                setFilters((prev) => ({ ...prev, tags: newTags }))
              }
              placeholder="Aggiungi un tag e premi invio"
            />
          </Form.Group>

          {/* Pulsanti */}
          <div className="d-flex justify-content-end">
            <button className="btn btn-outline-light me-2" onClick={onSearch}>
              Cerca
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setFilters({ title: "", tags: [], date: "" });
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </Collapse>
    </div>
  );
}
