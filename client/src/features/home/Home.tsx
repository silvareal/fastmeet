import { Button, Container, Icon, TextField, Typography } from "@mui/material";
import AppHeader from "AppHeader";
import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import ReactGA from "react-ga";

// import Memoji1 from "assets/img/memoji1.png";
// import Memoji2 from "assets/img/memoji2.png";
// import Memoji3 from "assets/img/memoji3.png";
// import Memoji4 from "assets/img/memoji4.png";

// import Document from "assets/img/document.png";
// import Chat from "assets/img/chat.png";
// import VideoCamera from "assets/img/video-camera.png";

import "./home.css";
import { getRandomCharacters } from "utils/VideoUtils";
import { useNavigate } from "react-router-dom";

interface HomeProps {}

const Home: FunctionComponent<HomeProps> = () => {
  const navigate = useNavigate();
  const [xAxis, setXAxis] = useState(0);
  const [yAxis, setYAxis] = useState(0);

  const Memoji1 =
    "https://res.cloudinary.com/silva/image/upload/v1678081666/memoji1.png";
  const Memoji2 =
    "https://res.cloudinary.com/silva/image/upload/v1678081835/memoji2.png";
  const Memoji3 =
    "https://res.cloudinary.com/silva/image/upload/v1678081835/memoji3.png";
  const Memoji4 =
    "https://res.cloudinary.com/silva/image/upload/v1678081835/memoji4.png";
  const Document =
    "https://res.cloudinary.com/silva/image/upload/v1678081835/document.png";
  const Chat =
    "https://res.cloudinary.com/silva/image/upload/v1678081835/chat.png";
  const VideoCamera =
    "https://res.cloudinary.com/silva/image/upload/v1678081836/video-camera.png";

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

  const formik = useFormik({
    initialValues: {
      meetingId: "",
    },
    enableReinitialize: true,
    validationSchema: yup.object({
      meetingId: yup
        .string()
        .label("Meeting Id")
        .min(7, "Must be more than 7 characters")
        .required("Required"),
    }),
    onSubmit: (values) => {
      navigate(values.meetingId);
      ReactGA.event({
        category: "New Meeting",
        action: "Join New Meeting",
      });
    },
  });

  useEffect(() => {
    const randomCharacters = getRandomCharacters(7);
    if (randomCharacters) {
      formik.setFieldValue("meetingId", randomCharacters);
    }
    // eslint-disable-next-line;
  }, []);

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
                Opensource service we built for secure business and social
                meetings to make it free and available for all.
              </Typography>

              <form onSubmit={formik.handleSubmit} className="flex mt-16">
                <TextField
                  label="FastMeetNow"
                  fullWidth
                  className="w-3/5 font-bold"
                  placeholder="WUDUS83939JNE"
                  {...formik.getFieldProps("meetingId")}
                  error={
                    formik.touched.meetingId && Boolean(formik.errors.meetingId)
                  }
                  helperText={
                    formik.touched.meetingId && formik.errors.meetingId
                  }
                />
                <Button
                  size="large"
                  disableElevation
                  className="h-full py-[15.7px] w-2/5 font-bold"
                  fullWidth
                  type="submit"
                >
                  New Meeting
                </Button>
              </form>
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
