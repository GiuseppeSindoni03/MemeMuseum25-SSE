import "./App.css";
import HomePage from "./pages/HomePages";
import Profile from "./pages/Profile";
import { AuthProvider } from "./services/AuthContext";
import { ToastContainer } from "react-toastify";
import { useEffect, useState } from "react";
import AppNavbar from "./components/NavBar";
import LeftSidebar from "./components/LeftSidebar";
import {
  fetchMemes,
  searchMeme,
  getTodayMemes,
  getMyUpvotedMemes,
  getMyMemes
} from "./services/memeService";
import Auth from "./components/Auth";
import CreateMemeModal from "./components/CreateMemeModal";
import { Container, Row, Col } from "react-bootstrap";
import { handleApiError } from "./utility/handleApiError";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({ tags: [] });
  const [currentPage, setCurrentPage] = useState("home");
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleCreateMeme = (newMeme) => {
    setMemes((prev) => [newMeme, ...prev]);
  };

  useEffect(() => {
    loadMemes("home");
  }, [setMemes]);

  const loadMemes = async (mode = "home") => {
    setLoading(true);
    setError(null);

    try {
      let data;

      if (mode === "search") {
        const isEmptySearch =
          !filters.title && filters.tags.length === 0 && !filters.date;
        data = isEmptySearch ? await fetchMemes() : await searchMeme(filters);
        setCurrentPage("home");
      } else if (mode === "todayMemes") {
        data = await getTodayMemes();
        setCurrentPage("todayMemes");
      } else if (mode === "myUpvotes") {
        data = await getMyUpvotedMemes();
        setCurrentPage("myUpvotes");
      } else if (mode === "profile") {
        data = await getMyMemes();
        console.log("Mymeme: ", data);
        setCurrentPage("profile");
      }else {
        data = await fetchMemes();
        setCurrentPage("home");
      }

      setMemes(data);
    } catch (err) {
      handleApiError(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthProvider>
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
          onSearch={() => loadMemes("search")}
          filters={filters}
          setFilters={setFilters}
        />

        <CreateMemeModal
          showModal={showCreateModal}
          onClickClose={() => setShowCreateModal(false)}
          onCreate={handleCreateMeme}
        />

        <Container fluid className="homepage-container">
          <Auth
            showModal={showModal}
            onClickClose={() => setShowModal(false)}
          />

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
              <button
                className="btn btn-sm btn-danger mb-3"
                onClick={() => setSidebarOpen(false)}
              >
                ✕ Chiudi
              </button>
              <LeftSidebar
                currentPage={currentPage}
                navigateToHome={() => loadMemes("home")}
                navigateToProfile={() => loadMemes("profile")}
                clickOnTodayMeme={() => loadMemes("todayMemes")}
                clickOnMyUpVotedMeme={() => loadMemes("myUpvotes")}
              />
            </div>
          )}

          <Row>
            <Col md={3} className="d-none d-md-flex justify-content-center">
              <LeftSidebar
                currentPage={currentPage}
                navigateToHome={() => loadMemes("home")}
                navigateToProfile={() => loadMemes("profile")}
                clickOnTodayMeme={() => loadMemes("todayMemes")}
                clickOnMyUpVotedMeme={() => loadMemes("myUpvotes")}
              />
            </Col>

            <Col xs={12} md={6} className="d-flex justify-content-center">
              {loading && <p>Caricamento in corso...</p>}
              {error && <p>Errore: {error}</p>}
              {!loading &&
                !error &&
                (currentPage === "home" ||
                currentPage === "todayMemes" ||
                currentPage === "myUpvotes" ? (
                  <HomePage
                    memes={memes}
                    setMemes={setMemes}
                    onClickNotLogged={() => setShowModal(true)}
                  />
                ) : (
                  <div className="w-100" style={{ maxWidth: '800px', padding: '0px 30px' }}>
                    <Profile
                      user={{
                        username: "vincenzo123",
                        email: "vincenzo@email.com",
                        birthdate: "1998-04-20",
                      }}
                    />

                    <hr className="my-4" style={{ borderColor: "#444" }} />
                    <h5 className="text-light mb-3">I miei Meme</h5>

                    <HomePage
                      memes={memes}
                      setMemes={setMemes}
                      onClickNotLogged={() => setShowModal(true)}
                    />
                  </div>
                ))}
            </Col>
          </Row>
        </Container>
      </div>
      <ToastContainer position="bottom-center" autoClose={3000} />
    </AuthProvider>
  );
}

export default App;
