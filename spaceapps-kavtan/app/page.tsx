"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Stars } from "@react-three/drei";
import Link from "next/link";
import { Suspense, useEffect, useState, useRef } from "react";
import StarryBackground from './StarryBackground';
import "./globals.css";

function EarthModel({ scale }) {
  const earthRef = useRef();
  const { scene } = useGLTF("/glb/earth_model.glb");

  useFrame((state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <primitive
      ref={earthRef}
      object={scene}
      scale={scale * 0.5} // Reduce the scale to make the Earth appear smaller
      position={[0, 0, 0]}
    />
  );
}

function CameraAdjuster() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0, -300); // Move the camera further back
    camera.fov = 30; // Reduce the field of view to zoom out
    camera.updateProjectionMatrix();
  }, [camera]);

  return null;
}

export default function Home() {
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScale(Math.max(0.5, 1 - scrollY / 1000));
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="relative">
      <StarryBackground />
      <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-transparent text-white">
        <header className="text-center mb-8">
          <img src="/logo2.png" alt="Team Kavtan Logo" className="h-12 mb-4" />
          <h1 className="text-6xl sm:text-8xl font-extrabold tracking-wide">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">GHG</span>
            <span> by Team Kavtan</span>
          </h1>
        </header>

        <main className="relative flex flex-col items-center justify-center w-full">
          <div className="earth-container w-full h-[60vh] sm:h-[80vh]"> {/* Increased height for better visibility */}
            <Canvas>
              <Suspense fallback={null}>
                <CameraAdjuster />
                <ambientLight intensity={5.5} />
                <pointLight position={[10, 10, 100]} intensity={5.5} />
                <OrbitControls enableZoom={true} />
                <EarthModel scale={scale} />
                <Stars
                  radius={200} // Increased radius to match the zoomed out view
                  depth={100}
                  count={8000} // Increased star count for a more immersive experience
                  factor={7}
                  saturation={0}
                  fade={true}
                  speed={0.5}
                />
              </Suspense>
            </Canvas>
          </div>

          {/* Rest of the component remains unchanged */}
        </main>

        <footer className="flex gap-6 flex-wrap items-center justify-center text-md mt-8 p-4">
          <span>Team Kavtan</span>
          <img src="/logo2.png" alt="Team Kavtan Logo" className="h-10 w-auto" />
          <nav>
            <ul className="flex gap-4">
              <li>
                <a
                  href="https://github.com/Vinamra-21/Nasa-Spaceapps-Challenge"
                  className="text-blue-500"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </nav>
        </footer>
      </div>
    </div>
  );
}

// Preload the GLB model
useGLTF.preload("/glb/earth_model.glb");