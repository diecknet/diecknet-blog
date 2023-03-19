export async function onRequest(context) {
  const comments = await context.env.blog_comments.get("test12345")
  return new Response(comments)
}
