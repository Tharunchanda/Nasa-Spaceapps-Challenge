"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Stars } from "@react-three/drei";
import Link from "next/link";
import { Suspense, useEffect, useState, useRef } from "react";
import "./globals.css"

// Earth model component
function EarthModel({ scale }) {
  const earthRef = useRef();
  const { scene } = useGLTF("/glb/earth_model.glb");
  
  useFrame((state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.1; // Slow rotation
    }
  });

  return <primitive ref={earthRef} object={scene} scale={scale} position={[0, 0, 0]} />;
}

function CameraAdjuster() {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.z = 35;
    camera.fov = 30; // Adjusted field of view
    camera.updateProjectionMatrix();
  }, [camera]);

  return null;
}

export default function Home() {
  const [scale, setScale] = useState(.5); 

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScale(Math.max(0.5, 1 - scrollY / 1000)); // Adjusted scaling factor
    };

    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gray-900 text-white">
      <header className="text-center mb-8">
        <h1 className="text-6xl sm:text-8xl font-extrabold tracking-wide">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
            GHG
          </span>
          <span> by Team Kavtan</span>
        </h1>
      </header>

      <main className="relative flex flex-col items-center justify-center w-full">
        <div className="earth-container w-full h-[50vh] sm:h-[70vh]">
          <Canvas>
            <Suspense fallback={null}>
              <CameraAdjuster />
              <ambientLight intensity={1} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              <OrbitControls enableZoom={true} />
              <EarthModel scale={scale} />
            </Suspense>
          </Canvas>
        </div>

        <div className="flex flex-col sm:flex-row gap-8 items-center justify-center mt-8">
          <Link href="/OurInsights">
            <button className="text-white font-bold py-4 px-8 rounded-lg text-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg transition-transform transform hover:scale-105">
              Our Insights
            </button>
          </Link>

          <Link href="/GetYourOwnInsights">
            <button className="text-white font-bold py-4 px-8 rounded-lg text-xl bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 shadow-lg transition-transform transform hover:scale-105">
              Your Insights
            </button>
          </Link>
        </div>
      </main>

      <footer className="flex gap-6 flex-wrap items-center justify-center text-md mt-8">
        <span>Team Kavtan</span>
      </footer>
    </div>
  );
}

// Preload the GLB model
useGLTF.preload("/glb/earth_model.glb");