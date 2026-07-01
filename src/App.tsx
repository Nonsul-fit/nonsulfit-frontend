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
import ResultList from "./pages/Result/ResultList";
import PaymentPage from "./pages/Payment/PaymentPage";
import SuccessPage from "./pages/Payment/SuccessPage";
import FailPage from "./pages/Payment/FailPage";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <div>
      <BrowserRouter>
        <FormProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            <Route element={<MainLayout />}>
              <Route path="/home" element={<Step01 />} />
              <Route path="/step02" element={<Step02 />} />
              <Route path="/step03" element={<Step03 />} />
              <Route path="/loading" element={<LoadingPage />} />
              <Route path="/result" element={<ResultList />} />
              <Route path="/result/:id" element={<Result />} />

              <Route path="/payment" element={<PaymentPage />} />

              <Route path="/payment/success" element={<SuccessPage />} />
              <Route path="/payment/fail" element={<FailPage />} />

              <Route path="/mypage" element={<div>마이페이지</div>} />
            </Route>
          </Routes>
        </FormProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
