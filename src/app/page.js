import { createClient } from "@/utils/supabase/client";
import Home from "./components/Home";

export default async function Page() {
  const supabase = await createClient();
  const { data: projects, error } = await supabase
    .from("portfolio")
    .select()
    .limit(3)
    .order("created_at", { ascending: false });
  console.log(projects);

  if (error) {
    console.error("연결실패", error);
    return <div>프로젝트 로드 실패</div>;
  }

  return (
    <>
      <Home data={projects} />
    </>
  );
}
