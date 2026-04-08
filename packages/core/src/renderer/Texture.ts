export class Texture {
  readonly glTexture: WebGLTexture;
  public width = 0;
  public height = 0;

  constructor(private gl: WebGL2RenderingContext) {
    this.glTexture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  }

  static fromImage(gl: WebGL2RenderingContext, img: HTMLImageElement): Texture {
    const tex = new Texture(gl);
    tex.width = img.width;
    tex.height = img.height;
    gl.bindTexture(gl.TEXTURE_2D, tex.glTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);
    return tex;
  }

  static fromColor(gl: WebGL2RenderingContext, r: number, g: number, b: number, a: number): Texture {
    const tex = new Texture(gl);
    tex.width = 1;
    tex.height = 1;
    gl.bindTexture(gl.TEXTURE_2D, tex.glTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([r * 255, g * 255, b * 255, a * 255]));
    return tex;
  }

  destroy(): void {
    this.gl.deleteTexture(this.glTexture);
  }
}
