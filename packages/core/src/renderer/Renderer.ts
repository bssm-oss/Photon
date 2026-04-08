import { Shader } from "./Shader";
import { Sprite } from "./Sprite";
import { Transform2D } from "../view/Camera2D";
import { Mat3 } from "../math/Mat3";

const VERT_SRC = `#version 300 es
layout(location = 0) in vec2 aPosition;
layout(location = 1) in vec2 aTexCoord;
layout(location = 2) in vec4 aColor;

uniform mat3 uViewProj;

out vec2 vTexCoord;
out vec4 vColor;

void main() {
  vec3 pos = uViewProj * vec3(aPosition, 1.0);
  gl_Position = vec4(pos.xy, 0.0, 1.0);
  vTexCoord = aTexCoord;
  vColor = aColor;
}
`;

const FRAG_SRC = `#version 300 es
precision mediump float;

in vec2 vTexCoord;
in vec4 vColor;

uniform sampler2D uTexture;
uniform float uUseTexture;

out vec4 fragColor;

void main() {
  vec4 texColor = mix(vec4(1.0), texture(uTexture, vTexCoord), uUseTexture);
  fragColor = vColor * texColor;
}
`;

interface BatchVertex {
  x: number; y: number;
  u: number; v: number;
  r: number; g: number; b: number; a: number;
}

const FLOATS_PER_VERTEX = 8;
const MAX_BATCH = 10000;

export class Renderer {
  private gl: WebGL2RenderingContext;
  private shader: Shader;
  private vao: WebGLVertexArrayObject;
  private vbo: WebGLBuffer;
  private vertices: Float32Array;
  private vertexCount = 0;
  private currentTexture: WebGLTexture | null = null;

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      premultipliedAlpha: false,
    });
    if (!gl) throw new Error("WebGL2 not supported");

    this.gl = gl;
    this.shader = new Shader(gl, VERT_SRC, FRAG_SRC);
    this.vertices = new Float32Array(MAX_BATCH * 6 * FLOATS_PER_VERTEX);

    this.vao = gl.createVertexArray()!;
    this.vbo = gl.createBuffer()!;

    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices.byteLength, gl.DYNAMIC_DRAW);

    const stride = FLOATS_PER_VERTEX * 4;
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, stride, 8);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, stride, 16);

    gl.bindVertexArray(null);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  clear(r: number = 0, g: number = 0, b: number = 0, a: number = 1): void {
    this.gl.clearColor(r, g, b, a);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }

  begin(viewProj: Mat3): void {
    this.shader.use();
    this.shader.setUniformMat3("uViewProj", viewProj.data);
    this.gl.bindVertexArray(this.vao);
  }

  drawSprite(transform: Transform2D, sprite: Sprite): void {
    const tex = sprite.texture ?? null;
    if (tex !== this.currentTexture || this.vertexCount + 6 > MAX_BATCH * 6) {
      this.flush();
      this.currentTexture = tex;
    }

    if (tex) {
      this.gl.activeTexture(this.gl.TEXTURE0);
      this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
      this.shader.setUniformInt("uTexture", 0);
      this.shader.setUniformFloat("uUseTexture", 1.0);
    } else {
      this.shader.setUniformFloat("uUseTexture", 0.0);
    }

    const hw = sprite.width * 0.5;
    const hh = sprite.height * 0.5;
    const mat = transform.getLocalMatrix();

    const corners = [
      { x: -hw, y: -hh, u: sprite.texCoordU, v: sprite.texCoordV },
      { x:  hw, y: -hh, u: sprite.texCoordU + sprite.texCoordW, v: sprite.texCoordV },
      { x:  hw, y:  hh, u: sprite.texCoordU + sprite.texCoordW, v: sprite.texCoordV + sprite.texCoordH },
      { x: -hw, y:  hh, u: sprite.texCoordU, v: sprite.texCoordV + sprite.texCoordH },
    ];

    const transformed = corners.map((c) => {
      const p = mat.transformPoint({ x: c.x, y: c.y } as any);
      return { x: p.x, y: p.y, u: c.u, v: c.v };
    });

    const v = this.vertices;
    let i = this.vertexCount * FLOATS_PER_VERTEX;

    const push = (idx: number) => {
      const t = transformed[idx];
      v[i++] = t.x; v[i++] = t.y;
      v[i++] = t.u; v[i++] = t.v;
      v[i++] = sprite.colorR; v[i++] = sprite.colorG;
      v[i++] = sprite.colorB; v[i++] = sprite.colorA;
    };

    push(0); push(1); push(2);
    push(0); push(2); push(3);

    this.vertexCount += 6;
  }

  flush(): void {
    if (this.vertexCount === 0) return;
    this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.vertices, 0, this.vertexCount * FLOATS_PER_VERTEX);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertexCount);
    this.vertexCount = 0;
  }

  end(): void {
    this.flush();
    this.gl.bindVertexArray(null);
    this.currentTexture = null;
  }

  resize(width: number, height: number): void {
    this.gl.viewport(0, 0, width, height);
  }

  get context(): WebGL2RenderingContext { return this.gl; }

  destroy(): void {
    this.shader.destroy();
    this.gl.deleteBuffer(this.vbo);
    this.gl.deleteVertexArray(this.vao);
  }
}
