import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { connectToDB } from "@/lib/mongoDB";
import Product from "@/lib/models/Product";
import Collection from "@/lib/models/Collection";

export const POST = async (req: NextRequest) =>{
    try {
      const { userId } = auth()

      if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
      }

      await connectToDB()

      const { title, description, media, category, collections, tags, sizes, colors, price, expense } = await req.json();

      if (!title || !category || collections.length === 0 || tags.length === 0 || sizes.length === 0 || colors.length === 0 || !price || !expense) {
        console.log("Dữ liệu không đủ:", { title, category, collections, tags, sizes, colors, price, expense });
        return new NextResponse("Không đủ dữ liệu để tạo sản phẩm", { status: 400});
      }

      const newProduct = await Product.create({
        title,
        description,
        media,
        category,
        collections,
        tags,
        sizes,
        colors,
        price,
        expense,
      });

      await newProduct.save();

      return NextResponse.json(newProduct, { status: 200 });
      
    } catch (err) {
        console.log("products_POST", err);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export const GET = async (req: NextRequest) => {
  try {
    await connectToDB();

    const products = await Product.find()
      .sort({ createAt: "desc"})
      .populate({ path: "collections", model: Collection});

    return NextResponse.json(products, { status: 200 });
  } catch (err) {
    console.log("[products_GET]", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
};