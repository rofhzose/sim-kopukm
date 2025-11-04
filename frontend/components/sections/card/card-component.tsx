// "use client"
// import Image from "next/image";
// import { useState } from "react";
// import {
//   motion,
//   useMotionValue,
//   useTransform,
//   AnimatePresence,
// } from "framer-motion";

// function Card(props: any) {
//   const [exitX, setExitX] = useState(0);
//   const x = useMotionValue(0);
//   const scale = useTransform(x, [-150, 0, 150], [0.5, 1, 0.5]);
//   const rotate = useTransform(x, [-150, 0, 150], [-45, 0, 45], { clamp: false });

//   const variantsFrontCard = {
//     animate: { scale: 1, y: 0, opacity: 1 },
//     exit: (custom: number) => ({
//       x: custom,
//       opacity: 0,
//       scale: 0.5,
//       transition: { duration: 0.2 },
//     }),
//   };
//   const variantsBackCard = {
//     initial: { scale: 0, y: 105, opacity: 0 },
//     animate: { scale: 0.75, y: 30, opacity: 0.5 },
//   };

//   function handleDragEnd(_: any, info: any) {
//     if (info.offset.x < -100) {
//       setExitX(-250);
//       props.setIndex(props.index + 1);
//     }
//     if (info.offset.x > 100) {
//       setExitX(250);
//       props.setIndex(props.index + 1);
//     }
//   }

//   return (
//     <motion.div
//       style={{
//         width: 150,
//         height: 150,
//         position: "absolute",
//         top: 0,
//         x,
//         rotate,
//         cursor: "grab",
//       }}
//       whileTap={{ cursor: "grabbing" }}
//       drag={props.drag}
//       dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
//       onDragEnd={handleDragEnd}
//       variants={props.frontCard ? variantsFrontCard : variantsBackCard}
//       initial="initial"
//       animate="animate"
//       exit="exit"
//       custom={exitX}
//       transition={
//         props.frontCard
//           ? { type: "spring", stiffness: 300, damping: 20 }
//           : { scale: { duration: 0.2 }, opacity: { duration: 0.4 } }
//       }
//     >
//       <motion.div style={{ width: 150, height: 150, scale, borderRadius: 30, overflow: "hidden" }}>
//         <Image
//           src={props.image}   // ← Pass the image path from props
//           alt="Card image"
//           fill
//           style={{ objectFit: "cover",pointerEvents: "none" }}
//         />
//       </motion.div>
//     </motion.div>
//   );
// }

// export function Example() {
//   const [index, setIndex] = useState(0);

//   // Replace with your own images
//   const images = ["/umkm/umkm1.jpg", "/umkm/umkm2.jpg", "/umkm/umkm3.jpg"];

//   return (
//     <motion.div style={{ width: 150, height: 150, position: "relative" }}>
//       <AnimatePresence initial={false}>
//         <Card key={index + 1} frontCard={false} image={images[(index + 1) % images.length]} />
//         <Card
//           key={index}
//           frontCard={true}
//           index={index}
//           setIndex={setIndex}
//           drag="x"
//           image={images[index % images.length]}
//         />
//       </AnimatePresence>
//     </motion.div>
//   );
// }

"use client";
import Image from "next/image";
import { useState } from "react";

function Card({ image }: { image: string }) {
  return (
    <div
      style={{
        width: 150,
        height: 150,
        position: "absolute",
        top: 0,
        borderRadius: 30,
        overflow: "hidden",
      }}
    >
      <Image
        src={image}
        alt="Card image"
        fill
        style={{ objectFit: "cover", pointerEvents: "none" }}
      />
    </div>
  );
}

export function Example() {
  const [index, setIndex] = useState(0);

  // Gambar bisa kamu ganti sesuai folder public/
  const images = ["/umkm/umkm1.jpg", "/umkm/umkm2.jpg", "/umkm/umkm3.jpg"];

  // Auto switch tiap 3 detik (biar tetap hidup tanpa motion)
  // Bisa dihapus kalau gak mau auto ganti
  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setIndex((prev) => (prev + 1) % images.length);
  //   }, 3000);
  //   return () => clearInterval(timer);
  // }, []);

  return (
    <div
      style={{
        width: 150,
        height: 150,
        position: "relative",
      }}
      className="rounded-2xl shadow-md overflow-hidden"
    >
      <Card image={images[index]} />
    </div>
  );
}
