import { getDb } from "./db";
import { galleryImages as galleryImagesTable } from "../drizzle/schema";

const imagesToAdd = [
  {
    imageUrl: "https://scontent-sin6-2.xx.fbcdn.net/v/t39.30808-6/698680109_122100388671318341_5110094117523609717_n.jpg?stp=dst-jpg_tt6&cstp=mx1248x1248&ctp=s160x160&_nc_cat=109&ccb=1-7&_nc_sid=8a6525&_nc_ohc=8UtMmIkjtfoQ7kNvwE2DQvT&_nc_oc=AdpuMmyy8Alz76iuH8H90FdH0HkpNTB8wUs5EJWypVHZLNqlvjbHCyP9nSGvKEunV1I&_nc_zt=23&_nc_ht=scontent-sin6-2.xx&_nc_gid=QYuYkDSKUMB1RkhVn5ybxw&_nc_ss=7b289&oh=00_Af_82yzVdjb_rblPmaTpE4ghLgXlq2EnXae_y3d1XRh5Wg&oe=6A2EA180",
    title: "ديكور داخلي فاخر"
  },
  {
    imageUrl: "https://scontent-sin2-1.xx.fbcdn.net/v/t39.30808-6/699671004_122100388593318341_5358416136478716140_n.jpg?stp=dst-jpg_tt6&cstp=mx1248x1248&ctp=s160x160&_nc_cat=102&ccb=1-7&_nc_sid=8a6525&_nc_ohc=oxjBQs_JRv4Q7kNvwEWSED6&_nc_oc=AdpqSdWYM9LlekKxPv054KTwjjEswDSkNZId6F4uep1HAFPYcNuEaYEKP14rsQtOTGg&_nc_zt=23&_nc_ht=scontent-sin2-1.xx&_nc_gid=QYuYkDSKUMB1RkhVn5ybxw&_nc_ss=7b289&oh=00_Af-xRQk1clJ6fVnTJ-1Kbj3b7i_miuagdCvuNHvCo8X1Lg&oe=6A2EA8CF",
    title: "إضاءة احترافية"
  },
  {
    imageUrl: "https://scontent-sin6-3.xx.fbcdn.net/v/t39.30808-6/699671005_122100388425318341_8704263969649629295_n.jpg?stp=dst-jpg_tt6&cstp=mx1248x1248&ctp=s160x160&_nc_cat=106&ccb=1-7&_nc_sid=8a6525&_nc_ohc=0CS1e0E5c90Q7kNvwHcSHoU&_nc_oc=AdpkBd-_ItWpvUb3nUwV-_iFqppZezGCxjc4eb7bvoudGN3YMvmbLL6w0wbHK4bxpY8&_nc_zt=23&_nc_ht=scontent-sin6-3.xx&_nc_gid=QYuYkDSKUMB1RkhVn5ybxw&_nc_ss=7b289&oh=00_Af_cdYhNZ_Fu3GMpts6srGd3PQUGa9vkaRrOpRuzkTkEDA&oe=6A2EA685",
    title: "تصميم إبداعي حديث"
  },
  {
    imageUrl: "https://scontent-sin2-3.xx.fbcdn.net/v/t39.30808-6/700554688_122100388317318341_4123846515726661098_n.jpg?stp=dst-jpg_tt6&cstp=mx1248x1248&ctp=s160x160&_nc_cat=107&ccb=1-7&_nc_sid=8a6525&_nc_ohc=VlsrAVRRSBcQ7kNvwETD_WP&_nc_oc=Adq_XvAt_DexiCF-1OseeNfENYR15IaIU5BjXKXScBEYPPSS2eBO8oYilx1ubgohN1M&_nc_zt=23&_nc_ht=scontent-sin2-3.xx&_nc_gid=QYuYkDSKUMB1RkhVn5ybxw&_nc_ss=7b289&oh=00_Af-a7jBzq60Isk_HJH9Zpu8E1F16LePdaQreRbFO1pHjdQ&oe=6A2EA5EF",
    title: "ديكور غرفة معيشة"
  },
  {
    imageUrl: "https://scontent-sin6-2.xx.fbcdn.net/v/t39.30808-6/700353909_122100388215318341_7974762264993157050_n.jpg?stp=dst-jpg_tt6&cstp=mx1248x1248&ctp=s160x160&_nc_cat=109&ccb=1-7&_nc_sid=8a6525&_nc_ohc=154upK2u8GkQ7kNvwGi9Gza&_nc_oc=Adod2hlW8EvbMKM2wx6wJD594MDh5GYbXrUrK1cbSLeFPul2BlOF3L9iSCLLvvstdaA&_nc_zt=23&_nc_ht=scontent-sin6-2.xx&_nc_gid=QYuYkDSKUMB1RkhVn5ybxw&_nc_ss=7b289&oh=00_Af-EKU2ookwVvMmDmhifYONfHH7VeRQ-BUt4cY_2Xs_v0A&oe=6A2E9161",
    title: "تصميم حديث فاخر"
  }
];

export async function seedGalleryImages() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    return;
  }

  try {
    for (const image of imagesToAdd) {
      const imageKey = `gallery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await db.insert(galleryImagesTable).values({
        imageUrl: image.imageUrl,
        imageKey: imageKey,
        title: image.title,
        createdAt: new Date(),
      });
    }
    console.log("Gallery images seeded successfully!");
  } catch (error) {
    console.error("Error seeding gallery images:", error);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedGalleryImages().then(() => process.exit(0));
}
