import { prisma } from "@/lib/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const movies = await prisma.movie.findMany();
  return NextResponse.json(movies);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  let [year, month, day] = data.premiere.split("-");

  const movie = await prisma.movie.create({data: {
          image: data.image,
          title: data.title,
          genre: data.genre,
          description: data.description,
          duration: data.duration,
          premiere: new Date(Number(year), Number(month), Number(day)),
          year: data.year,
          actors: data.actors,
  }});

  return NextResponse.json(movie);
}

export async function DELETE(req: NextRequest) {
  const data = await req.json();

  const movie = await prisma.movie.delete({
    where: {
      id: data.id,
    },
  });

  return NextResponse.json(movie);
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  let [year, month, day] = data.premiere.split("-");

  const movie = await prisma.movie.update({data: {
          image: data.image,
          title: data.title,
          genre: data.genre,
          description: data.description,
          duration: data.duration,
          premiere: new Date(Number(year), Number(month), Number(day)),
          year: data.year,
          actors: data.actors,
  },
    where: {
      id: data.id,
    }});

  return NextResponse.json(movie);
}
