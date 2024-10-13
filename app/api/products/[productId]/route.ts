import Collection from "@/lib/models/Collection";
import Product from "@/lib/models/Product";
import { connectToDB } from "@/lib/mongoDB";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
    req: NextRequest,
    { params }: { params: { productId: string } }
  ) => {
    try {
      await connectToDB();
  
      const product = await Product.findById(params.productId).populate({ path: "collections", model: Collection })
  
      if (!product) {
        return new NextResponse(
          JSON.stringify({ message: "Không tìm thấy sản phẩm" }),
          { status: 404 }
        );
      }
  
      return NextResponse.json(product, { status: 200 });
    } catch (err) {
      console.log("[productId_GET]", err);
      return new NextResponse("Internal error", { status: 500 });
    }
  }

  export const POST = async (req: NextRequest, { params }: { params: { productId: string }} ) => {
    try {
      const { userId } = auth();
  
      if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
  
      await connectToDB();
  
      const product = await Product.findById(params.productId);
  
      if (!product) {
        return new NextResponse(JSON.stringify({ message: "Không tìm thấy sản phẩm" }), { status: 404 });
      }
  
      const { title, description, media, category, collections, tags, sizes, colors, price, expense } = await req.json();
  
      if (!title || !category || tags.length === 0 || sizes.length === 0 || colors.length === 0 || !price || !expense) {
        return new NextResponse("Không đủ dữ liệu để tạo sản phẩm", { status: 400 });
      }
  
      // Lấy danh sách collection hiện có của sản phẩm
      const currentCollections = product.collections.map((c: any) => c.toString()); // Chuyển ObjectId thành string để so sánh
      const newCollections = collections.filter((collectionId: string) => !currentCollections.includes(collectionId)); // Collection mới cần thêm
      const removedCollections = currentCollections.filter((collectionId: string) => !collections.includes(collectionId)); // Collection cần xóa
  
      // Cập nhật các collections
      await Promise.all([
        // Thêm sản phẩm vào các collection mới
        ...newCollections.map((collectionId: string) =>
          Collection.findByIdAndUpdate(collectionId, {
            $push: { products: product._id },
          })
        ),
  
        // Xóa sản phẩm khỏi các collection bị xóa
        ...removedCollections.map((collectionId: string) =>
          Collection.findByIdAndUpdate(collectionId, {
            $pull: { products: product._id },
          })
        ),
      ]);
  
      // Cập nhật sản phẩm với các collection mới (không bao gồm những collection đã bị xóa)
      const updatedProduct = await Product.findByIdAndUpdate(
        product._id,
        {
          title,
          description,
          media,
          category,
          collections: collections, // Cập nhật với các collection mới (không bao gồm các collection bị xóa)
          tags,
          sizes,
          colors,
          price,
          expense,
        },
        { new: true }
      ).populate({ path: "collections", model: Collection });
  
      await updatedProduct.save();
  
      return NextResponse.json(updatedProduct, { status: 200 });
    } catch (err) {
      console.log("[productId_POST]", err);
      return new NextResponse("Internal error", { status: 500 });
    }
  };
  
  

export const DELETE = async (
  req: NextRequest,
  { params }: { params: { productId: string } }
) => {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDB();

    const product = await Product.findById(params.productId);

    if (!product) {
      return new NextResponse(
        JSON.stringify({ message: "Không tìm thấy sản phẩm" }),
        { status: 404 }
      );
    }

    await Product.findByIdAndDelete(product._id);

    // Update collections
    await Promise.all(
      product.collections.map((collectionId: string) =>
        Collection.findByIdAndUpdate(collectionId, {
          $pull: { products: product._id },
        })
      )
    );

    return new NextResponse(JSON.stringify({ message: "Đã xóa sản phẩm" }), {
      status: 200,
    });
  } catch (err) {
    console.log("[productId_DELETE]", err);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export const dynamic = "force-dynamic";
  