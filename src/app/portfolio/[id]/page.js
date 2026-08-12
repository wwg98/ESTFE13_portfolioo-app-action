import { createClient } from "@/utils/supabase/client";
import Image from "next/image";

export async function generateStaticParams() {
  const supabase = createClient();
  const { data, error } = await supabase.from("portfolio").select("id");

  return data.map((row) => ({
    id: String(row.id),
  }));
}

export default async function Portfolio({ params }) {
  const supabase = createClient();
  const { id } = await params;

  const { data: current, error } = await supabase
    .from("portfolio")
    .select(
      `*,
      portfolio_images(
      id,
      image_url,
      description,
      display_order
      )
    `,
    )
    .eq("id", id)
    .order("display_order", { referencedTable: "portfolio_images", ascending: true })
    .single();

  //이전글 id, title 조회
  const { data: prev } = await supabase
    .from("portfolio")
    .select("id,title")
    .lt("id", id)
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  //다음글 id, title 조회
  const { data: next } = await supabase
    .from("portfolio")
    .select("id,title")
    .gt("id", id)
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  // console.log("prev" + prev);
  // console.log("next" + next);
  // console.log(current);

  const getPublicURL = (path) => {
    if (!path) return "";
    const { data: publicUrlData } = supabase.storage.from("portfolio").getPublicUrl(path);
    return publicUrlData.publicUrl;
  };

  const portfolioImages = current.portfolio_images ?? [];

  return (
    <div className="portoflio-single">
      <div className="row">
        <div className="col-md-8 decription">
          {portfolioImages.length > 0 ? (
            portfolioImages.map((image, idx) => (
              <div key={idx} className="contents shadow">
                <Image
                  src={getPublicURL(image.image_url)}
                  alt={image.description}
                  width={762}
                  height={504}
                  style={{ width: "100%", height: "auto" }}
                  loading="eager"
                />
                <p>{image.description}</p>
              </div>
            ))
          ) : (
            <div className="contents shadow">대표 이미지가 없습니다.</div>
          )}
        </div>
        <div className="col-md-4 portfolio_info">
          <div className="contents shadow">
            <h2>{current?.title ?? "Project Title"}</h2>
            <div>{current?.content ?? ""}</div>
            <p className="link">
              <a href={current?.url ?? ""}>Visit site &rarr;</a>
            </p>
            <hr className="double" />
            <blockquote>
              <p>{current?.review ?? ""}</p>
              <small>- {current?.reviewer ?? ""} -</small>
            </blockquote>
            <p className="nav">
              {prev && (
                <a href={`/portfolio/${prev.id}`} className="secondary-btn">
                  &larr; {prev.title}
                </a>
              )}
              {next && (
                <a href={`/portfolio/${next.id}`} className="secondary-btn">
                  {next.title} &rarr;
                </a>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
