// @deno-types="npm:@types/node"
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import * as cheerio from "npm:cheerio";

serve(async () => {
  const blogUrl = "https://wiseworx.com.au/blog";
  const res = await fetch(blogUrl);
  const html = await res.text();
  const $ = cheerio.load(html);

  const posts = [];

  $(".elementor-post").each((_, el) => {
    const title = $(el).find(".elementor-post__title").text().trim();
    const summary = $(el).find(".elementor-post__excerpt").text().trim();
    const link = $(el).find("a").attr("href");
    if (title && link) {
      posts.push({ title, summary, link });
    }
  });

  // Send to Supabase
  const supabaseRes = await fetch(
    "https://YOUR_PROJECT_ID.supabase.co/rest/v1/posts",
    {
      method: "POST",
      headers: {
        apikey: "YOUR_ANON_KEY",
        Authorization: "Bearer YOUR_ANON_KEY",
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates"
      },
      body: JSON.stringify(posts)
    }
  );

  const result = await supabaseRes.json();
  return new Response(JSON.stringify({ status: "uploaded", result }), {
    headers: { "Content-Type": "application/json" }
  });
});
