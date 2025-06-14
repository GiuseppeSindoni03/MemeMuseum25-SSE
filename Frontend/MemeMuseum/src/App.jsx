import "./App.css";
import HomePage from "./components/HomePage/HomePages";
import Profile from "./components/Profile/Profile";
import { AuthProvider } from "./services/AuthContext";
import { ToastContainer } from "react-toastify";
import { useEffect, useState } from "react";
import AppNavbar from "./components/NavBar/NavBar";
import Pagination from "./components/HomePage/Pagination/Pagination";
import LeftSidebar from "./components/LeftSideBar/LeftSidebar";
import {
  fetchMemes,
  searchMeme,
  getTodayMemes,
  getMyUpvotedMemes,
  getMyMemes,
} from "./services/memeService";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import Auth from "./components/Auth";
import CreateMemeModal from "./components/NavBar/CreateModal/CreateMemeModal";
import { Container, Row, Col } from "react-bootstrap";
import { handleApiError } from "./utility/handleApiError";
import "react-toastify/dist/ReactToastify.css";

function AppWrapper() {
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const memesPerPage = 10;
  const [totalMemes, setTotalMemes] = useState(0);
  const [currentMemePage, setCurrentMemePage] = useState(1);
  const [currentLoadMode, setCurrentLoadMode] = useState("home");

  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const pageParam = parseInt(searchParams.get("page")) || 1;
    setCurrentMemePage(pageParam);

    const path = location.pathname;
    if (path === "/") loadMemes("home");
    else if (path === "/search") loadMemes("search");
    else if (path === "/profile") loadMemes("profile");
    else if (path === "/today") loadMemes("todayMemes");
    else if (path === "/my-upvotes") loadMemes("myUpvotes");
  }, [location.pathname, searchParams]);

  const loadMemes = async (mode = "home", resetPage = false) => {
    setLoading(true);
    setError(null);

    const pageParam = parseInt(searchParams.get("page")) || 1;
    const offset = resetPage ? 0 : (pageParam - 1) * memesPerPage;

    if (resetPage) {
      setCurrentMemePage(1);
      searchParams.set("page", "1");
      setSearchParams(searchParams);
    }

    setCurrentLoadMode(mode);

    try {
      let data;
      if (mode === "search") {
        const title = searchParams.get("title") || "";
        const tags = searchParams.get("tags")?.split(",") || [];
        const date = searchParams.get("date") || "";
        const sortBy = searchParams.get("sortBy") || "date";

        const isEmptySearch = !title && tags.length === 0 && !date;

        if (isEmptySearch) {
          const { memes, total } = await fetchMemes(memesPerPage, offset);
          data = memes;
          setTotalMemes(total);
        } else {
          const { memes, total } = await searchMeme(
            { title, tags, date, sortBy },
            memesPerPage,
            offset
          );
          data = memes;
          setTotalMemes(total);
        }
      } else if (mode === "todayMemes") {
        data = await getTodayMemes();
      } else if (mode === "myUpvotes") {
        data = await getMyUpvotedMemes();
      } else if (mode === "profile") {
        data = await getMyMemes();
      } else {
        const { memes, total } = await fetchMemes(memesPerPage, offset);
        data = memes;
        setTotalMemes(total);
      }
      setMemes(data);
    } catch (err) {
      handleApiError(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeme = (newMeme) => {
    setMemes((prev) => [newMeme, ...prev]);
  };

  const handlePageChange = (page) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", page);
    setSearchParams(newParams);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#121317",
      }}
    >
      <AppNavbar
        onClick={() => setShowModal(true)}
        onOpenCreateModal={() => setShowCreateModal(true)}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      <CreateMemeModal
        showModal={showCreateModal}
        onClickClose={() => setShowCreateModal(false)}
        onCreate={handleCreateMeme}
      />

      <Container fluid className="homepage-container">
        <Auth showModal={showModal} onClickClose={() => setShowModal(false)} />

        {sidebarOpen && (
          <div
            className="mobile-sidebar-overlay d-md-none"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "180px",
              height: "100vh",
              backgroundColor: "#191a1e",
              zIndex: 1050,
              padding: "0px",
              overflowY: "auto",
            }}
          >
            <LeftSidebar setSidebarOpen={setSidebarOpen} />
          </div>
        )}

        <Row>
          <Col md={3} className="d-none d-md-flex justify-content-center">
            <LeftSidebar setSidebarOpen={setSidebarOpen} />
          </Col>

          <Col xs={12} md={6} className="d-flex flex-column align-items-center">
            {loading && <p>Caricamento in corso...</p>}
            {error && <p>Errore: {error}</p>}
            {!loading && !error && (
              <>
                <Routes>
                  <Route
                    path="/"
                    element={
                      <HomePage
                        memes={memes}
                        setMemes={setMemes}
                        onClickNotLogged={() => setShowModal(true)}
                      />
                    }
                  />
                  <Route
                    path="/search"
                    element={
                      <HomePage
                        memes={memes}
                        setMemes={setMemes}
                        onClickNotLogged={() => setShowModal(true)}
                      />
                    }
                  />
                  <Route
                    path="/today"
                    element={
                      <HomePage
                        memes={memes}
                        setMemes={setMemes}
                        onClickNotLogged={() => setShowModal(true)}
                      />
                    }
                  />
                  <Route
                    path="/my-upvotes"
                    element={
                      <HomePage
                        memes={memes}
                        setMemes={setMemes}
                        onClickNotLogged={() => setShowModal(true)}
                      />
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <div style={{ maxWidth: "800px", padding: "0px 30px" }}>
                        <Profile />
                        <hr className="my-4" style={{ borderColor: "#444" }} />
                        <h5 className="text-light mb-3">I miei Meme</h5>
                        <HomePage
                          memes={memes}
                          setMemes={setMemes}
                          onClickNotLogged={() => setShowModal(true)}
                        />
                      </div>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
                {totalMemes > memesPerPage && (
                  <div className="mt-4">
                    <Pagination
                      totalItems={totalMemes}
                      itemsPerPage={memesPerPage}
                      currentPage={currentMemePage}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppWrapper />
        <ToastContainer position="bottom-center" autoClose={3000} />
      </Router>
    </AuthProvider>
  );
}
