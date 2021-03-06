import { useQuery } from "react-query";
import styled from "styled-components";
import {
  getNowPlayingMv,
  getPopularMv,
  getTopRatedMv,
  IGetMovies,
} from "./../api";
import { makeImgPath } from "./utils";
import { AnimatePresence, motion, useViewportScroll } from "framer-motion";
import { useState } from "react";
import { useMatch, useNavigate } from "react-router-dom";

const Wrapper = styled.div`
  background-color: black;
`;

const Loader = styled.div`
  height: 20vh;
  display: flex;
  justify-content: center;
  text-align: center;
`;

const Banner = styled.div<{ bgPhoto: string }>`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  padding: 60px;
  background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)),
    url(${(props) => props.bgPhoto});
  background-size: cover;
`;

const Describe = styled.div`
  position: absolute;
  bottom: 250px;
  width: 50%;
`;

const Title = styled.h2`
  font-size: 3vw;
  margin-bottom: 20px;
`;

const Overview = styled.p`
  font-size: 1vw;
`;

const Slider = styled.div`
  position: relative;
  top: -150px;
  margin-bottom: 100px;
`;

const Category = styled.p`
  padding: 0 60px;
  margin-bottom: 20px;
  font-size: 1.5vw;
`;

const Row = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  position: absolute;
  gap: 5px;
  width: 100%;
  padding: 0 60px;
`;

const Box = styled(motion.div)<{ bgPhoto: string }>`
  background-image: url(${(props) => props.bgPhoto});
  background-color: white;
  background-size: cover;
  background-position: center center;
  height: 200px;
  font-size: 66px;
  cursor: pointer;

  &:first-child {
    transform-origin: center left;
  }

  &:last-child {
    transform-origin: center right;
  }
`;

const Info = styled(motion.div)`
  padding: 10px;
  background-color: ${(props) => props.theme.black.lighter};
  opacity: 0;
  position: absolute;
  width: 100%;
  bottom: 0;

  h4 {
    text-align: center;
    font-size: 18px;
  }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  opacity: 0;
`;

const BigMovie = styled(motion.div)`
  position: absolute;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: 40%;
  height: 80vh;
  background-color: ${(props) => props.theme.black.lighter};
  border-radius: 15px;
  overflow: hidden;
`;

const BigCover = styled.div`
  width: 100%;
  background-size: cover;
  background-position: center center;
  height: 400px;
`;

const BigTitle = styled.h3`
  color: ${(props) => props.theme.white.lighter};
  padding: 20px;
  font-size: 46px;
  position: relative;
  top: -80px;
`;

const BigOverview = styled.p`
  padding: 20px;
  color: ${(props) => props.theme.white.lighter};
  position: relative;
  top: -80px;
