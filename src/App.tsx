import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { FormProvider } from "./context/FormContext";
import MainLayout from "./layouts/MainLayout";
import LoadingPage from "./pages/Loading/LoadingPage";
import LoginPage from "./pages/Login/LoginPage";
import SignupPage from "./pages/Login/SingupPage";
import Result from "./pages/Result/Result";
import Step01 from "./pages/Step/Step01";
import Step02 from "./pages/Step/Step02";
import Step03 from "./pages/Step/Step03";

function App() {
  return (
    <div>
      <BrowserRouter>
        <FormProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            <Route element={<MainLayout />}>
              <Route path="/home" element={<Step01 />} />
              <Route path="/step02" element={<Step02 />} />
              <Route path="/step03" element={<Step03 />} />
              <Route path="/loading" element={<LoadingPage />} />
              <Route path="/result" element={<Result />} />
              <Route path="/mypage" element={<div>마이페이지</div>} />
            </Route>
          </Routes>
        </FormProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
