import Image from "next/image";
import { createClient } from "@/utils/supabase/client";

export default function Home({ data }) {
  const supabase = createClient();

  const getPublicURL = (path) => {
    if (!path) return "";
    const { data: publicUrlData } = supabase.storage.from("portfolio").getPublicUrl(path);
    return publicUrlData.publicUrl;
  };

  return (
    <div className="latest_portfolio">
      <div className="row intro">
        <div className="col-md-4">
          <div className="contents shadow">
            <h2 className="heading2">I’m alikerock</h2>
          </div>
        </div>
        <div className="col-md-4">
          <div className="contents shadow">
            <h2 className="heading2">I create super awesome stuff</h2>
          </div>
        </div>
        <div className="col-md-4">
          <div className="contents shadow">
            <h2 className="heading2">I’m available for freelance projects</h2>
          </div>
        </div>
      </div>
      <div className="row list">
        {data.map((item) => (
          <div className="col-md-4" key={item.id}>
            <div className="contents shadow">
              {item.thumbnail && (
                <Image
                  src={getPublicURL(item.thumbnail)}
                  width={364}
                  height={209}
                  alt={item.title}
                />
              )}
              <div className="hover_contents">
                <div className="list_info">
                  <h3>
                    <a href={`/portfolio/${item.id}`}>{item.title}</a>
                    <Image
                      src="/images/portfolio_list_arrow.png"
                      width={6}
                      height={8}
                      alt="list arrow"
                    />
                  </h3>
                  <p>
                    <a href="">Click to see project</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="porfolio_readmore">
        <a href="" className="primary-btn">
          See my full portfolio
        </a>
      </p>
    </div>
  );
}
