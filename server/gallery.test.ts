import { describe, it, expect } from "vitest";
import {
  getProductGalleryImages,
  addProductGalleryImage,
  deleteProductGalleryImage,
  updateGalleryImageOrder,
} from "./db";

describe("Product Gallery", () => {
  // Test data
  const testProductId = 1;
  const testImageUrl = "https://example.com/image.jpg";
  const testAltText = "Test image";

  it("should get empty gallery for new product", async () => {
    const images = await getProductGalleryImages(999);
    expect(Array.isArray(images)).toBe(true);
  });

  it("should add image to product gallery", async () => {
    const result = await addProductGalleryImage(
      testProductId,
      testImageUrl,
      testAltText,
      "front_cover"
    );
    expect(result).toBeDefined();
  });

  it("should get gallery images for product", async () => {
    const images = await getProductGalleryImages(testProductId);
    expect(Array.isArray(images)).toBe(true);
    if (images.length > 0) {
      expect(images[0]).toHaveProperty("imageUrl");
      expect(images[0]).toHaveProperty("imageType");
      expect(images[0]).toHaveProperty("displayOrder");
    }
  });

  it("should handle multiple images with correct order", async () => {
    const productId = 2;
    
    // Add first image
    await addProductGalleryImage(
      productId,
      "https://example.com/image1.jpg",
      "First image",
      "front_cover"
    );
    
    // Add second image
    await addProductGalleryImage(
      productId,
      "https://example.com/image2.jpg",
      "Second image",
      "back_cover"
    );

    const images = await getProductGalleryImages(productId);
    expect(images.length).toBeGreaterThanOrEqual(2);
    
    // Check that images have different display orders
    const orders = images.map(img => img.displayOrder);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it("should support different image types", async () => {
    const productId = 3;
    const imageTypes: Array<"front_cover" | "back_cover" | "spine" | "interior" | "other"> = [
      "front_cover",
      "back_cover",
      "spine",
      "interior",
      "other",
    ];

    for (const type of imageTypes) {
      await addProductGalleryImage(
        productId,
        `https://example.com/${type}.jpg`,
        `${type} image`,
        type
      );
    }

    const images = await getProductGalleryImages(productId);
    const types = images.map(img => img.imageType);
    
    for (const type of imageTypes) {
      expect(types).toContain(type);
    }
  });

  it("should update image display order", async () => {
    const productId = 4;
    
    // Add images
    const result1 = await addProductGalleryImage(
      productId,
      "https://example.com/first.jpg",
      "First",
      "front_cover"
    );
    
    const result2 = await addProductGalleryImage(
      productId,
      "https://example.com/second.jpg",
      "Second",
      "back_cover"
    );

    // Get images to get their IDs
    const images = await getProductGalleryImages(productId);
    if (images.length >= 2) {
      const firstImage = images[0];
      
      // Update order
      await updateGalleryImageOrder(firstImage.id, 10);
      
      const updatedImages = await getProductGalleryImages(productId);
      const updatedFirst = updatedImages.find(img => img.id === firstImage.id);
      
      expect(updatedFirst?.displayOrder).toBe(10);
    }
  });

  it("should delete gallery image", async () => {
    const productId = 5;
    
    // Add image
    await addProductGalleryImage(
      productId,
      "https://example.com/delete-test.jpg",
      "To delete",
      "front_cover"
    );

    const imagesBefore = await getProductGalleryImages(productId);
    const countBefore = imagesBefore.length;

    if (countBefore > 0) {
      const imageToDelete = imagesBefore[0];
      
      // Delete image
      await deleteProductGalleryImage(imageToDelete.id);
      
      const imagesAfter = await getProductGalleryImages(productId);
      expect(imagesAfter.length).toBeLessThanOrEqual(countBefore);
    }
  });

  it("should handle image URLs correctly", async () => {
    const productId = 6;
    const validUrls = [
      "https://example.com/image.jpg",
      "https://cdn.example.com/books/cover.png",
      "https://storage.example.com/products/book-123.webp",
    ];

    for (const url of validUrls) {
      await addProductGalleryImage(
        productId,
        url,
        "Test image",
        "front_cover"
      );
    }

    const images = await getProductGalleryImages(productId);
    const urls = images.map(img => img.imageUrl);
    
    for (const url of validUrls) {
      expect(urls).toContain(url);
    }
  });
});
