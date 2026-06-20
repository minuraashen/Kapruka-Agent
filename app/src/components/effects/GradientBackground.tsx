import { useEffect, useRef } from "react";

const VERTEX_SHADER = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;
varying vec2 vUv;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform vec3 u_c3;
uniform vec3 u_c4;

vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1. + 3.0 * C.xxx;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0/7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

vec3 brandGradient(vec2 uv, float time) {
  float noise1 = snoise(vec3(uv * 2.0, time * 0.15));
  float noise2 = snoise(vec3(uv * 3.0 + 100.0, time * 0.2));
  float finalNoise = noise1 * 0.6 + noise2 * 0.4;
  float t = finalNoise * 0.5 + 0.5;

  float phase = t * 3.0;
  float segment = floor(phase);
  float blend = fract(phase);
  blend = smoothstep(0.0, 1.0, blend);

  float idx0 = mod(segment, 4.0);
  float idx1 = mod(segment + 1.0, 4.0);

  vec3 colors[4];
  colors[0] = u_c1;
  colors[1] = u_c2;
  colors[2] = u_c3;
  colors[3] = u_c4;

  vec3 col0 = colors[int(idx0)];
  vec3 col1 = colors[int(idx1)];

  vec3 finalColor = mix(col0, col1, blend);
  float brightness = 0.9 + 0.1 * sin(time * 0.5 + uv.x * 2.0);
  return finalColor * brightness;
}

void main() {
  vec2 uv = vUv;
  vec3 color = brandGradient(uv, u_time);
  float vignette = 1.0 - 0.24 * length(vUv - 0.5);
  color *= vignette;
  gl_FragColor = vec4(color, 1.0);
}
`;

import { useChatStore } from "@/store/chatStore";

const THEME_COLORS = {
  light: [
    [0.79, 0.83, 1.0],
    [0.58, 0.46, 0.94],
    [0.25, 0.55, 0.96],
    [0.80, 0.66, 1.0],
  ],
  midnight: [
    [0.05, 0.05, 0.15],
    [0.10, 0.05, 0.22],
    [0.03, 0.12, 0.28],
    [0.12, 0.06, 0.18],
  ],
  sunset: [
    [1.0, 0.72, 0.55],
    [0.92, 0.42, 0.52],
    [0.58, 0.28, 0.68],
    [1.0, 0.48, 0.62],
  ],
};

export default function GradientBackground() {
  const theme = useChatStore(s => s.theme || "light");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return;

    // Compile shaders
    function createShader(
      gl: WebGLRenderingContext,
      type: number,
      source: string
    ) {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Fullscreen triangle
    const vertices = new Float32Array([-1, -1, 3, -1, -1, 3]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, "u_time");
    const resLoc = gl.getUniformLocation(program, "u_resolution");

    // Get color uniform locations
    const c1Loc = gl.getUniformLocation(program, "u_c1");
    const c2Loc = gl.getUniformLocation(program, "u_c2");
    const c3Loc = gl.getUniformLocation(program, "u_c3");
    const c4Loc = gl.getUniformLocation(program, "u_c4");

    // Initialize current colors
    const initialColors = THEME_COLORS[themeRef.current] || THEME_COLORS.light;
    const currentColors = JSON.parse(JSON.stringify(initialColors));

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas!.width = canvas!.offsetWidth * dpr;
      canvas!.height = canvas!.offsetHeight * dpr;
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
      gl!.uniform2f(resLoc, canvas!.width, canvas!.height);
    }

    resize();
    window.addEventListener("resize", resize);

    function render() {
      // Smoothly interpolate colors towards the active theme's colors
      const targetColors = THEME_COLORS[themeRef.current] || THEME_COLORS.light;
      const speed = 0.035;
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 3; j++) {
          currentColors[i][j] += (targetColors[i][j] - currentColors[i][j]) * speed;
        }
      }

      // Update color uniforms
      gl!.uniform3fv(c1Loc, currentColors[0]);
      gl!.uniform3fv(c2Loc, currentColors[1]);
      gl!.uniform3fv(c3Loc, currentColors[2]);
      gl!.uniform3fv(c4Loc, currentColors[3]);

      gl!.uniform1f(timeLoc, performance.now() * 0.001);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
      }}
    />
  );
}
