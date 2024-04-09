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
        <Route exact path={"/"} element={<Landing isCallback={false}/>} />
        <Route path={"/callback"} element={<Landing isCallback={true}/>} />
        <Route path={"/map"} element={<Heatmap mode="normal"/>} />
        <Route path={"/map-sample"} element={<Heatmap mode="sample"/>} />
        <Route path={"/list"} element={<List />} />
        <Route path={"/stats"} element={<Stats />} />
        <Route path={"/about"} element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;