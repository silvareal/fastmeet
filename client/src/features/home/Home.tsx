import { Container } from "@mui/material";
import AppHeader from "AppHeader";
import React, { FunctionComponent } from "react";

interface HomeProps {}

const Home: FunctionComponent<HomeProps> = () => {
  return (
    <div className="bg-gray-100">
      <Container maxWidth="xl" className="text-text-secondary">
        <AppHeader />
      </Container>
    </div>
  );
};

export default Home;
