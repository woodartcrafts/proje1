import { notFound, redirect } from "next/navigation";
import { PostForm } from "@/components/admin/PostForm";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPostExtras } from "@/lib/posts";
import { getPostViewCount } from "@/lib/post-views";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditPostPage({ params }: Props) {
  const session = await getSession();
  if (!session) redirect("/admin/giris");

  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) notFound();
  const [extras, views] = await Promise.all([
    getPostExtras(post.id),
    getPostViewCount(post.id),
  ]);

  return (
    <>
      <div className="admin-top">
        <h2>Yazıyı Düzenle</h2>
      </div>
      <div className="admin-panel" style={{ maxWidth: 760 }}>
        <p className="form-hint" style={{ marginTop: 0 }}>
          Görüntülenme: <strong>{views.toLocaleString("tr-TR")}</strong>
          {" · "}
          Aynı tarayıcı ~6 saat içinde tekrar sayılmaz; botlar genelde dahil
          edilmez. Google Analytics değildir.
        </p>
        <PostForm
          mode="edit"
          postId={post.id}
          defaults={{
            title: post.title,
            excerpt: post.excerpt,
            content: post.content,
            published: post.published,
            slug: post.slug,
            seoTitle: extras.seoTitle,
            seoDescription: extras.seoDescription,
            authorName: extras.authorName,
          }}
        />
      </div>
    </>
  );
}
