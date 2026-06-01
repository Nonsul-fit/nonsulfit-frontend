import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { checkAnalysisStatus } from "../../types/nonsulService";

const LoadingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const data = await checkAnalysisStatus();

        if (data.status === "COMPLETED") {
          clearInterval(poll);

          try {
            const listResponse = await api.get("/nonsulfit/result");
            const reports = listResponse.data?.result || [];

            if (reports.length > 0) {
              const maxId = Math.max(...reports.map((r: any) => Number(r.id)));

              navigate(`/result/${maxId}`);
            } else {
              navigate("/result");
            }
          } catch (error) {
            console.error(
              "최신 리포트 ID 조회 실패, 기본 목록으로 이동:",
              error,
            );
            navigate("/result");
          }
        }

        if (data.status === "FAILED") {
          clearInterval(poll);

          const errorMsg =
            data.errorMessage || "서버 데이터 형식이 올바르지 않습니다.";
          alert(
            `⚠️ 분석 실패\n\n이유: ${errorMsg}\n\n성적 입력 창으로 돌아갑니다.`,
          );

          navigate("/step03");
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
      <p className="text-gray-400 text-sm">잠시만 기다려 주세요.</p>
    </div>
  );
};

export default LoadingPage;
