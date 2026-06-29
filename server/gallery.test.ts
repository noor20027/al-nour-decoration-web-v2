import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { addGalleryImage, getAllGalleryImages, deleteGalleryImage } from "./db";

describe("Gallery Functions", () => {
  const testImageKey = `test_${Date.now()}_image.jpg`;
  const testImageUrl = "/manus-storage/test_image.jpg";

  beforeAll(async () => {
    // Clean up any existing test images
    try {
      await deleteGalleryImage(testImageKey);
    } catch (err) {
      // Ignore if image doesn't exist
    }
  });

  afterAll(async () => {
    // Clean up test image
    try {
      await deleteGalleryImage(testImageKey);
    } catch (err) {
      // Ignore if image doesn't exist
    }
  });

  it("should add a gallery image", async () => {
    await addGalleryImage(
      testImageUrl,
      testImageKey,
      "Test Image",
      "Test Description",
      "horizontal",
      "yes"
    );

    const images = await getAllGalleryImages();
    const addedImage = images.find((img) => img.imageKey === testImageKey);

    expect(addedImage).toBeDefined();
    expect(addedImage?.title).toBe("Test Image");
    expect(addedImage?.description).toBe("Test Description");
    expect(addedImage?.orientation).toBe("horizontal");
    expect(addedImage?.isCarousel).toBe("yes");
  });

  it("should retrieve all gallery images", async () => {
    const images = await getAllGalleryImages();
    expect(Array.isArray(images)).toBe(true);
  });

  it("should delete a gallery image", async () => {
    // First add an image
    const deleteTestKey = `delete_test_${Date.now()}_image.jpg`;
    await addGalleryImage(
      "/manus-storage/delete_test.jpg",
      deleteTestKey,
      "Delete Test"
    );

    // Then delete it
    await deleteGalleryImage(deleteTestKey);

    // Verify it's deleted
    const images = await getAllGalleryImages();
    const deletedImage = images.find((img) => img.imageKey === deleteTestKey);
    expect(deletedImage).toBeUndefined();
  });
});
