import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Html } from "@react-three/drei";
import { Vector3, MathUtils } from "three";
import { Server } from "lucide-react";

// Microservice Node
const MicroserviceNode = ({ position, color, name, status, metrics }) => {
  const mesh = useRef();
  const [hovered, setHover] = useState(false);

  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh
          ref={mesh}
          onPointerOver={() => setHover(true)}
          onPointerOut={() => setHover(false)}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={hovered ? "#ffffff" : color} opacity={0.8} transparent wireframe={hovered} />
        </mesh>
        
        {/* Connection pulse ring */}
        <mesh rotation={[-Math.PI/2, 0, 0]}>
          <ringGeometry args={[0.8, 1, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.3} />
        </mesh>

        <Html position={[0, -1.2, 0]} center zIndexRange={[100, 0]}>
          <div className="bg-base-300 border border-base-100 rounded-lg p-2 shadow-2xl text-xs w-48 text-center pointer-events-none transition-opacity duration-300">
             <div className="font-bold text-base-content flex items-center justify-center gap-1.5">
               <div className={`w-2 h-2 rounded-full ${status === 'healthy' ? 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-warning animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.6)]'}`} />
               {name}
             </div>
             {hovered && (
               <div className="mt-2 text-left bg-base-100 p-2 rounded text-base-content/80 font-mono text-[10px] space-y-1 shadow-inner">
                 <div className="flex justify-between"><span>CPU:</span> <span className={metrics.cpu > 80 ? "text-error font-bold" : "text-success"}>{metrics.cpu}%</span></div>
                 <div className="flex justify-between"><span>RAM:</span> <span>{metrics.ram}MB</span></div>
                 <div className="flex justify-between"><span>Req/sec:</span> <span>{metrics.rps}</span></div>
               </div>
             )}
          </div>
        </Html>
      </Float>
    </group>
  );
};

// Data traffic particle
const Particle = ({ start, end, color }) => {
  const mesh = useRef();
  const [offset] = useState(() => Math.random());
  
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const duration = 2; // seconds
    const t = ((clock.elapsedTime + offset * duration) % duration) / duration; // 0 to 1 repeatedly
    mesh.current.position.lerpVectors(start, end, t);
  });

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[0.08, 8, 8]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
};

