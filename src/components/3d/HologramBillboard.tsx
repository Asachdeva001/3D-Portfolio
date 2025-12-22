"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Html } from "@react-three/drei";
import * as THREE from "three";
import { createHologramMaterial } from "@/components/shaders/NeonShader";
import { portfolioData } from "@/data/portfolioData";
import { useSceneStore } from "@/store/sceneStore";

interface HologramBillboardProps {
  position: [number, number, number];
  content: {
    type: "project" | "skill" | "contact" | "about";
    data: any;
  };
  size?: [number, number];
  color?: string;
}

export default function HologramBillboard({
  position,
  content,
  size = [4, 3],
  color = "#00ffff",
}: HologramBillboardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);
  const { performance } = useSceneStore();

  // Create hologram material
  const hologramMaterial = useMemo(() => {
    return createHologramMaterial({
      color,
      opacity: 0.7,
      scanlineSpeed: 5.0,
      glitchIntensity: 0.1,
    });
  }, [color]);

  // Animate the billboard
  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (groupRef.current) {
      // Floating animation
      groupRef.current.position.y = position[1] + Math.sin(time * 0.5) * 0.2;

      // Gentle rotation
      groupRef.current.rotation.y = Math.sin(time * 0.3) * 0.1;

      // Scale based on hover state
      const targetScale = hovered ? 1.1 : 1.0;
      groupRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }
  });

  const renderContent = () => {
    switch (content.type) {
      case "project":
        return (
          <Html
            transform
            occlude
            position={[0, 0, 0.1]}
            style={{
              width: "300px",
              height: "200px",
              background: "rgba(0, 255, 255, 0.1)",
              border: "1px solid #00ffff",
              borderRadius: "8px",
              padding: "16px",
              color: "#00ffff",
              fontFamily: "monospace",
              fontSize: "12px",
              backdropFilter: "blur(10px)",
              pointerEvents: active ? "auto" : "none",
            }}
          >
            <div>
              <h3
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "14px",
                  color: "#ff0080",
                }}
              >
                {content.data.title}
              </h3>
              <p
                style={{ margin: "0 0 8px 0", fontSize: "10px", opacity: 0.8 }}
              >
                {content.data.description}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {content.data.technologies?.map(
                  (tech: string, index: number) => (
                    <span
                      key={index}
                      style={{
                        background: "rgba(255, 0, 128, 0.2)",
                        border: "1px solid #ff0080",
                        borderRadius: "4px",
                        padding: "2px 6px",
                        fontSize: "8px",
                      }}
                    >
                      {tech}
                    </span>
                  )
                )}
              </div>
              {content.data.link && (
                <a
                  href={content.data.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    marginTop: "8px",
                    color: "#00ffff",
                    textDecoration: "none",
                    fontSize: "10px",
                    border: "1px solid #00ffff",
                    padding: "4px 8px",
                    borderRadius: "4px",
                  }}
                >
                  View Project →
                </a>
              )}
            </div>
          </Html>
        );

      case "skill":
        return (
          <Html
            transform
            occlude
            position={[0, 0, 0.1]}
            style={{
              width: "250px",
              height: "150px",
              background: "rgba(128, 0, 255, 0.1)",
              border: "1px solid #8000ff",
              borderRadius: "8px",
              padding: "16px",
              color: "#8000ff",
              fontFamily: "monospace",
              fontSize: "12px",
              backdropFilter: "blur(10px)",
              pointerEvents: active ? "auto" : "none",
            }}
          >
            <div>
              <h3
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "14px",
                  color: "#ff8000",
                }}
              >
                {content.data.category}
              </h3>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                {content.data.skills?.map((skill: any, index: number) => (
                  <div
                    key={index}
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ fontSize: "10px" }}>{skill.name}</span>
                    <div
                      style={{
                        width: "60px",
                        height: "4px",
                        background: "rgba(128, 0, 255, 0.3)",
                        borderRadius: "2px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${skill.level}%`,
                          height: "100%",
                          background: "#8000ff",
                          borderRadius: "2px",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Html>
        );

      case "contact":
        return (
          <Html
            transform
            occlude
            position={[0, 0, 0.1]}
            style={{
              width: "280px",
              height: "180px",
              background: "rgba(255, 128, 0, 0.1)",
              border: "1px solid #ff8000",
              borderRadius: "8px",
              padding: "16px",
              color: "#ff8000",
              fontFamily: "monospace",
              fontSize: "12px",
              backdropFilter: "blur(10px)",
              pointerEvents: active ? "auto" : "none",
            }}
          >
            <div>
              <h3
                style={{
                  margin: "0 0 12px 0",
                  fontSize: "14px",
                  color: "#00ff80",
                }}
              >
                Contact Information
              </h3>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <div>
                  <span style={{ opacity: 0.7 }}>Email:</span>
                  <br />
                  <a
                    href={`mailto:${content.data.email}`}
                    style={{ color: "#ff8000", textDecoration: "none" }}
                  >
                    {content.data.email}
                  </a>
                </div>
                <div>
                  <span style={{ opacity: 0.7 }}>Location:</span>
                  <br />
                  <span>{content.data.location}</span>
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  {content.data.social?.map((link: any, index: number) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#ff8000",
                        textDecoration: "none",
                        fontSize: "10px",
                        border: "1px solid #ff8000",
                        padding: "4px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      {link.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </Html>
        );

      case "about":
        return (
          <Html
            transform
            occlude
            position={[0, 0, 0.1]}
            style={{
              width: "320px",
              height: "220px",
              background: "rgba(0, 255, 128, 0.1)",
              border: "1px solid #00ff80",
              borderRadius: "8px",
              padding: "16px",
              color: "#00ff80",
              fontFamily: "monospace",
              fontSize: "12px",
              backdropFilter: "blur(10px)",
              pointerEvents: active ? "auto" : "none",
            }}
          >
            <div>
              <h3
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "16px",
                  color: "#ff0080",
                }}
              >
                {content.data.name}
              </h3>
              <p
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "12px",
                  color: "#00ffff",
                }}
              >
                {content.data.title}
              </p>
              <p
                style={{
                  margin: "0 0 12px 0",
                  fontSize: "10px",
                  opacity: 0.8,
                  lineHeight: "1.4",
                }}
              >
                {content.data.bio}
              </p>
              <div>
                <span style={{ fontSize: "10px", opacity: 0.7 }}>
                  Experience:
                </span>
                <br />
                <span style={{ fontSize: "12px" }}>
                  {content.data.experience} years
                </span>
              </div>
            </div>
          </Html>
        );

      default:
        return null;
    }
  };

  return (
    <group
      ref={groupRef}
      position={[position[0], position[1], position[2]]}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onClick={() => setActive(!active)}
    >
      {/* Hologram frame */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <planeGeometry args={size} />
        <primitive object={hologramMaterial} />
      </mesh>

      {/* Border frame */}
      <lineSegments position={[0, 0, 0.01]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(...size)]} />
        <lineBasicMaterial color={color} transparent opacity={0.8} />
      </lineSegments>

      {/* Corner decorations */}
      {[
        [-size[0] / 2, size[1] / 2, 0.02],
        [size[0] / 2, size[1] / 2, 0.02],
        [-size[0] / 2, -size[1] / 2, 0.02],
        [size[0] / 2, -size[1] / 2, 0.02],
      ].map((pos, index) => (
        <mesh key={index} position={pos as [number, number, number]}>
          <boxGeometry args={[0.2, 0.2, 0.02]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} />
        </mesh>
      ))}

      {/* Content */}
      {renderContent()}

      {/* Interaction indicator */}
      {hovered && (
        <Text
          position={[0, -size[1] / 2 - 0.5, 0]}
          fontSize={0.3}
          color={color}
          anchorX="center"
          anchorY="middle"
        >
          {active ? "CLICK TO CLOSE" : "CLICK TO EXPAND"}
        </Text>
      )}

      {/* Ambient glow */}
      <pointLight
        position={[0, 0, 0.5]}
        intensity={hovered ? 0.5 : 0.2}
        color={color}
        distance={10}
        decay={2}
      />
    </group>
  );
}
