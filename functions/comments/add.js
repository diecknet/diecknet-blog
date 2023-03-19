export async function onRequestPost(context) {
    const formData = await context.request.formData()
    
    context.env.blog_comments.put("test12345",
    `{
        'name'='${formData.get("name")}',
        'comment'='${formData.get("comment")}',
        'date'='${new Date().toISOString()}',
        'moderation'=0
    }`)
    
    return new Response("thanks for the post\r\nformdata:"+formData.get("name"))
}

export async function onRequest(context) {
    return new Response("not allowed")
}

/*
idea:

Key prefix "slug"
then colon
then either "published" or "queue"
then optional colon (if queue) with a random string

*/