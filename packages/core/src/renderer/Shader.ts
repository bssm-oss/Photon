export class Shader {
  readonly program: WebGLProgram;

  constructor(
    private gl: WebGL2RenderingContext,
    vertexSrc: string,
    fragmentSrc: string
  ) {
    const vert = this.compile(gl.VERTEX_SHADER, vertexSrc);
    const frag = this.compile(gl.FRAGMENT_SHADER, fragmentSrc);
    this.program = gl.createProgram()!;
    gl.attachShader(this.program, vert);
    gl.attachShader(this.program, frag);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(this.program);
      gl.deleteProgram(this.program);
      throw new Error(`Shader link error: ${info}`);
    }

    gl.deleteShader(vert);
    gl.deleteShader(frag);
  }

  private compile(type: number, source: string): WebGLShader {
    const shader = this.gl.createShader(type)!;
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const info = this.gl.getShaderInfoLog(shader);
      this.gl.deleteShader(shader);
      throw new Error(`Shader compile error: ${info}`);
    }
    return shader;
  }

  use(): void { this.gl.useProgram(this.program); }

  getAttribLocation(name: string): number {
    return this.gl.getAttribLocation(this.program, name);
  }

  getUniformLocation(name: string): WebGLUniformLocation | null {
    return this.gl.getUniformLocation(this.program, name);
  }

  setUniformMat3(name: string, mat: Float32Array): void {
    const loc = this.getUniformLocation(name);
    if (loc) this.gl.uniformMatrix3fv(loc, false, mat);
  }

  setUniformVec4(name: string, x: number, y: number, z: number, w: number): void {
    const loc = this.getUniformLocation(name);
    if (loc) this.gl.uniform4f(loc, x, y, z, w);
  }

  setUniformVec2(name: string, x: number, y: number): void {
    const loc = this.getUniformLocation(name);
    if (loc) this.gl.uniform2f(loc, x, y);
  }

  setUniformFloat(name: string, value: number): void {
    const loc = this.getUniformLocation(name);
    if (loc) this.gl.uniform1f(loc, value);
  }

  setUniformInt(name: string, value: number): void {
    const loc = this.getUniformLocation(name);
    if (loc) this.gl.uniform1i(loc, value);
  }

  destroy(): void { this.gl.deleteProgram(this.program); }
}
