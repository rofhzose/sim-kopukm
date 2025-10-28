import React from "react";
import { SectionCards } from "./card/section-card";
import CardGrafik from "./card/card-grafik";
import { Example } from "./card/card-component";

export default function SectionTwo() {
  return (
    <>
    <div className="relative h-[500px] w-full md:h-[600px] lg:h-[900px]">
        
        <div className="flex px-6">
        <h1 className="text-5xl underline font-bold">
        Data Kabupaten Karawang    
        </h1>
    </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 px-4 pt-10 lg:px-6">
        <SectionCards />
      </div>
      <CardGrafik />
      <div className="flex items-center justify-center">
        <Example/>
      </div>
    </div>
    </>
  );
}
