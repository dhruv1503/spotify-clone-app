// import { ChangeEvent, useRef, useState } from "react";
// import "./App.css";
// import axios from "axios";

// function App() {
//   // /curl -X POST "https://accounts.spotify.com/api/token" \
//   // -H "Content-Type: application/x-www-form-urlencoded" \
//   // -d "grant_type=client_credentials&client_id=your-client-id&client_secret=your-client-secret"

//   const authenticateUser = async () => {
//     console.log(import.meta.env);
//     try {
//       const params = new URLSearchParams();
//       params.append('grant_type', 'client_credentials');
//       params.append('client_id', import.meta.env.VITE_CLIENT_ID);
//       params.append('client_secret', import.meta.env.VITE_CLIENT_SECRET);

//       const response = await axios.post(
//         "https://accounts.spotify.com/api/token",
//         params,
//         {
//           headers: {
//             "Content-Type": "application/x-www-form-urlencoded",
//           },
//         }
//       );

//       console.log(response.data); // handle the response data
//     } catch (error) {
//       console.error('Error authenticating user:', error);
//     }
//   };
// //   access_token
// // :
// // "BQADc9ok4sLK8DSEX2NPsz5tEDcjFBq7_YMkeWsrzlpbSqTJB8LFWjERTO2c8eDYxF1-VWzoQ7uPo2kBQK9PNR_4AQ-1SnJ7ziAs_Qsx6XXqStkw4UI"
// // expires_in
// // :
// // 3600
// // token_type
// // :
// // "Bearer"
//   const getSongs = async() => {
// try{
//     const data = await axios.get("https://api.spotify.com/v1/artists/4Z8W4fKeB5YxbusRsdQVPb", {headers : {
//         Authorization : `Bearer BQADc9ok4sLK8DSEX2NPsz5tEDcjFBq7_YMkeWsrzlpbSqTJB8LFWjERTO2c8eDYxF1-VWzoQ7uPo2kBQK9PNR_4AQ-1SnJ7ziAs_Qsx6XXqStkw4UI`
//     }})
//     console.log(data)
// }
// catch(error){
//     console.log(error)
// }
//   }
//   return (
//     <>
//     <button onClick={authenticateUser}>Call Authenication</button>
//     <button onClick={getSongs}>Get Songs</button>
//     </>
//   )
// }

// export default App;
import "./App.css";
import { useContext, useEffect, useState } from "react";
import Card from "./components/Card";
import CreatePlaylist from "./components/CreatePlaylist";
import { initializePlaylist } from "./initialize";
import Navbar from "./components/Navbar";
import { MusicContext } from "./Context";

function App() {
  const [keyword, setKeyword] = useState("");
  const [message, setMessage] = useState("");
  const [tracks, setTracks] = useState([]);
  const [token, setToken] = useState(null);

  const musicContext = useContext(MusicContext);
  const isLoading = musicContext.isLoading;
  const setIsLoading = musicContext.setIsLoading;
  const setLikedMusic = musicContext.setLikedMusic;
  const setpinnedMusic = musicContext.setPinnedMusic;
  const resultOffset = musicContext.resultOffset;
  const setResultOffset = musicContext.setResultOffset;

  const fetchMusicData = async () => {
    setTracks([]);
    window.scrollTo(0, 0);
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${keyword}&type=track&offset=${resultOffset}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch music data");
      }

      const jsonData = await response.json();

      setTracks(jsonData.tracks.items);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      setResultOffset(0);
      fetchMusicData();
    }
  };

  useEffect(() => {
    initializePlaylist();

    // current client credentials will be deleted in few days
    const fetchToken = async () => {
      try {
        const response = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `grant_type=client_credentials&client_id=${
            process.env.REACT_APP_CLIENT_ID
          }&client_secret=${process.env.REACT_APP_CLIENT_SECRET}`,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch token");
        }

        const jsonData = await response.json();
        setToken(jsonData.access_token);
      } catch (error) {
        setMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchToken();
    setLikedMusic(JSON.parse(localStorage.getItem("likedMusic")));
    setpinnedMusic(JSON.parse(localStorage.getItem("pinnedMusic")));
  }, [setIsLoading, setLikedMusic, setpinnedMusic]);

  return (
    <>
      <Navbar
        keyword={keyword}
        setKeyword={setKeyword}
        handleKeyPress={handleKeyPress}
        fetchMusicData={fetchMusicData}
      />

      <div className="container">
        <div className={`row ${isLoading ? "" : "d-none"}`}>
          <div className="col-12 py-5 text-center">
            <div
              className="spinner-border"
              style={{ width: "3rem", height: "3rem" }}
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
        <div className="row">
          {tracks.map((element) => {
            return <Card key={element.id} element={element} />;
          })}
        </div>
        <div className="row" hidden={tracks.length === 0}>
          <div className="col">
            <button
              onClick={() => {
                setResultOffset((previous) => previous - 20);
                fetchMusicData();
              }}
              className="btn btn-outline-success w-100"
              disabled={resultOffset === 0}
            >
              Previous Next Page: {resultOffset / 20}
            </button>
          </div>
          <div className="col">
            <button
              onClick={() => {
                setResultOffset((previous) => previous + 20);
                fetchMusicData();
              }}
              className="btn btn-outline-success w-100"
            >
              Next Page: {resultOffset / 20 + 2}
            </button>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <h4 className="text-center text-danger py-2">{message}</h4>
          </div>
        </div>
        <div className="row">
          <div className="col-12 py-5 text-center">
            <h1>
              <i className="bi bi-music-note-list mx-3"></i>
              {process.env.REACT_APP_BRAND_NAME}
            </h1>
            <h3 className="py-5">Discover music in 30 seconds</h3>
           
          </div>
        </div>
      </div>
      <div
        className="modal fade position-absolute"
        id="exampleModal"
        tabIndex={-1}
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <CreatePlaylist />
      </div>
    </>
  );
}

export default App;