`;

const rowVars = {
  hidden: {
    x: window.outerWidth - 10,
  },
  visible: {
    x: 0,
  },
  exit: {
    x: -window.outerWidth + 10,
  },
};

const boxVars = {
  normal: {
    scale: 1,
  },
  hover: {
    scale: 1.3,
    transition: { delay: 0.5, duration: 0.3, type: "tween" },
    y: -50,
  },
};

const infoVars = {
  hover: {
    opacity: 1,
    transition: { delay: 0.5, duration: 0.3, type: "tween" },
  },
};

const offset = 6;

function Home() {
  const NETFLIX_LOGO_URL =
    "https://assets.brand.microsites.netflix.io/assets/2800a67c-4252-11ec-a9ce-066b49664af6_cm_800w.jpg?v=4";

  const navigate = useNavigate();
  const bigMovieMatch = useMatch("movies/:movieId");
  const { isLoading: isPopularMvLoading, data: popularMvdata } =
    useQuery<IGetMovies>(["movies", "popularMv"], getPopularMv);
  const { isLoading: isNowPlayingMvLoading, data: nowPlayingMvData } =
    useQuery<IGetMovies>(["movies", "nowPlaying"], getNowPlayingMv);
  const { isLoading: isTopRatedMvLoading, data: topRatedMvData } =
    useQuery<IGetMovies>(["movies", "topRated"], getTopRatedMv);

  const LOADING =
    isPopularMvLoading || isNowPlayingMvLoading || isTopRatedMvLoading;

  const { scrollY } = useViewportScroll();
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);

  const incereaseIndex = () => {
    if (popularMvdata) {
      if (leaving) return;
      toggleLeaving();
      const totalMovies = popularMvdata.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      setIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };

  const toggleLeaving = () => setLeaving((prev) => !prev);

  const onBoxClicked = (movieId: number) => navigate(`/movies/${movieId}`);
  const onOverlayClick = () => {
    navigate(`/`);
  };

  const clickedMovie =
    bigMovieMatch?.params.movieId &&
    popularMvdata?.results.find(
      (movie) => movie.id + "" === bigMovieMatch.params.movieId
    );

  return (
    <Wrapper>
      {LOADING ? (
        <Loader>Loading..</Loader>
      ) : (
        <>
          <Banner
            onClick={incereaseIndex}
            bgPhoto={makeImgPath(popularMvdata?.results[0].backdrop_path || "")}
          >
            <Describe>
              <Title>{popularMvdata?.results[0].title}</Title>
              <Overview>{popularMvdata?.results[0].overview}</Overview>
            </Describe>
          </Banner>

          <Slider>
            <Category>Popular</Category>
            <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
              <Row
                variants={rowVars}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "tween", duration: 1 }}
                key={index}
              >
                {popularMvdata?.results
                  .slice(1)
                  .slice(index * offset, index * offset + offset)
                  .map((movie) => (
                    <Box
                      layoutId={movie.id + ""}
                      onClick={() => onBoxClicked(movie.id)}
                      variants={boxVars}
                      initial="normal"
                      whileHover="hover"
                      transition={{ type: "tween" }}
                      key={movie.id}
                      bgPhoto={
                        movie.backdrop_path
                          ? makeImgPath(movie.backdrop_path, "w500")
                          : NETFLIX_LOGO_URL
                      }
                    >
                      <Info variants={infoVars}>
                        <h4>{movie.title}</h4>
                      </Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
          </Slider>
          <Slider>
            <Category>Now Playing</Category>
            <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
              <Row
                variants={rowVars}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "tween", duration: 1 }}
                key={index}
              >
                {nowPlayingMvData?.results
                  .slice(index * offset, index * offset + offset)
                  .map((movie) => (
                    <Box
                      layoutId={movie.id + ""}
                      onClick={() => onBoxClicked(movie.id)}
                      variants={boxVars}
                      initial="normal"
                      whileHover="hover"
                      transition={{ type: "tween" }}
                      key={movie.id}
                      bgPhoto={
                        movie.backdrop_path
                          ? makeImgPath(movie.backdrop_path, "w500")
                          : NETFLIX_LOGO_URL
                      }
                    >
                      <Info variants={infoVars}>
                        <h4>{movie.title}</h4>
                      </Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
          </Slider>
          <Slider>
            <Category>Top Rated</Category>
            <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
              <Row
                variants={rowVars}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "tween", duration: 1 }}
                key={index}
              >
                {topRatedMvData?.results
                  .slice(index * offset, index * offset + offset)
                  .map((movie) => (
                    <Box
                      layoutId={movie.id + ""}
                      onClick={() => onBoxClicked(movie.id)}
                      variants={boxVars}
                      initial="normal"
                      whileHover="hover"
                      transition={{ type: "tween" }}
                      key={movie.id}
                      bgPhoto={
                        movie.backdrop_path
                          ? makeImgPath(movie.backdrop_path, "w500")
                          : NETFLIX_LOGO_URL
                      }
                    >
                      <Info variants={infoVars}>
                        <h4>{movie.title}</h4>
                      </Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
          </Slider>
          <AnimatePresence>
            {bigMovieMatch ? (
              <>
                <Overlay
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={onOverlayClick}
                />
                <BigMovie
                  style={{ top: scrollY.get() + 100 }}
                  layoutId={bigMovieMatch.params.movieId}
                >
                  {clickedMovie && (
                    <>
                      <BigCover
                        style={{
                          backgroundImage: `linear-gradient(to top, black, transparent), url(${makeImgPath(
                            clickedMovie.backdrop_path
                          )})`,
                        }}
                      />
                      <BigTitle>{clickedMovie.title}</BigTitle>
                      <BigOverview>{clickedMovie.overview}</BigOverview>
                    </>
                  )}
                </BigMovie>
              </>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </Wrapper>
  );
}

export default Home;
