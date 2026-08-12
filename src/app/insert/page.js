"use client";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function Insert() {
  const supabase = createClient();
  const router = useRouter();

  const INITIAL_PORTFOLIO = {
    title: "",
    content: "",
    url: "",
    review: "",
    reviewer: "",
  };
  const createInitialImages = () => [
    {
      file: null,
      description: "",
      displayOrder: 1,
    },
    {
      file: null,
      description: "",
      displayOrder: 2,
    },
  ];

  const [portfolio, setPortfolio] = useState(INITIAL_PORTFOLIO);
  const [portfolioImages, setPortfolioImages] = useState(createInitialImages);

  const [thumbnail, setThumbnail] = useState(null);
  const [user, setUser] = useState(null);
  const [authForm, setAuthform] = useState({
    email: "",
    password: "",
  });

  const fileRef = useRef({
    image1: null,
    image2: null,
    thumbnail: null,
  });

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    })();
  }, [supabase.auth]);

  const resetForm = () => {
    setPortfolio(INITIAL_PORTFOLIO);
    setPortfolioImages(createInitialImages());
    setThumbnail(null);

    Object.values(fileRef.current).forEach((el) => {
      if (el) {
        el.value = "";
      }
    });
  };

  async function insertData(e) {
    e.preventDefault();

    //1. 썸네일 업로드
    let thumbnailPath = null;
    if (thumbnail) {
      thumbnailPath = await uploadFile(thumbnail, "thumbnail");
      if (!thumbnailPath) {
        alert("파일 업로드 실패");
        return; //파일 업로드 실패시 글 등록 취소
      }
    }

    //2. portfolio 테이블 저장
    const { data: insertedPortfolio, error } = await supabase
      .from("portfolio")
      .insert({ ...portfolio, thumbnail: thumbnailPath }) //글 등록
      .select("id") //등록한 글의 id 조회
      .single();

    if (error) {
      console.log(error);
      await supabase.storage.from("portfolio").remove([thumbnailPath]);
      alert(`대표 이미지 입력 실패:${error.message}`);
    } else {
      // console.log("데이터 입력 성공");
      // router.push("/");
      // router.refresh();
    }
    const portfolioId = insertedPortfolio.id; //새글의 id 할당
    const imageRows = [];
    const uploadedImagePaths = [];

    //3. 대표 이미지 업로드
    for (let image of portfolioImages) {
      if (!image.file) {
        continue; //첫번째 값이 없으면 다음 회차에서 계속해
      }
      //파일 업로드
      const imageResult = await uploadFile(image.file, "portfolio_images");
      uploadedImagePaths.push(imageResult); //대표이미지 파일의 경로 할당

      imageRows.push({
        portfolio_id: portfolioId,
        image_url: imageResult,
        description: image.description,
        display_order: image.displayOrder,
      });
    }

    //4. portfolio_images 테이블 저장
    if (imageRows.length > 0) {
      const { error } = await supabase.from("portfolio_images").insert(imageRows);
      if (error) {
        console.error("대표 이미지 등록 실패:", error);
        //버켓에 저장된 대표이미지 삭제
        if (uploadedImagePaths.length > 0) {
          await supabase.storage.from("portfolio").remove(uploadedImagePaths);
        }
        //portfolio 테이블에서 글 삭제
        await supabase.from("portfolio").delete().eq("id", portfolioId);

        //thumbnail 파일 삭제
        await supabase.storage.from("portfolio").remove([thumbnailPath]);
        alert(`대표 이미지 입력 실패:${error.message}`);
      }
    }
    //글 등록 성공시 - 모든 입력값 초기화
    alert("글 등록 성공");
    resetForm();
  }
  const handlePortfolioChange = (e) => {
    const { name, value } = e.target;
    setPortfolio((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePortfolioFileChange = (index) => (e) => {
    const selectedFile = e.target.files?.[0] ?? null;
    setPortfolioImages((prev) =>
      prev.map((image, idx) => (index === idx ? { ...image, file: selectedFile } : image)),
    );
  };
  const handlePortfolioDescChange = (index) => (e) => {
    const { value } = e.target;
    setPortfolioImages((prev) =>
      prev.map((image, idx) => (index === idx ? { ...image, description: value } : image)),
    );
  };

  const handleAuthChange = (e) => {
    const { name, value } = e.target;
    setAuthform((prev) => ({ ...prev, [name]: value }));
  };

  const handleThumbnailFileChange = (e) => {
    setThumbnail(e.target.files[0]);
    console.log(e.target.files[0]);
  };

  async function uploadFile(file, folder) {
    const ext = file.name.split(".").pop();
    const filePath = `${folder}/${crypto.randomUUID()}.${ext}`;

    const { data, error } = await supabase.storage.from("portfolio").upload(filePath, file);
    if (error) {
      // Handle error
      console.error("파일 업로드 실패:", error);
    } else {
      // Handle success
      console.log("파일 업로드 성공:");
      return filePath;
    }
  }
  //로그인 진행
  const handleLogin = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword(authForm);
    if (error) {
      alert("로그인 실패", error.message);
    } else {
      alert("로그인 성공");
      setUser(data.user);
      router.refresh();
    }
  };

  if (!user) {
    return (
      <div className="about_content shadow">
        <h2>관리자 로그인</h2>
        <div className="contact_form">
          <form onSubmit={handleLogin}>
            <p className="field">
              <label htmlFor="email">이메일</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="email"
                value={authForm.email}
                required
                onChange={handleAuthChange}
              />
            </p>
            <p className="field">
              <label htmlFor="password">비밀번호</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="비밀번호"
                value={authForm.password}
                required
                onChange={handleAuthChange}
              />
            </p>
            <p className="submit">
              <input type="submit" className="primary-btn" value="로그인" />
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="about_content shadow">
      <h2 className="mb-3">데이터 입력</h2>
      <div className="contact_form">
        <form onSubmit={insertData}>
          <p className="field">
            <label htmlFor="title">프로젝트 이름:</label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="프로젝트 이름"
              value={portfolio.title}
              required
              onChange={handlePortfolioChange}
            />
          </p>
          <p className="field">
            <label htmlFor="content">프로젝트 설명:</label>
            <textarea
              name="content"
              id="content"
              cols="30"
              rows="10"
              placeholder="프로젝트 설명"
              value={portfolio.content}
              required
              onChange={handlePortfolioChange}></textarea>
          </p>
          <p className="field">
            <label htmlFor="url">프로젝트 주소:</label>
            <input
              type="url"
              id="url"
              name="url"
              placeholder="프로젝트 주소"
              value={portfolio.url}
              onChange={handlePortfolioChange}
            />
          </p>
          <p className="field">
            <label htmlFor="review">프로젝트 후기:</label>
            <textarea
              name="review"
              id="review"
              cols="30"
              rows="10"
              placeholder="프로젝트 후기"
              value={portfolio.review}
              onChange={handlePortfolioChange}></textarea>
          </p>
          <p className="field">
            <label htmlFor="reviewer">후기 글쓴이:</label>
            <input
              type="text"
              id="reviewer"
              name="reviewer"
              placeholder="후기 글쓴이"
              value={portfolio.reviewer}
              onChange={handlePortfolioChange}
            />
          </p>
          <p className="field">
            <label htmlFor="rep1_img">대표 이미지 1:</label>
            <input
              type="file"
              id="rep1_img"
              name="rep1_img"
              accept="image/*"
              ref={(element) => {
                fileRef.current.image1 = element;
              }}
              onChange={handlePortfolioFileChange(0)}
            />
          </p>
          <p className="field">
            <label htmlFor="rep1_desc">대표 이미지 1 설명</label>
            <input
              type="text"
              id="rep1_desc"
              name="rep1_desc"
              value={portfolioImages[0].description}
              onChange={handlePortfolioDescChange(0)}
            />
          </p>
          <p className="field">
            <label htmlFor="rep2_img">대표 이미지 2:</label>
            <input
              type="file"
              id="rep2_img"
              name="rep2_img"
              accept="image/*"
              ref={(element) => {
                fileRef.current.image2 = element;
              }}
              onChange={handlePortfolioFileChange(1)}
            />
          </p>
          <p className="field">
            <label htmlFor="rep2_desc">대표 이미지 2 설명</label>
            <input
              type="text"
              id="rep2_desc"
              name="rep2_desc"
              value={portfolioImages[1].description}
              onChange={handlePortfolioDescChange(1)}
            />
          </p>
          <p className="field">
            <label htmlFor="thumbnail">썸네일:</label>
            <input
              type="file"
              id="thumbnail"
              name="thumbnail"
              accept="image/*"
              ref={(element) => {
                fileRef.current.thumbnail = element;
              }}
              onChange={handleThumbnailFileChange}
            />
          </p>
          <p className="submit">
            <input type="submit" className="primary-btn" value="등록" />
          </p>
        </form>
      </div>
    </div>
  );
}
