import { Button, Container, Icon, TextField, Typography } from "@mui/material";
import AppHeader from "AppHeader";
import React, { FunctionComponent, useRef, useState } from "react";

import Memoji1 from "assets/img/memoji1.png";
import Memoji2 from "assets/img/memoji2.png";
import Memoji3 from "assets/img/memoji3.png";
import Memoji4 from "assets/img/memoji4.png";

import Document from "assets/img/document.png";
import Chat from "assets/img/chat.png";
import VideoCamera from "assets/img/video-camera.png";

import "./home.css";

interface HomeProps {}

const Home: FunctionComponent<HomeProps> = () => {
  const [xAxis, setXAxis] = useState(0);
  const [yAxis, setYAxis] = useState(0);

  const hoverRef = useRef<HTMLDivElement>(null);

  const getGeoMetic = (e: React.MouseEvent<Element, MouseEvent>): void => {
    if (hoverRef?.current) {
      const dimension = hoverRef.current.getBoundingClientRect();
      setXAxis(e.clientX - (dimension.left + Math.floor(dimension.width / 2)));
      setYAxis(e.clientX - (dimension.left + Math.floor(dimension.width / 2)));
    }
  };

  const restGeoMetric = (e: React.MouseEvent<Element, MouseEvent>): void => {
    setXAxis(0);
    setYAxis(0);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <AppHeader />
      <Container maxWidth="xl" className="flex min-h-screen items-center">
        <div className="flex w-full">
          <div className="flex justify-center lg:justify-start items-center text-center lg:text-left  w-full lg:w-2/4">
            <div className="max-w-[550px]">
              <Typography variant="h5" className="text-gray-400">
                No Account Needed
              </Typography>
              <Typography variant="h1" mt={1} fontWeight={600}>
                Start & join meetings free
              </Typography>
              <Typography className="max-w-[500px] mt-3" variant="h6">
                We re-engineered the service we built for secure business and
                social meetings to make it free and available for all.
              </Typography>

              <div className="flex mt-16">
                <TextField
                  label="FastMeetNow"
                  fullWidth
                  className="w-3/5 font-bold"
                />
                <Button
                  size="large"
                  disableElevation
                  className="h-full py-[15.7px] w-2/5 font-bold"
                  fullWidth
                >
                  New Meeting
                </Button>
              </div>
            </div>
          </div>

          <div
            className="w-2/4 hidden transition duration-1000 ease-in-out  lg:block"
            ref={hoverRef}
            onMouseMove={(e) => getGeoMetic(e)}
            onMouseLeave={(e) => restGeoMetric(e)}
          >
            <div className="relative flex justify-center items-center">
              <div className="max-w-[500px] relative z-20 grid grid-cols-2 grid-rows-2 gap-2">
                <img src={Memoji1} className="w-full  max-w-[300px]" alt="" />
                <img
                  src={Memoji3}
                  alt=""
                  className="w-full z-2 max-w-[300px]"
                />
                <img src={Memoji4} alt="" className="w-full max-w-[300px]" />
                <img src={Memoji2} alt="" className="w-full max-w-[300px]" />
              </div>

              <div className="w-full cursor-pointer z-10 top-0 right-12 translate-y-[-80px] absolute max-w-[100px]">
                <img
                  src={Document}
                  title="Document"
                  alt=""
                  style={{
                    transform: `translate(calc(${xAxis} / 60 * 10px),calc(${yAxis}  / 60 * 2px))`,
                    top: "23%",
                    transition: "all .3s",
                  }}
                />
              </div>

              <div className="w-full cursor-pointer top-0 left-0 z-20  translate-y-[-130px] absolute max-w-[200px]">
                <img
                  src={Chat}
                  alt=""
                  title="Chat"
                  style={{
                    transform: `translate(calc(${xAxis} / 60 * 5px),calc(${yAxis}  / 60 * 5px))`,
                    top: "23%",
                    transition: "all .3s",
                  }}
                />
              </div>

              <img
                src={VideoCamera}
                alt=""
                title="Video Meeting"
                className="w-full cursor-pointer top-[38%] z-20 left-0  absolute max-w-[100px]"
                style={{
                  transform: `translate(calc(${xAxis} / 60 * 5px),calc(${yAxis}  / 60 * 20px))`,
                  top: "23%",
                  transition: "all .3s",
                }}
              />

              <div className="home-microphone">
                <Icon fontSize="large" className="home-microphone__icon">
                  mic
                </Icon>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Home;