export default function MicroservicesPanel() {
  const [logs, setLogs] = useState([]);
  
  useEffect(() => {
    const bootSequence = [
      "[SYSTEM] Initializing Browser-Native Kubernetes Cluster...",
      "[WASM] Compiling Postgres v15 to WebAssembly...",
      "[NETWORK] Establishing virtual p2p mesh via Service Worker...",
      "[POD] api-gateway-7b9cd launched (0.42ms)",
      "[POD] auth-service-x4f starting...",
      "[REDIS] AOF sync enabled. Ready to accept connections.",
      "[WASM] Postgres ready. allocating 8192MB virtual memory.",
      "[ROUTER] Ingress routing established on local virtual port 8080."
    ];
    let i = 0;
    const bootInterval = setInterval(() => {
       if (i < bootSequence.length) {
          setLogs(prev => [...prev, { id: `boot-${i}`, text: bootSequence[i], time: new Date().toLocaleTimeString() }]);
          i++;
       } else {
          clearInterval(bootInterval);
       }
    }, 600);

    const trafficInterval = setInterval(() => {
      if (i >= bootSequence.length) {
        const services = ['api-gateway', 'auth-service', 'redis-cache', 'db-cluster', 'queue-worker'];
        const methods = ['GET', 'POST', 'PUT', 'DELETE'];
        const req = {
          id: Date.now(),
          text: `[TRAFFIC] ${methods[Math.floor(Math.random()*methods.length)]} /api/v1/data -> ${services[Math.floor(Math.random()*services.length)]} (200 OK - ${Math.floor(Math.random()*50)}ms)`,
          time: new Date().toLocaleTimeString()
        };
        setLogs(prev => [...prev.slice(-20), req]);
      }
    }, 1500);

    return () => {
      clearInterval(bootInterval);
      clearInterval(trafficInterval);
    };
  }, []);

  const nodes = [
    { id: 'api', name: 'API Gateway', pos: new Vector3(0, 2, 0), color: '#8b5cf6', status: 'healthy', metrics: { cpu: 12, ram: 256, rps: 1200 } },
    { id: 'auth', name: 'Auth Service', pos: new Vector3(-3, 0, -2), color: '#ec4899', status: 'healthy', metrics: { cpu: 5, ram: 128, rps: 450 } },
    { id: 'db', name: 'Database Cluster', pos: new Vector3(3, -1, -2), color: '#3b82f6', status: 'healthy', metrics: { cpu: 45, ram: 8192, rps: 890 } },
    { id: 'cache', name: 'Redis Cache', pos: new Vector3(-1, -2, 2), color: '#ef4444', status: 'warning', metrics: { cpu: 89, ram: 2048, rps: 5000 } },
    { id: 'worker', name: 'Queue Worker', pos: new Vector3(2, 1, 2), color: '#10b981', status: 'healthy', metrics: { cpu: 22, ram: 512, rps: 120 } },
  ];

  return (
    <div className="h-full bg-[#050510] relative flex flex-col border-l border-base-200 shadow-2xl">
      <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between px-4 py-3 bg-base-300/80 backdrop-blur-md border-b border-base-content/10">
          <div className="flex items-center gap-2 text-white">
              <Server className="size-4 text-purple-400" />
              <span className="font-semibold text-sm drop-shadow-md">Live Platform Architecture</span>
              <span className="ml-2 px-2 py-0.5 rounded-full bg-success/20 border border-success/30 text-success text-[10px] uppercase font-bold tracking-wider animate-pulse flex items-center gap-1.5 shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                  <div className="size-1.5 rounded-full bg-success" /> Running
              </span>
          </div>
          <div className="text-xs text-base-content/60 bg-black/40 px-3 py-1 rounded-full shadow-inner border border-base-100/50 backdrop-blur-sm">
             Scroll & Drag to Inspect Topology
          </div>
      </div>

      <div className="flex-1 flex w-full relative pt-12">
        <div className="w-2/3 h-full relative">
          <Canvas camera={{ position: [0, 5, 8], fov: 45 }} className="w-full h-full">
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
            
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              autoRotate={true}
              autoRotateSpeed={0.5}
              maxPolarAngle={Math.PI / 2 + 0.1}
            />
            
            <gridHelper args={[20, 20, 0x444444, 0x222222]} position={[0, -3, 0]} />

            <group>
              {nodes.map(node => (
                <MicroserviceNode key={node.id} position={node.pos} color={node.color} name={node.name} status={node.status} metrics={node.metrics} />
              ))}

              {/* Simulated Data Streams representing API calls between microservices */}
              <Particle start={nodes[0].pos} end={nodes[1].pos} color="#ec4899" />
              <Particle start={nodes[0].pos} end={nodes[1].pos} color="#ec4899" />
              
              <Particle start={nodes[0].pos} end={nodes[2].pos} color="#3b82f6" />
              <Particle start={nodes[0].pos} end={nodes[2].pos} color="#3b82f6" />
              
              <Particle start={nodes[1].pos} end={nodes[3].pos} color="#ef4444" />
              
              <Particle start={nodes[4].pos} end={nodes[2].pos} color="#10b981" />
              <Particle start={nodes[4].pos} end={nodes[2].pos} color="#10b981" />
              
              <Particle start={nodes[0].pos} end={nodes[4].pos} color="#8b5cf6" />
            </group>
          </Canvas>
        </div>

        {/* WASM Console Logs Panel */}
        <div className="w-1/3 h-full bg-[#0a0a14] border-l border-base-content/10 p-4 font-mono text-[10px] overflow-y-auto custom-scrollbar flex flex-col shadow-inner">
           <div className="text-primary font-bold mb-4 flex items-center gap-2 border-b border-primary/20 pb-2 uppercase tracking-wide">
             <div className="size-2 rounded bg-primary animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]"/>
             stdout (WASM Hypervisor)
           </div>
           <div className="flex-1 flex flex-col gap-2 mt-2">
             {logs.map(log => (
                <div key={log.id} className="leading-relaxed">
                  <span className="text-base-content/40 mr-2">[{log.time}]</span>
                  <span className={
                     log.text.includes("[TRAFFIC]") ? "text-info/80" : 
                     log.text.includes("[WASM]") ? "text-warning" : 
                     log.text.includes("[SYSTEM]") ? "text-success font-bold" :
                     log.text.includes("[REDIS]") || log.text.includes("[POD]") ? "text-error/80" :
                     "text-base-content/80"
                  }>{log.text}</span>
                </div>
             ))}
             {!logs.length && <div className="text-base-content/30 italic">Awaiting container dispatch...</div>}
           </div>
        </div>
      </div>
    </div>
  );
}
