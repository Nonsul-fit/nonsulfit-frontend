import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { checkAnalysisStatus } from "../../types/nonsulService";

const LoadingPage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const data = await checkAnalysisStatus();
        if (data.status === "COMPLETED") {
          clearInterval(poll);
          navigate("/result");
        }
      } catch (e) {
        console.error("체크 실패", e);
      }
    }, 2000);

    return () => clearInterval(poll);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] py-20">
      <div className="w-16 h-16 border-4 border-indigo-100 border-t-primary rounded-full animate-spin mb-8" />
      <h2 className="text-xl font-bold mb-2">논술 분석 리포트 생성중입니다.</h2>
    </div>
  );
};

export default LoadingPage;
