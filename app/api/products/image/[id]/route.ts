import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);
    if (isNaN(numericId)) {
      return NextResponse.json(
        { message: "Invalid product ID" },
        { status: 400 }
      );
    }
    
    // Log for debugging
    console.log(`Fetching image for product ID: ${numericId}`);
    const product = await prisma.product.findUnique({
      where: { id: numericId },
      select: { image: true }
    });

    if (!product) {
      console.log(`Product not found with ID: ${numericId}`);
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }
    
    if (!product.image) {
      console.log(`Image not found for product ID: ${id}`);
      return NextResponse.json(
        { message: "Image not found" },
        { status: 404 }
      );
    }
    
    // Convert Prisma Bytes to Buffer if needed
    let imageBuffer: Buffer;
    if (Buffer.isBuffer(product.image)) {
      imageBuffer = product.image;
    } else if (product.image instanceof Uint8Array) {
      imageBuffer = Buffer.from(product.image);
    } else {
      // Handle any other case - could be a string or other format
      try {
        imageBuffer = Buffer.from(product.image);
      } catch (error) {
        console.error("Error converting image data to buffer:", error);
        return NextResponse.json(
          { message: "Invalid image format" },
          { status: 500 }
        );
      }
    }
    
    // Simple validation to ensure we have image data
    if (!imageBuffer || imageBuffer.length === 0) {
      console.error("Empty image data");
      return NextResponse.json(
        { message: "Empty image data" },
        { status: 500 }
      );
    }
    
    // Detect image type based on magic numbers (first few bytes)
    let contentType = "image/jpeg"; // Default
    if (imageBuffer.length > 4) {
      // Check image signature
      const signature = imageBuffer.slice(0, 4).toString('hex');
      if (signature.startsWith('89504e47')) {
        contentType = 'image/png';
      } else if (signature.startsWith('ffd8ff')) {
        contentType = 'image/jpeg';
      } else if (signature.startsWith('47494638')) {
        contentType = 'image/gif';
      } else if (signature.startsWith('424d')) {
        contentType = 'image/bmp';
      } else if (signature.startsWith('52494646')) {
        contentType = 'image/webp';
      }
      
      console.log(`Image signature: ${signature}, Content-Type: ${contentType}`);
    }
    
    // Return the image as a response with the detected content type
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400" // Cache for 1 day
      }
    });
    
  } catch (error) {
    console.error("Error fetching product image:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: String(error) },
      { status: 500 }
    );
  }
}