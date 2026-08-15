
const { get } = require('@vercel/blob');

async function test() {
  console.log("Testing get() with access: private, useCache: false...");
  try {
    const result = await get('db/state.json', {
      access: "private",
      useCache: false,
    });
    console.log("Result keys:", Object.keys(result));
    console.log("hasBody:", !!result.body);
    console.log("hasBlob:", !!result.blob);
    console.log("type:", result.type);
    
    if (result.body) {
      // Read body as text
      const chunks = [];
      for await (const chunk of result.body) {
        chunks.push(Buffer.from(chunk));
      }
      const text = Buffer.concat(chunks).toString();
      const data = JSON.parse(text);
      console.log("galleryImages:", data.galleryImages?.length || 0);
      console.log("branding:", Object.keys(data.branding || {}));
    }
  } catch (e) {
    console.log("Error:", e.message);
  }
}

test();
