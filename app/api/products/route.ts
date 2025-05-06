import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";


export async function GET(req: Request) {
  try {
    // First fetch all products
    const productsWithImage = await prisma.product.findMany();
    
    // Then create a clean version without the image data
    const cleanProducts = productsWithImage.map(product => {
      // Extract all fields except 'image'
      const { image, ...productWithoutImage } = product;
      
      // Add imageUrl property if the product has an image
      return {
        ...productWithoutImage,
        imageUrl: image ? `/api/products/image/${product.id}` : null
      };
    });
    
    return NextResponse.json(cleanProducts, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  console.log("Received POST request to create product");
  
  try {
    // Next.js App Router uses FormData for multipart/form-data requests
    const formData = await req.formData();
    
    // Extract fields from formData
    const name = formData.get('name') as string;
    const price = formData.get('price') as string;
    const stock = formData.get('stock') as string;
    const description = formData.get('description') as string;
    const imageFile = formData.get('image') as File | null;
    
    console.log("Form Data:", { 
      name, 
      price, 
      stock, 
      description, 
      hasImage: !!imageFile,
      imageType: imageFile?.type 
    });
    
    // Validate required fields
    if (!name || !price || !stock) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }
    
    let imageBuffer: Buffer | null = null;
    
    // Process the image if it exists
    if (imageFile && imageFile.size > 0) {
      try {
        // Convert File to Buffer
        const arrayBuffer = await imageFile.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuffer);
        console.log(`Image processed: ${imageBuffer.length} bytes`);
      } catch (err) {
        console.error("Error processing image:", err);
        return NextResponse.json(
          { message: "Error processing image" },
          { status: 400 }
        );
      }
    }
    
    // Create the product in the database
    const newProduct = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        stock: parseInt(stock),
        description: description || null, // Handle optional field
        image: imageBuffer, // Store image as BLOB in database
      },
    });
    
    // Return success response without the raw image data
    const { image, ...productWithoutImage } = newProduct;
    
    return NextResponse.json({
      message: "Product created successfully",
      product: {
        ...productWithoutImage,
        imageUrl: image ? `/api/products/image/${newProduct.id}` : null,
      },
    }, { status: 201 });
    
  } catch (error) {
    console.error("[POST Create] Error:", error);
    return NextResponse.json({ message: "Error creating product" }, { status: 500 });
  }
}

// No need for config export in App Router, body parser is automatically handled