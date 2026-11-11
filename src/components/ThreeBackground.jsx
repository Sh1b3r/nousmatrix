import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 28;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Group for Nous Matrix Core
    const matrixGroup = new THREE.Group();
    scene.add(matrixGroup);

    // 1. Central Geometric Icosahedron (The Matrix Eye)
    const icoGeo = new THREE.IcosahedronGeometry(7, 1);
    const icoMat = new THREE.MeshBasicMaterial({
      color: 0xFF3C3C,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });
    const icoMesh = new THREE.Mesh(icoGeo, icoMat);
    matrixGroup.add(icoMesh);

    // Inner Dodecahedron Core
    const dodecaGeo = new THREE.DodecahedronGeometry(4, 0);
    const dodecaMat = new THREE.MeshBasicMaterial({
      color: 0x9B93B3,
      wireframe: true,
      transparent: true,
      opacity: 0.22
    });
    const dodecaMesh = new THREE.Mesh(dodecaGeo, dodecaMat);
    matrixGroup.add(dodecaMesh);

    // 2. Outer Ring Orbital
    const ringGeo = new THREE.TorusGeometry(12, 0.05, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xFF3C3C,
      transparent: true,
      opacity: 0.25
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 3;
    matrixGroup.add(ringMesh);

    // Second Tilted Ring
    const ringGeo2 = new THREE.TorusGeometry(14, 0.04, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x3F2E64,
      transparent: true,
      opacity: 0.35
    });
    const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
    ringMesh2.rotation.y = Math.PI / 4;
    matrixGroup.add(ringMesh2);

    // 3. Floating Matrix Dust Particles
    const particleCount = 180;
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 60;
      posArray[i + 1] = (Math.random() - 0.5) * 45;
      posArray[i + 2] = (Math.random() - 0.5) * 40;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.22,
      color: 0xFF3C3C,
      transparent: true,
      opacity: 0.4
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Mouse Parallax Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove);

    // Window Resize
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // Animation Loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Smooth mouse follow
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      // Rotate Nous Matrix
      matrixGroup.rotation.y += 0.003;
      matrixGroup.rotation.x += 0.0015;
      ringMesh.rotation.z += 0.002;
      ringMesh2.rotation.z -= 0.002;

      matrixGroup.position.x = targetX * 2.5;
      matrixGroup.position.y = -targetY * 2.0;

      particles.rotation.y -= 0.0006;
      particles.rotation.x += 0.0003;

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      icoGeo.dispose();
      icoMat.dispose();
      dodecaGeo.dispose();
      dodecaMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.5
      }}
    />
  );
}

