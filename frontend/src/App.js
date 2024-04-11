import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import Heatmap from "./pages/Heatmap";
import List from "./pages/List";
import Stats from "./pages/Stats";
import Landing from "./pages/Landing";
import About from "./pages/About";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path={"/"} element={<Landing mode="normal"/>} />
        <Route path={"/callback"} element={<Landing mode="callback"/>} />
        <Route path={"/sample"} element={<Landing mode="sample"/>} />
        <Route path={"/map"} element={<Heatmap />} />
        <Route path={"/list"} element={<List />} />
        <Route path={"/stats"} element={<Stats />} />
        <Route path={"/about"} element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
